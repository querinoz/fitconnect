/**
 * Recovery engine — derived from readiness inputs + load relationship.
 *
 * Not a medical diagnosis. Language must stay performance-oriented.
 *
 * Score (documented):
 *   recoveryScore ≈ readiness-like blend when inputs present,
 *   else UNKNOWN.
 *   Primary factors ranked by |deviation| and known stressors.
 */

import { evaluateReadiness, type ReadinessEngineInput } from "../readiness";
import { computeBaseline } from "../baseline";
import type {
  ConfidenceResult,
  DataQualityReport,
  RecoveryState,
  ZenithFactor,
} from "../schemas";
import { ZENITH_CORE_VERSION } from "../schemas";

export type RecoveryEngineInput = ReadinessEngineInput & {
  restingHr?: number | null;
  restingHrHistory?: Array<number | null | undefined>;
};

export type RecoveryEngineResult = {
  score: number | null;
  state: RecoveryState;
  primaryFactors: ZenithFactor[];
  secondaryFactors: ZenithFactor[];
  confidence: ConfidenceResult;
  dataQuality: DataQualityReport;
  trend: "up" | "down" | "flat" | "unknown";
  disclaimer: string;
  engineVersion: typeof ZENITH_CORE_VERSION;
  timestamp: string;
};

function recoveryState(score: number | null): RecoveryState {
  if (score == null) return "UNKNOWN";
  if (score >= 70) return "HIGH";
  if (score >= 45) return "MODERATE";
  return "LOW";
}

export function evaluateRecovery(
  input: RecoveryEngineInput
): RecoveryEngineResult {
  const readiness = evaluateReadiness(input);
  const rhr = computeBaseline(
    { values: input.restingHrHistory ?? [], minSamples: 7 },
    input.restingHr
  );

  const primary: ZenithFactor[] = [...readiness.factors];
  const secondary: ZenithFactor[] = [];

  if (rhr.deviationPct != null) {
    secondary.push({
      key: "restingHr",
      label: "Resting HR vs baseline",
      deviationPct: rhr.deviationPct,
      direction:
        rhr.deviationPct > 3 ? "up" : rhr.deviationPct < -3 ? "down" : "flat",
    });
  }

  // Elevated RHR associated with poorer recovery (not causal claim).
  let score = readiness.score;
  if (score != null && rhr.deviationPct != null && rhr.deviationPct > 5) {
    score = Math.max(0, score - Math.min(12, Math.round(rhr.deviationPct / 2)));
  }

  return {
    score,
    state: recoveryState(score),
    primaryFactors: primary.slice(0, 3),
    secondaryFactors: secondary,
    confidence: readiness.confidence,
    dataQuality: readiness.dataQuality,
    trend: readiness.trend,
    disclaimer: "Performance recovery estimate — not a medical diagnosis.",
    engineVersion: ZENITH_CORE_VERSION,
    timestamp: readiness.timestamp,
  };
}
