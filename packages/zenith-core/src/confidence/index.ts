/**
 * Data quality + confidence for Zenith outputs.
 * Never present high confidence on MISSING/STALE critical inputs.
 */

import type { ConfidenceResult, DataQuality, DataQualityReport } from "../schemas";

const STALE_HOURS_WARN = 12;
const STALE_HOURS_HARD = 24;

export type TelemetryFreshness = {
  /** ISO timestamp of last telemetry sample, if known. */
  lastCapturedAt?: string | null;
  nowMs?: number;
};

export type PresenceFlags = {
  hrv?: boolean;
  restingHr?: boolean;
  sleep?: boolean;
  load?: boolean;
  activity?: boolean;
};

export function assessDataQuality(
  presence: PresenceFlags,
  freshness: TelemetryFreshness = {}
): DataQualityReport {
  const missingFields: string[] = [];
  if (!presence.hrv) missingFields.push("hrv");
  if (!presence.sleep) missingFields.push("sleep");
  if (!presence.load) missingFields.push("load");

  const notes: string[] = [];
  let staleHours: number | undefined;
  let quality: DataQuality = "COMPLETE";

  if (freshness.lastCapturedAt) {
    const now = freshness.nowMs ?? Date.now();
    const captured = Date.parse(freshness.lastCapturedAt);
    if (Number.isFinite(captured)) {
      staleHours = (now - captured) / (1000 * 60 * 60);
      if (staleHours >= STALE_HOURS_HARD) {
        quality = "STALE";
        notes.push(`Last telemetry ~${Math.round(staleHours)}h ago.`);
      } else if (staleHours >= STALE_HOURS_WARN) {
        notes.push(`Telemetry aging (~${Math.round(staleHours)}h).`);
      }
    }
  }

  if (missingFields.length === 0 && quality === "COMPLETE") {
    return { quality: "COMPLETE", staleHours, missingFields, notes };
  }
  if (missingFields.length >= 3) {
    return {
      quality: "MISSING",
      staleHours,
      missingFields,
      notes: [...notes, "Critical telemetry fields are missing."],
    };
  }
  if (quality === "STALE") {
    return { quality: "STALE", staleHours, missingFields, notes };
  }
  if (missingFields.length > 0) {
    return {
      quality: "PARTIAL",
      staleHours,
      missingFields,
      notes: [...notes, "Partial telemetry — confidence reduced."],
    };
  }
  return { quality, staleHours, missingFields, notes };
}

export function computeConfidence(input: {
  quality: DataQuality;
  baselineSufficient: boolean;
  factorCount: number;
}): ConfidenceResult {
  const reasons: string[] = [];
  let value = 0.85;

  switch (input.quality) {
    case "COMPLETE":
      break;
    case "PARTIAL":
      value -= 0.2;
      reasons.push("Partial telemetry");
      break;
    case "STALE":
      value -= 0.25;
      reasons.push("Stale telemetry");
      break;
    case "MISSING":
      value = 0.15;
      reasons.push("Missing critical telemetry");
      break;
    case "INVALID":
      value = 0.1;
      reasons.push("Invalid telemetry");
      break;
  }

  if (!input.baselineSufficient) {
    value -= 0.2;
    reasons.push("Baseline history insufficient");
  }
  if (input.factorCount < 2) {
    value -= 0.1;
    reasons.push("Few contributing factors");
  }

  value = Math.min(1, Math.max(0, value));
  return {
    value,
    percent: Math.round(value * 100),
    reasons,
  };
}
