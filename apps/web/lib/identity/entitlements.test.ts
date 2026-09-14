import { describe, expect, it } from "vitest";
import { effectiveCapabilities, isEntitlementLive } from "@fitconnect/types";

describe("isEntitlementLive", () => {
  it("is live for active and trialing", () => {
    expect(isEntitlementLive("active", null)).toBe(true);
    expect(isEntitlementLive("trialing", null)).toBe(true);
  });

  it("keeps past_due live only inside grace", () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    const past = new Date(Date.now() - 86_400_000).toISOString();
    expect(isEntitlementLive("past_due", future)).toBe(true);
    expect(isEntitlementLive("past_due", past)).toBe(false);
    expect(isEntitlementLive("past_due", null)).toBe(false);
  });

  it("is not live when canceled or none", () => {
    expect(isEntitlementLive("canceled", null)).toBe(false);
    expect(isEntitlementLive("none", null)).toBe(false);
  });
});

describe("effectiveCapabilities", () => {
  it("keeps coach while the plan is live", () => {
    expect(effectiveCapabilities(["athlete", "coach"], ["athlete", "coach"], true)).toEqual([
      "athlete",
      "coach"
    ]);
  });

  it("drops coach when the plan lapses", () => {
    expect(effectiveCapabilities(["athlete", "coach"], ["athlete"], false)).toEqual(["athlete"]);
  });
});
