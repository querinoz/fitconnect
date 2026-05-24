import { describe, expect, it } from "vitest";
import {
  computeReadiness,
  computeReadinessForApi,
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

  it("should_clamp_hrv_zero_to_minimum_score", () => {
    const result = computeReadiness({
      hrvMs: 0,
      baselineHrvMs: 64,
      sleepHours: 7,
      sleepEfficiency: 80,
      strainScore: 20
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it("should_clamp_hrv_200_to_maximum_score", () => {
    const result = computeReadiness({
      hrvMs: 200,
      baselineHrvMs: 64,
      sleepHours: 8,
      sleepEfficiency: 95,
      strainScore: 10
    });
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("should_treat_nan_strain_as_zero", () => {
    const result = computeReadiness({
      hrvMs: 62,
      baselineHrvMs: 58,
      sleepHours: 7.5,
      sleepEfficiency: 85,
      strainScore: Number.NaN
    });
    expect(result.score).toBeGreaterThan(0);
  });

  it("should_weight_7_day_history_higher_than_1_day", () => {
    const base = {
      hrvMs: 62,
      baselineHrvMs: 58,
      sleepHours: 7.5,
      sleepEfficiency: 85,
      strainScore: 30
    };
    const seven = computeReadiness({ ...base, historyDays: 7 });
    const one = computeReadiness({ ...base, historyDays: 1 });
    expect(seven.score).toBeGreaterThanOrEqual(one.score);
  });
});

describe("computeReadinessForApi", () => {
  it("should_map_high_score_to_optimal_or_good", () => {
    const result = computeReadinessForApi({
      hrvMs: 68,
      baselineHrvMs: 64,
      sleepHours: 8,
      sleepEfficiency: 92,
      strainScore: 20
    });
    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(["optimal", "good"]).toContain(result.status);
    expect(result.breakdown.hrv).toBeGreaterThan(0);
  });

  it("should_map_low_score_to_poor", () => {
    const result = computeReadinessForApi({
      hrvMs: 38,
      baselineHrvMs: 64,
      sleepHours: 4.2,
      sleepEfficiency: 55,
      strainScore: 92
    });
    expect(result.status).toBe("poor");
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
