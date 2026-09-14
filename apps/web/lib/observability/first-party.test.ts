import { describe, expect, it } from "vitest";
import { isAllowedAnalyticsEvent } from "./first-party";

describe("first-party analytics", () => {
  it("allowlists product events only", () => {
    expect(isAllowedAnalyticsEvent("landing_view")).toBe(true);
    expect(isAllowedAnalyticsEvent("signup")).toBe(true);
    expect(isAllowedAnalyticsEvent("password")).toBe(false);
  });
});
