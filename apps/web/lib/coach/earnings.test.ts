import { describe, expect, it } from "vitest";
import { COACH_TAKE_HOME_RATE, coachShare, platformFee } from "./earnings";

describe("coach earnings", () => {
  it("splits 85% coach / 15% platform", () => {
    expect(COACH_TAKE_HOME_RATE).toBe(0.85);
    expect(coachShare(10000)).toBe(8500);
    expect(platformFee(10000)).toBe(1500);
  });
});
