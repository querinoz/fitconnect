import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/v1/video/token/route";
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

vi.mock("@/lib/video/livekit", () => ({
  isLiveKitConfigured: () => false,
  createLiveKitToken: vi.fn()
}));

function authed(uid: string, body: unknown) {
  const token = encodeUnsignedTestJwt({ sub: uid, email: `${uid}@fitconnect.app` });
  return new Request("http://localhost/api/v1/video/token", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

describe("video token IDOR", () => {
  beforeEach(() => {
    vi.mocked(lookupIdentityRole).mockResolvedValue("athlete");
  });

  it("rejects unauthenticated callers", async () => {
    const response = await POST(
      new Request("http://localhost/api/v1/video/token", {
        method: "POST",
        body: JSON.stringify({
          roomName: "session-1",
          participantName: "A",
          participantId: "user-a"
        })
      })
    );
    expect(response.status).toBe(401);
  });

  it("rejects minting a token as another participant", async () => {
    const response = await POST(
      authed("user-a", {
        roomName: "session-1",
        participantName: "B",
        participantId: "user-b"
      })
    );
    expect(response.status).toBe(403);
  });

  it("allows the authenticated participant", async () => {
    const response = await POST(
      authed("user-a", {
        roomName: "session-1",
        participantName: "A",
        participantId: "user-a"
      })
    );
    expect(response.status).toBe(200);
  });
});
