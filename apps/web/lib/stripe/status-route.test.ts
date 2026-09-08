import { describe, expect, it, vi, afterEach } from "vitest";
import { GET } from "@/app/api/stripe/status/route";

vi.mock("@/lib/api/require-auth", () => ({
  requireAuth: vi.fn(async () => ({
    ok: true as const,
    user: { id: "u1", role: "coach", email: "c@fitconnect.local" },
    demo: false
  }))
}));

vi.mock("@/lib/stripe/persistence", () => ({
  getSubscriptionPg: vi.fn(async () => ({
    plan_id: "athlete",
    status: "active",
    grace_period_ends_at: null
  })),
  getConnectAccountPg: vi.fn(async () => ({
    charges_enabled: true,
    payouts_enabled: true,
    onboarding_complete: true
  }))
}));

vi.mock("@/lib/stripe/server", () => ({
  isStripeLive: vi.fn(() => false)
}));

import { isStripeLive } from "@/lib/stripe/server";
import { getConnectAccountPg, getSubscriptionPg } from "@/lib/stripe/persistence";

describe("stripe status route fail-closed", () => {
  afterEach(() => {
    vi.mocked(isStripeLive).mockReturnValue(false);
  });

  it("never reports live connect enabled without secrets", async () => {
    const res = await GET(new Request("http://localhost/api/stripe/status"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.live).toBe(false);
    expect(json.configured).toBe(false);
    expect(json.subscription).toBeNull();
    expect(json.connect).toBeNull();
    expect(getSubscriptionPg).not.toHaveBeenCalled();
    expect(getConnectAccountPg).not.toHaveBeenCalled();
  });

  it("surfaces connect flags only when stripe is live", async () => {
    vi.mocked(isStripeLive).mockReturnValue(true);
    const res = await GET(new Request("http://localhost/api/stripe/status"));
    const json = await res.json();
    expect(json.live).toBe(true);
    expect(json.configured).toBe(true);
    expect(json.connect).toEqual({
      chargesEnabled: true,
      payoutsEnabled: true,
      onboardingComplete: true
    });
  });
});
