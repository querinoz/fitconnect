import { describe, expect, it } from "vitest";
import {
  computeBaseline,
  evaluateAthleteState,
  evaluateReadiness,
  evaluateRecovery,
  evaluateRecommendations,
  evaluateTrainingLoad,
  evaluateTrend,
} from "../index";

describe("baseline", () => {
  it("computes deviation vs mean", () => {
    const r = computeBaseline(
      { values: [70, 72, 71, 73, 70, 72, 71], minSamples: 7 },
      61
    );
    expect(r.sufficient).toBe(true);
    expect(r.baseline).toBeCloseTo(71.29, 0);
    expect(r.deviationPct).toBeLessThan(-10);
  });

  it("marks insufficient history", () => {
    const r = computeBaseline({ values: [70, 72], minSamples: 7 }, 61);
    expect(r.sufficient).toBe(false);
  });
});

describe("readiness", () => {
  it("returns UNKNOWN without core telemetry", () => {
    const r = evaluateReadiness({});
    expect(r.state).toBe("UNKNOWN");
    expect(r.score).toBeNull();
  });

  it("scores optimal-ish with strong inputs", () => {
    const r = evaluateReadiness({
      hrvMs: 75,
      baselineHrvMs: 70,
      sleepHours: 8,
      sleepEfficiency: 92,
      strainScore: 20,
      hrvHistory: [70, 71, 69, 72, 70, 71, 70],
    });
    expect(r.score).not.toBeNull();
    expect(r.score!).toBeGreaterThanOrEqual(70);
    expect(["OPTIMAL", "GOOD", "MODERATE"]).toContain(r.state);
  });

  it("scores critical/low when stressed", () => {
    const r = evaluateReadiness({
      hrvMs: 40,
      baselineHrvMs: 70,
      sleepHours: 4.5,
      sleepEfficiency: 60,
      strainScore: 90,
      hrvHistory: [70, 71, 69, 72, 70, 71, 70],
    });
    expect(r.score).not.toBeNull();
    expect(r.score!).toBeLessThan(50);
    expect(["LOW", "CRITICAL", "MODERATE"]).toContain(r.state);
  });
});

describe("recovery", () => {
  it("returns UNKNOWN without data", () => {
    expect(evaluateRecovery({}).state).toBe("UNKNOWN");
  });

  it("penalizes elevated resting HR", () => {
    const base = evaluateRecovery({
      hrvMs: 60,
      baselineHrvMs: 70,
      sleepHours: 6.5,
      sleepEfficiency: 80,
      strainScore: 55,
      restingHr: 58,
      restingHrHistory: [52, 53, 52, 54, 53, 52, 53],
    });
    expect(base.score).not.toBeNull();
    expect(base.state).not.toBe("UNKNOWN");
  });
});

describe("training load", () => {
  it("UNKNOWN without inputs", () => {
    expect(evaluateTrainingLoad({}).band).toBe("UNKNOWN");
  });

  it("bands ACWR", () => {
    expect(evaluateTrainingLoad({ acute: 100, chronic: 100 }).band).toBe(
      "MODERATE"
    );
    expect(evaluateTrainingLoad({ acute: 160, chronic: 100 }).band).toBe(
      "EXTREME"
    );
    expect(evaluateTrainingLoad({ acute: 50, chronic: 100 }).band).toBe("LOW");
  });
});

describe("trends", () => {
  it("insufficient_data with short series", () => {
    expect(evaluateTrend({ values: [1, 2] }).trend).toBe("insufficient_data");
  });

  it("detects declining association", () => {
    const r = evaluateTrend({
      values: [80, 82, 81, 70, 68, 65],
      shortWindow: 3,
      thresholdPct: 5,
    });
    expect(r.trend).toBe("declining");
    expect(r.associatedLanguage).toMatch(/associated/);
  });
});

describe("recommendations", () => {
  it("requires coach approval for training adjustment", () => {
    const recs = evaluateRecommendations({
      readinessState: "LOW",
      recoveryState: "MODERATE",
      loadBand: "HIGH",
      confidencePercent: 70,
      plannedHighIntensity: true,
    });
    const adj = recs.find((r) => r.type === "TRAINING_ADJUSTMENT");
    expect(adj?.requiresCoachApproval).toBe(true);
    expect(adj?.volumeMultiplier).toBe(0.75);
  });

  it("monitor only when insufficient", () => {
    const recs = evaluateRecommendations({
      readinessState: "UNKNOWN",
      recoveryState: "UNKNOWN",
      loadBand: "UNKNOWN",
      confidencePercent: 20,
    });
    expect(recs.every((r) => r.type === "MONITOR")).toBe(true);
  });
});

describe("evaluateAthleteState", () => {
  it("orchestrates engines without inventing scores", () => {
    const state = evaluateAthleteState({
      hrvMs: 55,
      baselineHrvMs: 72,
      sleepHours: 5.5,
      sleepEfficiency: 70,
      strainScore: 75,
      acute: 140,
      chronic: 100,
      plannedHighIntensity: true,
      hrvHistory: [72, 71, 73, 70, 72, 71, 70],
      readinessHistory: [78, 76, 74, 70, 65, 60, 55],
    });
    expect(state.engineVersion).toMatch(/zenith-core/);
    expect(state.readiness.score).not.toBeNull();
    expect(state.explainability.disclaimer).toMatch(/not a medical diagnosis/i);
    expect(state.recommendations.some((r) => r.requiresCoachApproval)).toBe(
      true
    );
  });
});
