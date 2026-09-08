/**
 * Zenith Core schemas — deterministic engine I/O.
 * LLM layers consume these; they never invent scores.
 */

export const ZENITH_CORE_VERSION = "zenith-core@0.1.0" as const;

export type DataQuality = "COMPLETE" | "PARTIAL" | "STALE" | "MISSING" | "INVALID";

export type ReadinessState =
  | "OPTIMAL"
  | "GOOD"
  | "MODERATE"
  | "LOW"
  | "CRITICAL"
  | "UNKNOWN";

export type RecoveryState = "HIGH" | "MODERATE" | "LOW" | "UNKNOWN";

export type LoadBand = "LOW" | "MODERATE" | "HIGH" | "EXTREME" | "UNKNOWN";

export type PerformanceTrend =
  | "improving"
  | "stable"
  | "declining"
  | "insufficient_data";

export type RiskLevel = "INFO" | "WATCH" | "ATTENTION" | "HIGH" | "CRITICAL";

export type RecommendationType =
  | "RECOVERY"
  | "TRAINING_ADJUSTMENT"
  | "REST"
  | "HYDRATION"
  | "SLEEP"
  | "MOBILITY"
  | "TECHNIQUE"
  | "MONITOR";

export type ZenithFactor = {
  key: string;
  label: string;
  /** Percent deviation from baseline when applicable (negative = below). */
  deviationPct?: number;
  direction?: "up" | "down" | "flat" | "unknown";
  weight?: number;
};

export type ConfidenceResult = {
  /** 0–1 */
  value: number;
  /** 0–100 for UI */
  percent: number;
  reasons: string[];
};

export type DataQualityReport = {
  quality: DataQuality;
  staleHours?: number;
  missingFields: string[];
  notes: string[];
};
