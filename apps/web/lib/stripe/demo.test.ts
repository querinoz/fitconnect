import { describe, expect, it } from "vitest";
import {
  createDemoCheckout,
  createDemoConnectAccount,
  createDemoSubscription
} from "./demo";
import { COACH_TAKE_HOME_RATE, PLATFORM_SUBSCRIPTION_EUR } from "./constants";

describe("stripe demo", () => {
  it("splits session revenue 85/15", () => {
    const result = createDemoCheckout({
      kind: "session",
      amountCents: 10000
    });
    expect(result.coachShareCents).toBe(Math.round(10000 * COACH_TAKE_HOME_RATE));
    expect(result.platformFeeCents).toBe(10000 - result.coachShareCents);
    expect(result.status).toBe("succeeded");
  });

  it("creates €12/mo subscription", () => {
    const sub = createDemoSubscription("test@example.com");
    expect(sub.amountCents).toBe(PLATFORM_SUBSCRIPTION_EUR * 100);
    expect(sub.status).toBe("active");
  });

  it("creates connect onboarding url", () => {
    const acct = createDemoConnectAccount("t-002");
    expect(acct.onboardingUrl).toContain("t-002");
    expect(acct.chargesEnabled).toBe(true);
  });
});
