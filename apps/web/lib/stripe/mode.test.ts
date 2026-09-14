import { describe, expect, it } from "vitest";
import { stripeCheckoutMode, stripeHealthDetail, isStripeConfigured } from "./mode";

const env = (key: string) => ({ STRIPE_SECRET_KEY: key }) as unknown as NodeJS.ProcessEnv;

describe("stripeCheckoutMode", () => {
  it("does not treat a missing or placeholder key as live", () => {
    expect(stripeCheckoutMode({} as unknown as NodeJS.ProcessEnv)).toBe("none");
    expect(stripeCheckoutMode(env("PASTE_YOUR_KEY"))).toBe("none");
    expect(stripeHealthDetail("none")).toBe("not configured");
    expect(isStripeConfigured({} as unknown as NodeJS.ProcessEnv)).toBe(false);
  });

  it("classifies test keys separately from live keys", () => {
    expect(stripeCheckoutMode(env("sk_test_abc"))).toBe("test");
    expect(stripeHealthDetail("test")).toBe("stripe test mode");
    expect(stripeCheckoutMode(env("sk_live_abc"))).toBe("live");
    expect(stripeHealthDetail("live")).toBe("live checkout");
  });
});
