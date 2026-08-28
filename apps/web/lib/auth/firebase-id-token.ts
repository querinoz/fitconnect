export { FIREBASE_ID_COOKIE } from "./session-cookie";

export type FirebaseIdClaims = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  exp: number;
  /** PostgREST role claim required by Supabase third-party Firebase Auth. */
  role?: string;
};

function decodeSegment(segment: string): unknown {
  const padded = segment.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((segment.length + 3) % 4);
  const json = Buffer.from(padded, "base64").toString("utf8");
  return JSON.parse(json) as unknown;
}

/**
 * UNSAFE: decode a Firebase ID token payload WITHOUT verifying its signature.
 *
 * Do NOT use this to authenticate a request. It cannot tell a Google-signed
 * token from one an attacker minted with `{"alg":"none"}` and an arbitrary
 * `sub`. Use `verifyFirebaseIdToken` from "@/lib/auth/firebase-verify" for any
 * decision that grants access.
 *
 * Kept only for non-security display/inspection paths and for tests.
 */
export function parseFirebaseIdToken(
  token: string | null | undefined,
  nowEpochSec: number = Math.floor(Date.now() / 1000)
): FirebaseIdClaims | null {
  if (!token) return null;
  const parts = token.trim().split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = decodeSegment(parts[1]!) as Record<string, unknown>;
    const sub = typeof payload.sub === "string" ? payload.sub.trim() : "";
    if (!sub) return null;
    const exp = typeof payload.exp === "number" ? payload.exp : Number(payload.exp);
    if (!Number.isFinite(exp) || exp <= nowEpochSec) return null;
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

/** Test-only. Produces an UNSIGNED token; refuses to run outside the test env. */
export function encodeUnsignedTestJwt(claims: Omit<FirebaseIdClaims, "exp"> & { exp?: number }): string {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("encodeUnsignedTestJwt is test-only");
  }
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      ...claims,
      exp: claims.exp ?? Math.floor(Date.now() / 1000) + 3600
    })
  ).toString("base64url");
  return `${header}.${payload}.testsig`;
}
