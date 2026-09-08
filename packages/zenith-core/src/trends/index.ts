/**
 * Trend engine — direction of change, never automatic causality.
 */

import type { PerformanceTrend } from "../schemas";
import { rollingMean } from "../baseline";

export type TrendInput = {
  values: Array<number | null | undefined>;
  /** Compare last `shortWindow` mean vs prior `shortWindow`. */
  shortWindow?: number;
  /** Minimum absolute % change to call up/down. */
  thresholdPct?: number;
};

export type TrendResult = {
  trend: PerformanceTrend;
  shortMean: number | null;
  priorMean: number | null;
  changePct: number | null;
  /** Safe language fragment for UI / LLM context. */
  associatedLanguage: string;
};

export function evaluateTrend(input: TrendInput): TrendResult {
  const window = input.shortWindow ?? 3;
  const threshold = input.thresholdPct ?? 5;
  const samples = input.values.filter(
    (v): v is number => typeof v === "number" && Number.isFinite(v)
  );

  if (samples.length < window * 2) {
    return {
      trend: "insufficient_data",
      shortMean: rollingMean(samples, window),
      priorMean: null,
      changePct: null,
      associatedLanguage:
        "Not enough history to describe a trend. This is associated with limited samples, not a performance conclusion.",
    };
  }

  const short = samples.slice(-window);
  const prior = samples.slice(-window * 2, -window);
  const shortMean = short.reduce((a, b) => a + b, 0) / short.length;
  const priorMean = prior.reduce((a, b) => a + b, 0) / prior.length;
  const changePct =
    priorMean !== 0
      ? Math.round(((shortMean - priorMean) / priorMean) * 1000) / 10
      : null;

  let trend: PerformanceTrend = "stable";
  if (changePct != null && changePct >= threshold) trend = "improving";
  else if (changePct != null && changePct <= -threshold) trend = "declining";

  const associatedLanguage =
    trend === "stable"
      ? "Recent values are associated with a stable pattern versus the prior window."
      : trend === "improving"
        ? "Recent values are associated with an upward shift versus the prior window (not proof of causation)."
        : "Recent values are associated with a downward shift versus the prior window (not proof of causation).";

  return {
    trend,
    shortMean: Math.round(shortMean * 100) / 100,
    priorMean: Math.round(priorMean * 100) / 100,
    changePct,
    associatedLanguage,
  };
}
