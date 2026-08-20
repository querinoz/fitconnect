import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/v1/readiness/compute/route";
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

function authed(body: unknown) {
  const token = encodeUnsignedTestJwt({ sub: "user-a", email: "user-a@fitconnect.app" });
  return new Request("http://localhost/api/v1/readiness/compute", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

describe("POST /api/v1/readiness/compute", () => {
  beforeEach(() => {
    vi.mocked(lookupIdentityRole).mockResolvedValue("athlete");
  });

  it("rejects unauthenticated callers", async () => {
    const res = await POST(
      new Request("http://localhost/api/v1/readiness/compute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hrvMs: 68 })
      })
    );
    expect(res.status).toBe(401);
  });

  it("should_return_score_between_0_and_100", async () => {
    const res = await POST(authed({ hrvMs: 68, sleepHours: 8, strainScore: 20 }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.score).toBeGreaterThanOrEqual(0);
    expect(body.score).toBeLessThanOrEqual(100);
    expect(["optimal", "good", "moderate", "poor"]).toContain(body.status);
  });

  it("should_return_422_for_invalid_body", async () => {
    const res = await POST(authed({}));
    expect(res.status).toBe(422);
  });

  it("should_clamp_hrv_zero_without_negative_score", async () => {
    const res = await POST(authed({ hrvMs: 0, strainScore: 0 }));
    const body = await res.json();
    expect(body.score).toBeGreaterThanOrEqual(0);
  });
});
