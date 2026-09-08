/**
 * Readiness engine — wraps canonical `@fitconnect/utils` formula.
 *
 * Documented weights (utils): HRV 40% · Sleep 30% · Strain 30%.
 * This module adds UNKNOWN, state bands, confidence, and factors —
 * it does NOT invent a second scoring formula.
 *
 * States:
 *   OPTIMAL ≥ 85 · GOOD ≥ 70 · MODERATE ≥ 50 · LOW ≥ 40 · CRITICAL < 40 · UNKNOWN
 */

import {
  computeReadiness as utilsComputeReadiness,
  type ReadinessInputs,
} from "@fitconnect/utils";
import { computeBaseline } from "../baseline";
import {
  assessDataQuality,
  computeConfidence,
} from "../confidence";
import type {
  ConfidenceResult,
  DataQualityReport,
  ReadinessState,
  ZenithFactor,
} from "../schemas";
import { ZENITH_CORE_VERSION } from "../schemas";

export type ReadinessEngineInput = {
  hrvMs?: number | null;
  baselineHrvMs?: number | null;
  /** HRV history for baseline when baselineHrvMs omitted. */
  hrvHistory?: Array<number | null | undefined>;
  sleepHours?: number | null;
  sleepEfficiency?: number | null;
  strainScore?: number | null;
  historyDays?: 1 | 7;
  lastCapturedAt?: string | null;
  nowMs?: number;
};

export type ReadinessEngineResult = {
  score: number | null;
  state: ReadinessState;
  label: string;
  factors: ZenithFactor[];
  confidence: ConfidenceResult;
  dataQuality: DataQualityReport;
  trend: "up" | "down" | "flat" | "unknown";
  engineVersion: typeof ZENITH_CORE_VERSION;
  timestamp: string;
  /** Present only when score was computed. */
  weights?: { hrv: number; sleep: number; strain: number };
};

function stateFromScore(score: number): ReadinessState {
  if (score >= 85) return "OPTIMAL";
  if (score >= 70) return "GOOD";
  if (score >= 50) return "MODERATE";
  if (score >= 40) return "LOW";
  return "CRITICAL";
}

export function evaluateReadiness(
  input: ReadinessEngineInput
): ReadinessEngineResult {
  const timestamp = new Date(input.nowMs ?? Date.now()).toISOString();
  const hrvPresent = input.hrvMs != null && Number.isFinite(input.hrvMs);
  const sleepPresent =
    input.sleepHours != null && Number.isFinite(input.sleepHours);
  const loadPresent =
    input.strainScore != null && Number.isFinite(input.strainScore);

  const dataQuality = assessDataQuality(
    { hrv: hrvPresent, sleep: sleepPresent, load: loadPresent },
    { lastCapturedAt: input.lastCapturedAt, nowMs: input.nowMs }
  );

  const hrvBaseline = computeBaseline(
    {
      values: input.hrvHistory ?? [],
      minSamples: 7,
    },
    input.hrvMs
  );

  const baselineHrv =
    input.baselineHrvMs != null && Number.isFinite(input.baselineHrvMs)
      ? input.baselineHrvMs
      : hrvBaseline.baseline;

  const insufficientCore =
    dataQuality.quality === "MISSING" ||
    (!hrvPresent && !sleepPresent) ||
    baselineHrv == null;

  if (insufficientCore || input.hrvMs == null || input.sleepHours == null) {
    return {
      score: null,
      state: "UNKNOWN",
      label:
        "Insufficient data to compute readiness with confidence. Connect a wearable and keep training.",
      factors: [],
      confidence: computeConfidence({
        quality: dataQuality.quality === "COMPLETE" ? "MISSING" : dataQuality.quality,
        baselineSufficient: hrvBaseline.sufficient,
        factorCount: 0,
      }),
      dataQuality,
      trend: "unknown",
      engineVersion: ZENITH_CORE_VERSION,
      timestamp,
    };
  }

  const utilsInput: ReadinessInputs = {
    hrvMs: input.hrvMs,
    baselineHrvMs: baselineHrv,
    sleepHours: input.sleepHours,
    sleepEfficiency: input.sleepEfficiency ?? 85,
    strainScore: input.strainScore ?? 40,
    historyDays: input.historyDays,
  };

  const computed = utilsComputeReadiness(utilsInput);
  const state = stateFromScore(computed.score);

  const factors: ZenithFactor[] = [
    {
      key: "hrv",
      label: "HRV vs baseline",
      deviationPct: hrvBaseline.deviationPct ?? undefined,
      direction:
        hrvBaseline.deviationPct == null
          ? "unknown"
          : hrvBaseline.deviationPct > 2
            ? "up"
            : hrvBaseline.deviationPct < -2
              ? "down"
              : "flat",
      weight: computed.weights.hrv,
    },
    {
      key: "sleep",
      label: "Sleep",
      direction: input.sleepHours >= 7 ? "up" : "down",
      weight: computed.weights.sleep,
    },
    {
      key: "strain",
      label: "Recent strain",
      direction: (input.strainScore ?? 40) > 60 ? "up" : "flat",
      weight: computed.weights.strain,
    },
  ];

  const confidence = computeConfidence({
    quality: dataQuality.quality,
    baselineSufficient: hrvBaseline.sufficient || input.baselineHrvMs != null,
    factorCount: factors.length,
  });

  return {
    score: computed.score,
    state,
    label: computed.label,
    factors,
    confidence,
    dataQuality,
    trend:
      hrvBaseline.deviationPct == null
        ? "unknown"
        : hrvBaseline.deviationPct > 2
          ? "up"
          : hrvBaseline.deviationPct < -2
            ? "down"
            : "flat",
    engineVersion: ZENITH_CORE_VERSION,
    timestamp,
    weights: computed.weights,
  };
}
