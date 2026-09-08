import { describe, expect, it } from "vitest";
import {
  createDemoCheckout,
  createDemoConnectAccount,
  createDemoSubscription,
  DEMO_CHECKOUT_STATUS,
  DEMO_SUBSCRIPTION_STATUS
} from "./demo";
import { COACH_TAKE_HOME_RATE, PLATFORM_SUBSCRIPTION_EUR } from "./constants";

describe("stripe demo", () => {
  it("splits session revenue 85/15 without claiming paid success", () => {
    const result = createDemoCheckout({
      kind: "session",
      amountCents: 10000
    });
    expect(result.coachShareCents).toBe(Math.round(10000 * COACH_TAKE_HOME_RATE));
    expect(result.platformFeeCents).toBe(10000 - result.coachShareCents);
    expect(result.status).toBe(DEMO_CHECKOUT_STATUS);
    expect(result.status).not.toBe("succeeded");
    expect(result.demo).toBe(true);
  });

  it("creates €12/mo subscription preview — not active paid", () => {
    const sub = createDemoSubscription("test@example.com");
    expect(sub.amountCents).toBe(PLATFORM_SUBSCRIPTION_EUR * 100);
    expect(sub.status).toBe(DEMO_SUBSCRIPTION_STATUS);
    expect(sub.status).not.toBe("active");
    expect(sub.demo).toBe(true);
  });

  it("creates connect onboarding url without fake charges/payouts", () => {
    const acct = createDemoConnectAccount("t-002");
    expect(acct.onboardingUrl).toContain("t-002");
    expect(acct.chargesEnabled).toBe(false);
    expect(acct.payoutsEnabled).toBe(false);
    expect(acct.onboardingComplete).toBe(false);
    expect(acct.demo).toBe(true);
  });
});
