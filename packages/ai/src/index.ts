import type { ReadinessSnapshot, RecoveryStatus } from "@fitconnect/types";
import {
  evaluateAthleteState,
  evaluateReadiness as evaluateZenithReadinessCore,
  type AthleteStateInput,
} from "@fitconnect/zenith-core";

export type ReadinessInput = {
  athleteId: string;
  hrvSeries: number[];
  sleepHoursSeries: number[];
  trainingLoad7d: number;
  baselineHrv: number;
};

export type ReadinessGraphResult = ReadinessSnapshot & {
  recommendation: string;
  source: "rules" | "llm";
  engineVersion?: string;
  readinessState?: string;
};

function avg(xs: number[]) {
  return xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0;
}

function statusFromZenithState(
  state: string,
  score: number | null
): RecoveryStatus {
  if (state === "OPTIMAL" || state === "GOOD") return "green";
  if (state === "MODERATE") return "amber";
  if (state === "LOW" || state === "CRITICAL") return "red";
  if (score == null) return "amber";
  if (score >= 75) return "green";
  if (score >= 55) return "amber";
  return "red";
}

/**
 * LangGraph-ready readiness evaluator.
 * Scoring is always deterministic via @fitconnect/zenith-core.
 * LLM path (when configured) may only rewrite explanation text — never scores.
 */
export async function evaluateReadinessGraph(
  input: ReadinessInput
): Promise<ReadinessGraphResult> {
  const recentHrv = avg(input.hrvSeries.slice(-3));
  const sleepAvg = avg(input.sleepHoursSeries.slice(-3));
  // Map 7d training load (AU) into 0–100 strain for the shared formula.
  const strainScore = Math.min(100, Math.round((input.trainingLoad7d / 4500) * 100));

  const engine = evaluateZenithReadinessCore({
    hrvMs: recentHrv || null,
    baselineHrvMs: input.baselineHrv,
    hrvHistory: input.hrvSeries,
    sleepHours: sleepAvg || null,
    sleepEfficiency: Math.round(Math.min(100, (sleepAvg / 8) * 100)),
    strainScore,
    historyDays: 7,
  });

  const score = engine.score ?? 0;
  const recoveryStatus = statusFromZenithState(engine.state, engine.score);

  let recommendation =
    engine.label ||
    "Insufficient data — sync wearable before training intensity advice.";
  if (engine.state === "MODERATE") {
    recommendation =
      "Reduce intensity 10–15% or swap intervals for Z2. (Zenith Core)";
  }
  if (engine.state === "LOW" || engine.state === "CRITICAL") {
    recommendation =
      "Recovery day — mobility, sleep, hydration focus. (Zenith Core)";
  }

  const useLlm = Boolean(process.env.OPENAI_API_KEY?.trim());
  if (useLlm && process.env.NODE_ENV === "development") {
    // LLM may only contextualize `recommendation` in a future provider — never mutate score.
  }

  return {
    athleteId: input.athleteId,
    score,
    hrvMs: Math.round(recentHrv),
    sleepHours: `${sleepAvg.toFixed(1)}h`,
    sleepEfficiency: Math.round(Math.min(100, (sleepAvg / 8) * 100)),
    recoveryStatus,
    capturedAt: new Date().toISOString(),
    recommendation,
    source: "rules",
    engineVersion: engine.engineVersion,
    readinessState: engine.state,
  };
}

/** @deprecated Use evaluateReadinessGraph — kept for callers expecting evaluateReadiness name. */
export async function evaluateReadiness(
  input: ReadinessInput
): Promise<ReadinessGraphResult> {
  return evaluateReadinessGraph(input);
}

export function buildAthletePerformanceState(input: AthleteStateInput) {
  return evaluateAthleteState(input);
}

export {
  evaluateAthleteState,
  evaluateZenithReadinessCore as evaluateZenithReadiness,
};
