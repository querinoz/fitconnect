import type {
  OneRepMaxEstimate,
  PreviousSetPerformance,
  ProgressionInput,
  ProgressionTarget
} from "@fitconnect/types";

function workingSets(sets: PreviousSetPerformance[]) {
  return sets.filter((s) => s.setType === "working");
}

function allTargetsMet(sets: PreviousSetPerformance[]): boolean {
  const working = workingSets(sets);
  if (working.length === 0) return false;
  return working.every((s) => {
    if (s.isFailed) return false;
    const reps = s.actualReps ?? 0;
    const target = s.targetReps ?? 0;
    return reps >= target && target > 0;
  });
}

function lastWorkingWeight(sets: PreviousSetPerformance[]): number {
  const working = workingSets(sets).filter((s) => s.actualWeightKg != null);
  return working.length > 0 ? working[working.length - 1]!.actualWeightKg! : 0;
}

function lastWorkingReps(sets: PreviousSetPerformance[]): number {
  const working = workingSets(sets);
  return working.length > 0 ? working[working.length - 1]!.actualReps ?? 0 : 0;
}

function evenReps(value: number, perSide: boolean): number {
  if (!perSide) return value;
  return value % 2 === 0 ? value : value + 1;
}

export function computeProgressionTarget(input: ProgressionInput): ProgressionTarget {
  const perSide = input.sideMode === "per_side";
  const working = workingSets(input.previousSets);
  const baseWeight = lastWorkingWeight(input.previousSets);
  const baseReps = lastWorkingReps(input.previousSets);

  if (input.rule === "NONE" || working.length === 0) {
    return {
      targetWeightKg: baseWeight || null,
      targetRepsMin: input.repMin,
      targetRepsMax: input.repMax,
      targetTimeSec: null,
      rationale: "No previous working sets — using plan defaults.",
      progressionState: "hold"
    };
  }

  if (input.exerciseMode === "BODYWEIGHT") {
    const reps = evenReps(
      allTargetsMet(input.previousSets) ? baseReps + 1 : baseReps,
      perSide
    );
    return {
      targetWeightKg: null,
      targetRepsMin: reps,
      targetRepsMax: reps,
      targetTimeSec: null,
      rationale: allTargetsMet(input.previousSets)
        ? `Previous session hit targets at ${baseReps} reps — bodyweight rep progression +1.`
        : `Previous session missed targets — hold at ${baseReps} reps.`,
      progressionState: allTargetsMet(input.previousSets) ? "advance" : "hold"
    };
  }

  if (input.rule === "TIME_PROGRESSION") {
    const lastTime = working[working.length - 1]?.actualTimeSec ?? 0;
    const target = allTargetsMet(input.previousSets)
      ? lastTime + input.timeStepSec
      : lastTime;
    return {
      targetWeightKg: null,
      targetRepsMin: 0,
      targetRepsMax: 0,
      targetTimeSec: target,
      rationale: allTargetsMet(input.previousSets)
        ? `Time progression: +${input.timeStepSec}s after successful hold.`
        : "Hold time — previous target not met.",
      progressionState: allTargetsMet(input.previousSets) ? "advance" : "hold"
    };
  }

  if (input.stallCount >= 3) {
    const deload = Math.round(baseWeight * (1 - input.deloadPercent) * 10) / 10;
    return {
      targetWeightKg: deload,
      targetRepsMin: input.repMin,
      targetRepsMax: input.repMax,
      targetTimeSec: null,
      rationale: `Stall detected (${input.stallCount} sessions) — deload ${input.deloadPercent * 100}% to ${deload}kg.`,
      progressionState: "deload"
    };
  }

  const failed = working.some((s) => s.isFailed || (s.actualReps ?? 0) < (s.targetReps ?? 0));

  if (input.rule === "LINEAR") {
    const nextWeight = allTargetsMet(input.previousSets) && !failed
      ? Math.round((baseWeight + input.weightStepKg) * 10) / 10
      : baseWeight;
    return {
      targetWeightKg: nextWeight,
      targetRepsMin: evenReps(input.repMin, perSide),
      targetRepsMax: evenReps(input.repMax, perSide),
      targetTimeSec: null,
      rationale:
        allTargetsMet(input.previousSets) && !failed
          ? `Linear: all sets completed — +${input.weightStepKg}kg to ${nextWeight}kg.`
          : `Linear: missed reps — hold at ${baseWeight}kg.`,
      progressionState: allTargetsMet(input.previousSets) && !failed ? "advance" : "hold"
    };
  }

  if (input.rule === "DOUBLE_PROGRESSION") {
    if (failed) {
      return {
        targetWeightKg: baseWeight,
        targetRepsMin: evenReps(input.repMin, perSide),
        targetRepsMax: evenReps(input.repMax, perSide),
        targetTimeSec: null,
        rationale: "Double progression: missed reps — hold weight and rebuild rep range.",
        progressionState: "hold"
      };
    }
    if (baseReps >= input.repMax) {
      const nextWeight = Math.round((baseWeight + input.weightStepKg) * 10) / 10;
      return {
        targetWeightKg: nextWeight,
        targetRepsMin: evenReps(input.repMin, perSide),
        targetRepsMax: evenReps(input.repMax, perSide),
        targetTimeSec: null,
        rationale: `Double progression: hit top of rep range (${input.repMax}) — +${input.weightStepKg}kg, reset reps.`,
        progressionState: "advance"
      };
    }
    const nextReps = evenReps(baseReps + 1, perSide);
    return {
      targetWeightKg: baseWeight,
      targetRepsMin: nextReps,
      targetRepsMax: evenReps(input.repMax, perSide),
      targetTimeSec: null,
      rationale: `Double progression: add rep within range (${nextReps}–${input.repMax}) at ${baseWeight}kg.`,
      progressionState: "advance"
    };
  }

  const amrap = working[working.length - 1];
  const amrapReps = amrap?.actualReps ?? baseReps;
  let jump = input.weightStepKg;
  if (amrapReps >= input.repMax + 2) jump = input.weightStepKg * 2;
  const nextWeight =
    allTargetsMet(input.previousSets) && !failed
      ? Math.round((baseWeight + jump) * 10) / 10
      : baseWeight;
  return {
    targetWeightKg: nextWeight,
    targetRepsMin: evenReps(input.repMin, perSide),
    targetRepsMax: evenReps(input.repMax, perSide),
    targetTimeSec: null,
    rationale:
      allTargetsMet(input.previousSets) && !failed
        ? `Greyskull LP: ${amrapReps} reps on top set — load → ${nextWeight}kg.`
        : "Greyskull LP: hold load until top set targets met.",
    progressionState: allTargetsMet(input.previousSets) && !failed ? "advance" : "hold"
  };
}

export function estimateOneRepMax(weightKg: number, reps: number): OneRepMaxEstimate {
  if (reps <= 0 || weightKg <= 0) {
    return {
      estimatedKg: 0,
      sourceWeightKg: weightKg,
      sourceReps: reps,
      formula: "epley",
      confidence: "low",
      disclaimer: "Insufficient data for estimate."
    };
  }
  if (reps === 1) {
    return {
      estimatedKg: weightKg,
      sourceWeightKg: weightKg,
      sourceReps: reps,
      formula: "epley",
      confidence: "high",
      disclaimer: "Estimated 1RM — not a measured max."
    };
  }
  const confidence = reps <= 12 ? "medium" : ("low" as const);
  const estimated = Math.round(weightKg * (1 + reps / 30) * 10) / 10;
  return {
    estimatedKg: estimated,
    sourceWeightKg: weightKg,
    sourceReps: reps,
    formula: "epley",
    confidence,
    disclaimer: "Estimated 1RM (Epley) — not a measured max."
  };
}
