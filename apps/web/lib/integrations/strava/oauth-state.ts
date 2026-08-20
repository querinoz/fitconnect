import { createHmac, timingSafeEqual } from "crypto";

function oauthStateSecret(): string | null {
  const secret =
    process.env.STRAVA_OAUTH_STATE_SECRET ?? process.env.STRAVA_TOKEN_ENCRYPTION_KEY;
  if (!secret?.trim() || /fitconnect-dev/i.test(secret)) return null;
  return secret;
}

export function signOAuthState(athleteId: string): string {
  const secret = oauthStateSecret();
  if (!secret) {
    throw new Error("oauth_state_secret_missing");
  }
  const payload = JSON.stringify({ athleteId, ts: Date.now() });
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return Buffer.from(JSON.stringify({ p: payload, s: sig })).toString("base64url");
}

export function verifyOAuthState(stateRaw: string): string | null {
  const secret = oauthStateSecret();
  if (!secret) return null;
  try {
    const { p, s } = JSON.parse(Buffer.from(stateRaw, "base64url").toString()) as {
      p: string;
      s: string;
    };
    const expected = createHmac("sha256", secret).update(p).digest("base64url");
    const a = Buffer.from(s);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const parsed = JSON.parse(p) as { athleteId?: string; ts?: number };
    if (!parsed.athleteId) return null;
    if (parsed.ts && Date.now() - parsed.ts > 1000 * 60 * 30) return null;
    return parsed.athleteId;
  } catch {
    return null;
  }
}
