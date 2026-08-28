import { describe, expect, it } from "vitest";
import { planAmountCents, planDisplayName, resolveStripePriceId } from "./plans";

describe("stripe plans", () => {
  it("maps athlete monthly to 1200 cents", () => {
    expect(planAmountCents("athlete", "monthly")).toBe(1200);
  });

  it("maps team annual to 2400 cents", () => {
    expect(planAmountCents("team", "annual")).toBe(2400);
  });

  it("returns display names", () => {
    expect(planDisplayName("coach")).toContain("Coach");
  });

  it("ignores placeholder price env vars", () => {
    process.env.STRIPE_PRICE_ATHLETE_MONTHLY = "PASTE_PRICE_ID";
    expect(resolveStripePriceId("athlete", "monthly")).toBeNull();
    delete process.env.STRIPE_PRICE_ATHLETE_MONTHLY;
  });
});
