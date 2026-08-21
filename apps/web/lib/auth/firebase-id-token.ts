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
 * Decode a Firebase ID token payload.
 * Signature verification is performed by Supabase PostgREST when the token is
 * used as a Data API access token. This helper only rejects malformed/expired
 * tokens so API routes can bind `sub` before RLS runs.
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

export function encodeUnsignedTestJwt(claims: Omit<FirebaseIdClaims, "exp"> & { exp?: number }): string {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      ...claims,
      exp: claims.exp ?? Math.floor(Date.now() / 1000) + 3600
    })
  ).toString("base64url");
  return `${header}.${payload}.testsig`;
}
