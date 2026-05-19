import type { IngestionEvent, IngestionResult } from "../index";

/** Whoop webhook normalizer — map recovery/sleep/HRV payloads to FitConnect samples. */
export function ingestWhoopWebhook(payload: Record<string, unknown>): {
  events: IngestionEvent[];
  result: IngestionResult;
} {
  const athleteId = String(payload.user_id ?? payload.athleteId ?? "unknown");
  const events: IngestionEvent[] = [];

  if (typeof payload.recovery_score === "number") {
    events.push({
      provider: "whoop",
      athleteId,
      metric: "recovery_score",
      value: payload.recovery_score,
      unit: "score",
      recordedAt: new Date().toISOString()
    });
  }
  if (typeof payload.hrv === "number") {
    events.push({
      provider: "whoop",
      athleteId,
      metric: "hrv",
      value: payload.hrv,
      unit: "ms",
      recordedAt: new Date().toISOString()
    });
  }

  return {
    events,
    result: { accepted: events.length, rejected: 0, snapshotsUpdated: events.length > 0 ? 1 : 0 }
  };
}
