import type { IngestionEvent, IngestionResult } from "../index";

export function ingestStravaWebhook(payload: Record<string, unknown>): {
  events: IngestionEvent[];
  result: IngestionResult;
} {
  const athleteId = String(payload.owner_id ?? payload.athleteId ?? "unknown");
  const events: IngestionEvent[] = [];
  const object = payload.object as Record<string, unknown> | undefined;

  if (object && typeof object.distance === "number") {
    events.push({
      provider: "strava",
      athleteId,
      metric: "activity_distance",
      value: object.distance,
      unit: "m",
      recordedAt: new Date().toISOString()
    });
  }

  return {
    events,
    result: { accepted: events.length, rejected: 0, snapshotsUpdated: 0 }
  };
}
