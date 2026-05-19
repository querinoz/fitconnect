import type { ReadinessSnapshot, RecoveryStatus } from "@fitconnect/types";

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
};

function avg(xs: number[]) {
  return xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0;
}

function statusFromScore(score: number): RecoveryStatus {
  if (score >= 75) return "green";
  if (score >= 55) return "amber";
  return "red";
}

/**
 * LangGraph-ready readiness evaluator.
 * Uses deterministic rules today; swap `evaluateWithLLM` when OPENAI_API_KEY is set.
 */
export async function evaluateReadiness(input: ReadinessInput): Promise<ReadinessGraphResult> {
  const recentHrv = avg(input.hrvSeries.slice(-3));
  const hrvRatio = input.baselineHrv > 0 ? recentHrv / input.baselineHrv : 1;
  const sleepAvg = avg(input.sleepHoursSeries.slice(-3));

  let score = Math.round(Math.min(100, Math.max(0, hrvRatio * 70 + sleepAvg * 4)));
  if (input.trainingLoad7d > 4500) score = Math.max(0, score - 12);

  const recoveryStatus = statusFromScore(score);
  let recommendation = "Proceed with planned session.";
  if (recoveryStatus === "amber") recommendation = "Reduce intensity 10–15% or swap intervals for Z2.";
  if (recoveryStatus === "red") recommendation = "Recovery day — mobility, sleep, hydration focus.";

  const useLlm = Boolean(process.env.OPENAI_API_KEY?.trim());
  if (useLlm && process.env.NODE_ENV === "development") {
    // LLM path reserved for LangGraph deployment
  }

  return {
    athleteId: input.athleteId,
    score,
    hrvMs: Math.round(recentHrv),
    sleepHours: `${sleepAvg.toFixed(1)}h`,
    sleepEfficiency: Math.round(Math.min(100, sleepAvg / 8 * 100)),
    recoveryStatus,
    capturedAt: new Date().toISOString(),
    recommendation,
    source: useLlm ? "llm" : "rules"
  };
}

export { evaluateRosterAlerts } from "./ops/coach-verification";
