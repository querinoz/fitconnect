/**
 * Firebase ID token VERIFICATION.
 *
 * SECURITY: this module is the only sanctioned way to establish caller identity
 * from a Firebase ID token. It verifies the RS256 signature against Google's
 * published public keys and validates issuer, audience and lifetime.
 *
 * `parseFirebaseIdToken` (./firebase-id-token.ts) decodes WITHOUT verifying and
 * must never be used to authenticate a request. Before this module existed,
 * `requireAuth` trusted that decoder, so anyone could mint `{"alg":"none"}` with
 * an arbitrary `sub` and be accepted as that user.
 *
 * Zero runtime dependencies: Web Crypto is available in both the Node and Edge
 * runtimes, so this works in route handlers and middleware alike.
 */
import type { FirebaseIdClaims } from "./firebase-id-token";
import { readFirebaseWebOptions } from "@/lib/firebase/config";

/** Google's public keys for Firebase ID tokens, in JWK form. */
const FIREBASE_JWK_URL =
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

/** Clock-skew tolerance in seconds. */
const SKEW_SEC = 60;

/** Floor for key cache TTL, seconds. */
const MIN_KEY_TTL_SEC = 300;

export type VerifyOptions = {
  /** Overrides the project id from env. Primarily for tests. */
  projectId?: string | null;
  nowEpochSec?: number;
};

export type FirebaseTokenVerifier = (
  token: string | null | undefined,
  options?: VerifyOptions
) => Promise<FirebaseIdClaims | null>;

type Jwk = JsonWebKey & { kid?: string; alg?: string; use?: string };

let keyCache: { keys: Map<string, CryptoKey>; expiresAtMs: number } | null = null;
let inflight: Promise<Map<string, CryptoKey>> | null = null;

function base64UrlToArrayBuffer(segment: string): ArrayBuffer {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return buffer;
}

function base64UrlToBytes(segment: string): Uint8Array {
  return new Uint8Array(base64UrlToArrayBuffer(segment));
}

function base64UrlToJson(segment: string): Record<string, unknown> {
  return JSON.parse(new TextDecoder().decode(base64UrlToBytes(segment))) as Record<
    string,
    unknown
  >;
}

function maxAgeSeconds(cacheControl: string | null): number {
  if (!cacheControl) return 0;
  const match = /max-age\s*=\s*(\d+)/i.exec(cacheControl);
  return match ? Number(match[1]) : 0;
}

async function fetchKeys(): Promise<Map<string, CryptoKey>> {
  const response = await fetch(FIREBASE_JWK_URL, { cache: "no-store" });
  if (!response.ok) throw new Error(`firebase_jwks_http_${response.status}`);

  const body = (await response.json()) as { keys?: Jwk[] };
  const keys = new Map<string, CryptoKey>();

  for (const jwk of body.keys ?? []) {
    if (!jwk.kid) continue;
    if (jwk.alg && jwk.alg !== "RS256") continue;
    const key = await crypto.subtle.importKey(
      "jwk",
      { ...jwk, alg: "RS256", ext: true },
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"]
    );
    keys.set(jwk.kid, key);
  }

  if (keys.size === 0) throw new Error("firebase_jwks_empty");

  const ttl = Math.max(MIN_KEY_TTL_SEC, maxAgeSeconds(response.headers.get("cache-control")));
  keyCache = { keys, expiresAtMs: Date.now() + ttl * 1000 };
  return keys;
}

/** Fetch once per cache window; concurrent callers share one request. */
async function getKeys(forceRefresh = false): Promise<Map<string, CryptoKey>> {
  if (!forceRefresh && keyCache && keyCache.expiresAtMs > Date.now()) {
    return keyCache.keys;
  }
  if (!inflight) {
    inflight = fetchKeys().finally(() => {
      inflight = null;
    });
  }
  return inflight;
}

/** Test seam. Installed by tests/setup/vitest.setup.ts; refuses to load outside tests. */
let testVerifier: FirebaseTokenVerifier | null = null;

export function __setFirebaseTokenVerifierForTests(verifier: FirebaseTokenVerifier | null): void {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("__setFirebaseTokenVerifierForTests is test-only");
  }
  testVerifier = verifier;
}

/** Drops the cached signing keys. Exposed for tests. */
export function __resetFirebaseKeyCacheForTests(): void {
  keyCache = null;
  inflight = null;
}

/**
 * Verify a Firebase ID token end to end.
 *
 * Returns the claims on success, or `null` for any failure — malformed token,
 * unknown key id, bad signature, wrong issuer/audience, expired, or no project
 * id configured. Never throws, and never returns claims it did not verify.
 */
export async function verifyFirebaseIdToken(
  token: string | null | undefined,
  options: VerifyOptions = {}
): Promise<FirebaseIdClaims | null> {
  if (testVerifier) return testVerifier(token, options);
  if (!token) return null;

  const parts = token.trim().split(".");
  if (parts.length !== 3) return null;

  const projectId = options.projectId ?? readFirebaseWebOptions().app?.projectId ?? null;
  // Fail closed: without a project id we cannot pin issuer/audience.
  if (!projectId) return null;

  const now = options.nowEpochSec ?? Math.floor(Date.now() / 1000);

  try {
    const header = base64UrlToJson(parts[0]!);
    if (header.alg !== "RS256") return null;
    const kid = typeof header.kid === "string" ? header.kid : null;
    if (!kid) return null;

    // A rotated key is not in the cache yet; refresh once before giving up.
    let key = (await getKeys()).get(kid);
    if (!key) key = (await getKeys(true)).get(kid);
    if (!key) return null;

    const signed = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
    const signature = base64UrlToArrayBuffer(parts[2]!);
    const signatureValid = await crypto.subtle.verify(
      { name: "RSASSA-PKCS1-v1_5" },
      key,
      signature,
      signed
    );
    if (!signatureValid) return null;

    const payload = base64UrlToJson(parts[1]!);

    if (payload.iss !== `https://securetoken.google.com/${projectId}`) return null;
    if (payload.aud !== projectId) return null;

    const sub = typeof payload.sub === "string" ? payload.sub.trim() : "";
    if (!sub) return null;

    const exp = Number(payload.exp);
    if (!Number.isFinite(exp) || exp + SKEW_SEC <= now) return null;

    const iat = Number(payload.iat);
    if (Number.isFinite(iat) && iat - SKEW_SEC > now) return null;

    const authTime = Number(payload.auth_time);
    if (Number.isFinite(authTime) && authTime - SKEW_SEC > now) return null;

    return {
      sub,
      email: typeof payload.email === "string" ? payload.email : undefined,
      email_verified: payload.email_verified === true,
      name: typeof payload.name === "string" ? payload.name : undefined,
      picture: typeof payload.picture === "string" ? payload.picture : undefined,
      exp,
      role: typeof payload.role === "string" ? payload.role : undefined
    };
  } catch {
    return null;
  }
}
