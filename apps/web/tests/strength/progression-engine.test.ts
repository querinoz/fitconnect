import { describe, expect, it } from "vitest";
import { computeProgressionTarget, estimateOneRepMax } from "@fitconnect/utils";
import type { PreviousSetPerformance, ProgressionInput } from "@fitconnect/types";

const workingSet = (
  reps: number,
  target: number,
  weight = 60,
  failed = false
): PreviousSetPerformance => ({
  setType: "working",
  actualReps: reps,
  actualWeightKg: weight,
  actualTimeSec: null,
  targetReps: target,
  targetWeightKg: weight,
  isFailed: failed
});

describe("ProgressionEngine (TS)", () => {
  it("TEST 004 — failed reps do not advance linear load", () => {
    const input: ProgressionInput = {
      rule: "LINEAR",
      exerciseMode: "REPS",
      sideMode: "none",
      previousSets: [workingSet(6, 8, 60, true)],
      repMin: 6,
      repMax: 8,
      weightStepKg: 2.5,
      timeStepSec: 5,
      stallCount: 0,
      deloadPercent: 0.1
    };
    const target = computeProgressionTarget(input);
    expect(target.targetWeightKg).toBe(60);
    expect(target.progressionState).toBe("hold");
    expect(target.rationale).toContain("missed");
  });

  it("TEST 005 — stall triggers deload", () => {
    const input: ProgressionInput = {
      rule: "LINEAR",
      exerciseMode: "REPS",
      sideMode: "none",
      previousSets: [workingSet(8, 8)],
      repMin: 6,
      repMax: 8,
      weightStepKg: 2.5,
      timeStepSec: 5,
      stallCount: 3,
      deloadPercent: 0.1
    };
    const target = computeProgressionTarget(input);
    expect(target.progressionState).toBe("deload");
    expect(target.targetWeightKg).toBe(54);
  });

  it("TEST 008 — bodyweight uses rep progression not fake weight", () => {
    const input: ProgressionInput = {
      rule: "DOUBLE_PROGRESSION",
      exerciseMode: "BODYWEIGHT",
      sideMode: "none",
      previousSets: [workingSet(10, 10, 0)],
      repMin: 8,
      repMax: 12,
      weightStepKg: 0,
      timeStepSec: 0,
      stallCount: 0,
      deloadPercent: 0.1
    };
    const target = computeProgressionTarget(input);
    expect(target.targetWeightKg).toBeNull();
    expect(target.targetRepsMin).toBe(11);
  });

  it("TEST 009 — per-side reps stay even", () => {
    const input: ProgressionInput = {
      rule: "DOUBLE_PROGRESSION",
      exerciseMode: "BODYWEIGHT",
      sideMode: "per_side",
      previousSets: [workingSet(8, 8, 0)],
      repMin: 6,
      repMax: 10,
      weightStepKg: 0,
      timeStepSec: 0,
      stallCount: 0,
      deloadPercent: 0.1
    };
    const target = computeProgressionTarget(input);
    expect(target.targetRepsMin % 2).toBe(0);
  });

  it("double progression advances weight at top of range", () => {
    const input: ProgressionInput = {
      rule: "DOUBLE_PROGRESSION",
      exerciseMode: "REPS",
      sideMode: "none",
      previousSets: [workingSet(8, 8, 60)],
      repMin: 6,
      repMax: 8,
      weightStepKg: 2.5,
      timeStepSec: 5,
      stallCount: 0,
      deloadPercent: 0.1
    };
    const target = computeProgressionTarget(input);
    expect(target.targetWeightKg).toBe(62.5);
    expect(target.rationale).toContain("rep range");
  });
});

describe("OneRepMaxEstimator (TS)", () => {
  it("TEST 011 — returns source set and disclaimer", () => {
    const est = estimateOneRepMax(100, 5);
    expect(est.sourceWeightKg).toBe(100);
    expect(est.sourceReps).toBe(5);
    expect(est.disclaimer).toContain("Estimated");
    expect(est.estimatedKg).toBeGreaterThan(100);
  });
});
