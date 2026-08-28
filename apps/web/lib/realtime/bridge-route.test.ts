import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/api/v1/realtime/bridge/route";
import { resetBridgeStoreForTests } from "@/lib/realtime/bridge-store";
import { encodeUnsignedTestJwt } from "@/lib/auth/firebase-id-token";

vi.mock("@/lib/auth/supabase/client", () => ({
  isDemoMode: () => false
}));

vi.mock("@/lib/firebase/config", () => ({
  isFirebaseWebConfigured: () => true
}));

vi.mock("@/lib/identity/repository", () => ({
  lookupIdentityRole: vi.fn().mockResolvedValue("athlete")
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => undefined }),
  headers: async () => new Headers()
}));

vi.mock("@/lib/platform/realtime/resolve-transport", () => ({
  resolveTransport: () => ({ publish: vi.fn() })
}));

function authed(uid: string, init?: RequestInit) {
  const token = encodeUnsignedTestJwt({ sub: uid, email: `${uid}@fitconnect.app` });
  return new Request("http://localhost/api/v1/realtime/bridge", {
  ...init,
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...(init?.headers ?? {})
  }
  });
}

describe("/api/v1/realtime/bridge", () => {
  beforeEach(() => {
    resetBridgeStoreForTests();
    vi.clearAllMocks();
  });

  it("rejects cross-user channel reads", async () => {
    const getReq = new Request(
      "http://localhost/api/v1/realtime/bridge?channel=athlete:athlete-b",
      { headers: authed("athlete-a").headers }
    );
    const forbidden = await GET(getReq);
    expect(forbidden.status).toBe(403);
  });

  it("buffers and returns live ticks for own channel", async () => {
    const payload = {
      kind: "live-tick" as const,
      athleteId: "athlete-a",
      hr: 150,
      pace: 5.2,
      cadence: 170,
      elapsedSec: 60,
      at: new Date().toISOString()
    };
    const postRes = await POST(
      authed("athlete-a", {
        method: "POST",
        body: JSON.stringify({ channel: "athlete:athlete-a", payload })
      })
    );
    expect(postRes.status).toBe(200);
    const getRes = await GET(
      new Request("http://localhost/api/v1/realtime/bridge?channel=athlete:athlete-a&since=0", {
        headers: authed("athlete-a").headers
      })
    );
    const body = await getRes.json();
    expect(body.messages).toHaveLength(1);
    expect(body.messages[0].payload.kind).toBe("live-tick");
  });
});
