import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/v1/account/delete/route";
import { encodeUnsignedTestJwt } from "@/lib/auth/firebase-id-token";
import { lookupIdentityRole, deleteOwnIdentity } from "@/lib/identity/repository";

vi.mock("@/lib/auth/supabase/client", () => ({
  isDemoMode: () => false
}));

vi.mock("@/lib/firebase/config", () => ({
  isFirebaseWebConfigured: () => true
}));

vi.mock("@/lib/identity/repository", () => ({
  lookupIdentityRole: vi.fn(),
  deleteOwnIdentity: vi.fn()
}));

vi.mock("@/lib/integrations/strava/service", () => ({
  purgeStravaForAthlete: vi.fn()
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => undefined, delete: vi.fn() }),
  headers: async () => new Headers()
}));

vi.mock("@/lib/security/rate-limit", () => ({
  enforceRateLimit: async () => null
}));

function authed(uid: string, body: unknown) {
  const token = encodeUnsignedTestJwt({ sub: uid, email: `${uid}@fitconnect.app` });
  return new Request("http://localhost/api/v1/account/delete", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

describe("account deletion", () => {
  beforeEach(() => {
    vi.mocked(lookupIdentityRole).mockResolvedValue("athlete");
    vi.mocked(deleteOwnIdentity).mockResolvedValue({ ok: true, error: null, status: 200 });
  });

  it("rejects unauthenticated callers", async () => {
    const response = await POST(
      new Request("http://localhost/api/v1/account/delete", { method: "POST", body: "{}" })
    );
    expect(response.status).toBe(401);
  });

  it("requires explicit confirmation", async () => {
    const response = await POST(authed("user-a", { confirm: "nope" }));
    expect(response.status).toBe(400);
  });

  it("deletes app data for the authenticated user only", async () => {
    const response = await POST(authed("user-a", { confirm: "DELETE" }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.uid).toBe("user-a");
    expect(body.firebaseAuth).toBe("PENDING_HUMAN");
    expect(deleteOwnIdentity).toHaveBeenCalledWith(
      expect.objectContaining({ uid: "user-a" })
    );
  });
});
