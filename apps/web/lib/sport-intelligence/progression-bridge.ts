/**
 * Bridge to shared `@fitconnect/utils` progression math (Wave 2 strength engine).
 * Sport-intelligence strategies remain sport-aware wrappers; load math is not forked.
 */
import { computeProgressionTarget, estimateOneRepMax } from "@fitconnect/utils";
import type {
  PreviousSetPerformance,
  ProgressionInput as CanonicalProgressionInput,
  ProgressionRule
} from "@fitconnect/types";
import {
  suggestProgression,
  type ProgressionInput as SiInput,
  type ProgressionSuggestion
} from "./progression-engine";

export { estimateOneRepMax, computeProgressionTarget };

export function mapSiStrategyToRule(strategy: SiInput["strategy"]): ProgressionRule {
  switch (strategy) {
    case "TIME_BASED":
      return "TIME_PROGRESSION";
    case "DOUBLE_PROGRESSION":
    case "REP_BASED":
      return "DOUBLE_PROGRESSION";
    case "LINEAR":
      return "LINEAR";
    default:
      return "NONE";
  }
}

/** Prefer shared engine when previous working sets are available; else SI suggestion. */
export function suggestLoadWithSharedEngine(
  si: SiInput,
  previousWorkingSets: PreviousSetPerformance[]
): ProgressionSuggestion {
  if (previousWorkingSets.length === 0) {
    return suggestProgression(si);
  }

  const rule = mapSiStrategyToRule(si.strategy);
  const input: CanonicalProgressionInput = {
    rule,
    exerciseMode: si.previousLoadKg == null && si.previousReps != null ? "BODYWEIGHT" : "REPS",
    sideMode: "none",
    previousSets: previousWorkingSets,
    repMin: si.targetRepsMin,
    repMax: si.targetRepsMax,
    weightStepKg: 2.5,
    timeStepSec: 60,
    stallCount: si.suggestDeload ? 3 : 0,
    deloadPercent: 0.1
  };

  const target = computeProgressionTarget(input);

  return {
    nextLoadKg: target.targetWeightKg,
    nextReps: target.targetRepsMax || target.targetRepsMin || si.previousReps,
    nextTimeSec: target.targetTimeSec,
    nextDistanceM: null,
    nextPaceSecPerKm: null,
    nextPowerW: null,
    deloadSuggested: target.progressionState === "deload",
    explanation: `${target.rationale} (shared @fitconnect/utils ProgressionEngine).`
  };
}
