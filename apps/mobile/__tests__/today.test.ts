import { describe, expect, it } from "vitest";
import { computeReadiness } from "../lib/readiness";

describe("mobile today readiness", () => {
  it("returns score between 0 and 100", () => {
    const result = computeReadiness({
      hrvMs: 65,
      baselineHrvMs: 60,
      sleepHours: 7.5,
      sleepEfficiency: 88,
      strainScore: 45
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
