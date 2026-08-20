import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/v1/integrations/status/route";
import { encodeUnsignedTestJwt } from "@/lib/auth/firebase-id-token";
import { lookupIdentityRole } from "@/lib/identity/repository";

vi.mock("@/lib/auth/supabase/client", () => ({
  isDemoMode: () => false
}));

vi.mock("@/lib/firebase/config", () => ({
  isFirebaseWebConfigured: () => true
}));

vi.mock("@/lib/identity/repository", () => ({
  lookupIdentityRole: vi.fn()
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => undefined }),
  headers: async () => new Headers()
}));

vi.mock("@/lib/security/rate-limit", () => ({
  enforceRateLimit: async () => null
}));

function authed(uid: string, path: string) {
  const token = encodeUnsignedTestJwt({ sub: uid, email: `${uid}@fitconnect.app` });
  return new Request(`http://localhost${path}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

describe("integrations status route", () => {
  beforeEach(() => {
    vi.mocked(lookupIdentityRole).mockResolvedValue("athlete");
  });

  it("rejects unauthenticated callers", async () => {
    const response = await GET(new Request("http://localhost/api/v1/integrations/status"));
    expect(response.status).toBe(401);
  });

  it("rejects athleteId for another user", async () => {
    const response = await GET(
      authed("user-a", "/api/v1/integrations/status?athleteId=user-b")
    );
    expect(response.status).toBe(403);
  });

  it("does not leak activity payloads or tokens to the owner", async () => {
    const response = await GET(authed("user-a", "/api/v1/integrations/status"));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.athleteId).toBe("user-a");
    expect(body.strava.activities).toBeUndefined();
    expect(body.syncLogs).toBeUndefined();
    expect(JSON.stringify(body)).not.toMatch(/accessToken|refreshToken|client_secret/i);
  });
});
