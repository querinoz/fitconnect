import { describe, expect, it } from "vitest";
import { computeReadiness, readinessGreeting } from "./readiness";

describe("mobile readiness", () => {
  it("computes weighted score", () => {
    const result = computeReadiness({
      hrvMs: 58,
      baselineHrvMs: 54,
      sleepHours: 7.5,
      sleepEfficiency: 90,
      strainScore: 40
    });
    expect(result.score).toBeGreaterThan(50);
    expect(result.label).toBeTruthy();
  });

  it("greets by score band", () => {
    expect(readinessGreeting("Marina Costa", 80)).toContain("Marina");
    expect(readinessGreeting("Marina Costa", 35).toLowerCase()).toContain("recovery");
  });
});
