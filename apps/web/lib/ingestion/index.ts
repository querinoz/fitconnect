import type { WearableProvider } from "@fitconnect/types";

export type IngestionEvent = {
  provider: WearableProvider;
  athleteId: string;
  metric: string;
  value: number;
  unit: string;
  recordedAt: string;
};

export type IngestionResult = {
  accepted: number;
  rejected: number;
  snapshotsUpdated: number;
};

export { ingestWhoopWebhook } from "./providers/whoop";
export { ingestOuraWebhook } from "./providers/oura";
export { ingestStravaWebhook } from "./providers/strava";
