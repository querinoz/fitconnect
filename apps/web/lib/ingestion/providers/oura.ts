import type { IngestionEvent, IngestionResult } from "../index";

export function ingestOuraWebhook(payload: Record<string, unknown>): {
  events: IngestionEvent[];
  result: IngestionResult;
} {
  const athleteId = String(payload.user_id ?? "unknown");
  const events: IngestionEvent[] = [];
  const readiness = payload.readiness as Record<string, unknown> | undefined;

  if (readiness && typeof readiness.score === "number") {
    events.push({
      provider: "oura",
      athleteId,
      metric: "readiness_score",
      value: readiness.score,
      unit: "score",
      recordedAt: new Date().toISOString()
    });
  }

  return {
    events,
    result: { accepted: events.length, rejected: 0, snapshotsUpdated: events.length > 0 ? 1 : 0 }
  };
}
