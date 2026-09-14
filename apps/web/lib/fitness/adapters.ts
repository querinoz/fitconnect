import {
  constraintsFor,
  type FitnessProvider,
  type ProviderId
} from "@fitconnect/types";

const IDS: ProviderId[] = [
  "HEALTH_CONNECT",
  "HEALTHKIT",
  "GARMIN",
  "WHOOP",
  "OURA",
  "POLAR",
  "FITBIT",
  "SAMSUNG_HEALTH",
  "STRAVA",
  "INTERVALS_ICU",
  "TRAININGPEAKS",
  "MANUAL",
  "TERRA",
  "SPIKE",
  "ROOK"
];

const DISPLAY: Record<ProviderId, string> = {
  HEALTH_CONNECT: "Health Connect",
  HEALTHKIT: "HealthKit",
  GARMIN: "Garmin",
  WHOOP: "WHOOP",
  OURA: "Oura",
  POLAR: "Polar",
  FITBIT: "Fitbit",
  SAMSUNG_HEALTH: "Samsung Health",
  STRAVA: "Strava",
  INTERVALS_ICU: "Intervals.icu",
  TRAININGPEAKS: "TrainingPeaks",
  MANUAL: "Manual",
  LOCAL_DEMO: "Local demo",
  TERRA: "Terra (disabled aggregator)",
  SPIKE: "Spike (disabled aggregator)",
  ROOK: "ROOK (disabled aggregator)"
};

/** Registry only. Ingest lives on Health Connect / official adapters, never aggregators. */
export function listFitnessAdapters(): FitnessProvider[] {
  return IDS.map((id) => ({
    id,
    displayName: DISPLAY[id],
    constraints: constraintsFor(id)
  }));
}
