import { describe, expect, it } from "vitest";
import {
  computeReadiness,
  generateHrvSeries,
  readinessGreeting
} from "./compute";

describe("computeReadiness", () => {
  it("weights HRV, sleep and strain", () => {
    const high = computeReadiness({
      hrvMs: 68,
      baselineHrvMs: 64,
      sleepHours: 8,
      sleepEfficiency: 92,
      strainScore: 20
    });
    expect(high.score).toBeGreaterThanOrEqual(70);
    expect(high.recoveryStatus).toBe("green");
    expect(high.label).toBe("Train hard");
  });

  it("flags low readiness", () => {
    const low = computeReadiness({
      hrvMs: 42,
      baselineHrvMs: 64,
      sleepHours: 4.8,
      sleepEfficiency: 62,
      strainScore: 85
    });
    expect(low.score).toBeLessThan(70);
    expect(low.recoveryStatus).toBe("amber");
  });

  it("flags critical readiness", () => {
    const critical = computeReadiness({
      hrvMs: 38,
      baselineHrvMs: 64,
      sleepHours: 4.2,
      sleepEfficiency: 55,
      strainScore: 92
    });
    expect(critical.score).toBeLessThan(40);
    expect(critical.recoveryStatus).toBe("red");
  });
});

describe("generateHrvSeries", () => {
  it("returns 30 days in realistic HRV range", () => {
    const series = generateHrvSeries(30, 62);
    expect(series).toHaveLength(30);
    expect(series.every((p) => p.hrv >= 45 && p.hrv <= 75)).toBe(true);
  });
});

describe("readinessGreeting", () => {
  it("varies copy by score band", () => {
    expect(readinessGreeting("Marina Costa", 82)).toContain("Train hard");
    expect(readinessGreeting("Marina Costa", 55)).toContain("Train smart");
    expect(readinessGreeting("Marina Costa", 30)).toContain("recovery");
  });
});
