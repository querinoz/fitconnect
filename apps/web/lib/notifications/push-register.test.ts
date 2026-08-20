import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/v1/push/register/route";
import { encodeUnsignedTestJwt } from "@/lib/auth/firebase-id-token";
import { lookupIdentityRole } from "@/lib/identity/repository";
import { registerPushToken } from "@/lib/notifications/push-store";

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

vi.mock("@/lib/notifications/push-store", () => ({
  registerPushToken: vi.fn()
}));

function authed(uid: string, body: unknown) {
  const token = encodeUnsignedTestJwt({ sub: uid, email: `${uid}@fitconnect.app` });
  return new Request("http://localhost/api/v1/push/register", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

describe("push register IDOR", () => {
  beforeEach(() => {
    vi.mocked(lookupIdentityRole).mockResolvedValue("athlete");
    vi.mocked(registerPushToken).mockResolvedValue(undefined as never);
  });

  it("rejects unauthenticated callers", async () => {
    const response = await POST(
      new Request("http://localhost/api/v1/push/register", {
        method: "POST",
        body: JSON.stringify({ userId: "user-b", token: "t" })
      })
    );
    expect(response.status).toBe(401);
  });

  it("rejects registering a token for another user", async () => {
    const response = await POST(authed("user-a", { userId: "user-b", token: "t" }));
    expect(response.status).toBe(403);
    expect(registerPushToken).not.toHaveBeenCalled();
  });

  it("binds the token to the authenticated user", async () => {
    const response = await POST(authed("user-a", { userId: "user-a", token: "t", platform: "android" }));
    expect(response.status).toBe(200);
    expect(registerPushToken).toHaveBeenCalledWith({
      userId: "user-a",
      token: "t",
      platform: "android"
    });
  });
});
