/**
 * Deterministic recommendation engine — structured suggestions only.
 * Coach-in-the-loop: TRAINING_ADJUSTMENT sets requiresCoachApproval=true.
 */

import type {
  RecommendationType,
  ReadinessState,
  RecoveryState,
  LoadBand,
} from "../schemas";
import { ZENITH_CORE_VERSION } from "../schemas";

export type Recommendation = {
  type: RecommendationType;
  priority: "low" | "medium" | "high";
  rationale: string;
  expectedBenefit: string;
  confidence: number;
  sourceMetrics: string[];
  requiresCoachApproval: boolean;
  /** Optional volume multiplier suggestion, e.g. 0.75 = -25%. */
  volumeMultiplier?: number;
  intensityHint?: "easy" | "moderate" | "high" | "rest";
  engineVersion: typeof ZENITH_CORE_VERSION;
};

export type RecommendationInput = {
  readinessState: ReadinessState;
  recoveryState: RecoveryState;
  loadBand: LoadBand;
  confidencePercent: number;
  plannedHighIntensity?: boolean;
};

export function evaluateRecommendations(
  input: RecommendationInput
): Recommendation[] {
  const out: Recommendation[] = [];
  const conf = Math.max(0, Math.min(1, input.confidencePercent / 100));

  if (
    input.readinessState === "UNKNOWN" ||
    input.recoveryState === "UNKNOWN"
  ) {
    out.push({
      type: "MONITOR",
      priority: "medium",
      rationale:
        "Insufficient data for a load recommendation. Build baseline with wearable sync.",
      expectedBenefit: "Unlock personalized readiness and recovery insights.",
      confidence: conf,
      sourceMetrics: [],
      requiresCoachApproval: false,
      engineVersion: ZENITH_CORE_VERSION,
    });
    return out;
  }

  if (
    input.readinessState === "CRITICAL" ||
    input.recoveryState === "LOW" ||
    input.loadBand === "EXTREME"
  ) {
    out.push({
      type: "REST",
      priority: "high",
      rationale:
        "Current readiness/recovery and load band are associated with poor tolerance for planned high stress.",
      expectedBenefit: "Reduce accumulated fatigue risk over 24–48h.",
      confidence: conf,
      sourceMetrics: ["readiness", "recovery", "load"],
      requiresCoachApproval: true,
      volumeMultiplier: 0,
      intensityHint: "rest",
      engineVersion: ZENITH_CORE_VERSION,
    });
    out.push({
      type: "SLEEP",
      priority: "high",
      rationale: "Prioritize sleep opportunity while recovery signals are low.",
      expectedBenefit: "Support HRV and next-day readiness.",
      confidence: conf,
      sourceMetrics: ["recovery", "sleep"],
      requiresCoachApproval: false,
      engineVersion: ZENITH_CORE_VERSION,
    });
    return out;
  }

  if (
    (input.readinessState === "LOW" ||
      input.readinessState === "MODERATE" ||
      input.loadBand === "HIGH") &&
    input.plannedHighIntensity
  ) {
    out.push({
      type: "TRAINING_ADJUSTMENT",
      priority: "high",
      rationale:
        "Planned high intensity is above the load band associated with the athlete's current state.",
      expectedBenefit: "Keep technique quality while reducing fatigue cost.",
      confidence: conf,
      sourceMetrics: ["readiness", "load"],
      requiresCoachApproval: true,
      volumeMultiplier: 0.75,
      intensityHint: "moderate",
      engineVersion: ZENITH_CORE_VERSION,
    });
    out.push({
      type: "MOBILITY",
      priority: "medium",
      rationale: "Finish with a short recovery/mobility protocol after adjusted work.",
      expectedBenefit: "Aid perceived recovery without adding high load.",
      confidence: conf,
      sourceMetrics: ["recovery"],
      requiresCoachApproval: false,
      engineVersion: ZENITH_CORE_VERSION,
    });
    return out;
  }

  if (input.readinessState === "OPTIMAL" || input.readinessState === "GOOD") {
    out.push({
      type: "MONITOR",
      priority: "low",
      rationale:
        "Current state is associated with tolerance for planned training; monitor session RPE.",
      expectedBenefit: "Execute plan with awareness of next-day recovery.",
      confidence: conf,
      sourceMetrics: ["readiness", "recovery"],
      requiresCoachApproval: false,
      intensityHint: "high",
      engineVersion: ZENITH_CORE_VERSION,
    });
  }

  return out;
}
