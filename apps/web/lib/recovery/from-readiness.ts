import { missingObservation, type FitnessObservation } from "@/lib/health/observation";
import { readinessFromApi } from "@/lib/train/readiness";
import type { ReadinessView } from "@/lib/train/types";

export type RecoveryView = {
  readiness: ReadinessView;
  whatHappened: string;
  whatItMeans: string;
  whatToDo: string;
  observations: {
    readinessScore: FitnessObservation;
    hrvMs: FitnessObservation;
    sleepHours: FitnessObservation;
    restingHrBpm: FitnessObservation;
  };
};

export function recoveryFromReadinessPayload(payload: {
  score?: number | null;
  source?: string;
  provider?: string;
  measuredAt?: string | null;
  hrvMs?: number | null;
  sleepHours?: number | null;
  restingHrBpm?: number | null;
} | null): RecoveryView {
  const readiness = readinessFromApi(payload);
  const source = payload?.source ?? "insufficient_data";
  const provider = payload?.provider ?? source;
  const measuredAt = payload?.measuredAt ?? null;
  const ingestedAt = new Date().toISOString();

  const readinessScore: FitnessObservation = readiness.available && readiness.score != null
    ? {
        value: readiness.score,
        unit: "score",
        source,
        provider,
        measuredAt,
        ingestedAt,
        confidence: source === "strava" ? "derived" : "measured"
      }
    : missingObservation(source, provider, "score");

  const hrvMs =
    typeof payload?.hrvMs === "number"
      ? {
          value: payload.hrvMs,
          unit: "ms",
          source,
          provider,
          measuredAt,
          ingestedAt,
          confidence: "measured" as const
        }
      : missingObservation(source, provider, "ms");
  const sleepHours =
    typeof payload?.sleepHours === "number"
      ? {
          value: payload.sleepHours,
          unit: "h",
          source,
          provider,
          measuredAt,
          ingestedAt,
          confidence: "measured" as const
        }
      : missingObservation(source, provider, "h");
  const restingHrBpm =
    typeof payload?.restingHrBpm === "number"
      ? {
          value: payload.restingHrBpm,
          unit: "bpm",
          source,
          provider,
          measuredAt,
          ingestedAt,
          confidence: "measured" as const
        }
      : missingObservation(source, provider, "bpm");

  if (!readiness.available) {
    return {
      readiness,
      whatHappened: "No recovery telemetry is attached to this account right now.",
      whatItMeans:
        "FitConnect will not invent HRV, sleep, resting heart rate, or readiness. TRAIN still runs from the catalog.",
      whatToDo:
        "Connect Health Connect, HealthKit, WHOOP, Oura, or Garmin when credentials exist. Until then, pick a planned session.",
      observations: { readinessScore, hrvMs, sleepHours, restingHrBpm }
    };
  }

  const band = readiness.band ?? "PRIMED";
  const next =
    band === "RESTORE" || band === "RECOVER"
      ? "Prefer mobility or restore work. Do not treat this as a medical diagnosis."
      : band === "CAUTION"
        ? "Keep intensity moderate. Use the catalog session as written unless a coach changes it."
        : "The planned session can proceed. Still skip any movement you cannot perform.";

  return {
    readiness,
    whatHappened: `Private readiness ${readiness.score} arrived from ${source}.`,
    whatItMeans: `Band ${band}. This score stays on your athlete surface. Strava-origin rows never enter Feed.`,
    whatToDo: next,
    observations: { readinessScore, hrvMs, sleepHours, restingHrBpm }
  };
}
