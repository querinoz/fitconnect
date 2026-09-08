/**
 * @fitconnect/zenith-core
 * Deterministic Zenith Performance Engine — no LLM, no invented telemetry.
 */

export { ZENITH_CORE_VERSION } from "./schemas";
export type * from "./schemas";

export {
  computeBaseline,
  rollingMean,
  type BaselineResult,
  type BaselineSeries,
} from "./baseline";

export {
  assessDataQuality,
  computeConfidence,
  type PresenceFlags,
  type TelemetryFreshness,
} from "./confidence";

export {
  evaluateReadiness,
  type ReadinessEngineInput,
  type ReadinessEngineResult,
} from "./readiness";

export {
  evaluateRecovery,
  type RecoveryEngineInput,
  type RecoveryEngineResult,
} from "./recovery";

export {
  evaluateTrainingLoad,
  type TrainingLoadInput,
  type TrainingLoadResult,
} from "./training-load";

export {
  evaluateTrend,
  type TrendInput,
  type TrendResult,
} from "./trends";

export {
  evaluateRiskSignals,
  type RiskSignal,
  type RiskSignalInput,
} from "./risk";

export {
  evaluateRecommendations,
  type Recommendation,
  type RecommendationInput,
} from "./recommendations";

import { evaluateReadiness, type ReadinessEngineInput } from "./readiness";
import { evaluateRecovery } from "./recovery";
import { evaluateTrainingLoad, type TrainingLoadInput } from "./training-load";
import { evaluateRiskSignals } from "./risk";
import { evaluateRecommendations } from "./recommendations";
import { evaluateTrend } from "./trends";
import { ZENITH_CORE_VERSION } from "./schemas";

export type AthleteStateInput = ReadinessEngineInput &
  TrainingLoadInput & {
    readinessHistory?: Array<number | null | undefined>;
    plannedHighIntensity?: boolean;
    lowRecoveryStreakDays?: number;
  };

/**
 * Single entry: telemetry → deterministic athlete performance state.
 * Feed this object into Zenith AI context builder (Phase 4) — never reverse.
 */
export function evaluateAthleteState(input: AthleteStateInput) {
  const readiness = evaluateReadiness(input);
  const recovery = evaluateRecovery(input);
  const load = evaluateTrainingLoad(input);
  const readinessTrend = evaluateTrend({
    values: input.readinessHistory ?? [],
  });
  const risks = evaluateRiskSignals({
    readinessState: readiness.state,
    recoveryState: recovery.state,
    loadBand: load.band,
    lowRecoveryStreakDays: input.lowRecoveryStreakDays,
  });
  const recommendations = evaluateRecommendations({
    readinessState: readiness.state,
    recoveryState: recovery.state,
    loadBand: load.band,
    confidencePercent: readiness.confidence.percent,
    plannedHighIntensity: input.plannedHighIntensity,
  });

  return {
    engineVersion: ZENITH_CORE_VERSION,
    readiness,
    recovery,
    load,
    readinessTrend,
    risks,
    recommendations,
    explainability: {
      why: risks.map((r) => r.message).join(" "),
      what: recommendations[0]?.rationale ?? "Monitor and sync telemetry.",
      data: readiness.factors.map((f) => f.key),
      confidence: readiness.confidence.percent,
      trend: readinessTrend.associatedLanguage,
      disclaimer:
        "Zenith Performance Engine — not a medical diagnosis. Coach remains responsible for plan changes.",
    },
  };
}
