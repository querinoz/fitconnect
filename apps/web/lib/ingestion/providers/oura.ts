import type { IngestionEvent, IngestionResult } from "../index";

export type OuraPendingFetch = {
  dataType: string;
  objectId: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

/**
 * Oura API V2 (V1 PAT sunset).
 * Webhooks notify with object_id; scores live on GET /v2/usercollection/*.
 * Do not treat a webhook ping as a readiness observation.
 */
export function ingestOuraWebhook(payload: Record<string, unknown>): {
  events: IngestionEvent[];
  result: IngestionResult;
  pendingFetch: OuraPendingFetch | null;
} {
  const objectId = String(payload.object_id ?? payload.id ?? "");
  const dataType = String(payload.data_type ?? payload.event_type ?? "");
  if (objectId && (dataType.includes("sleep") || dataType.includes("readiness") || dataType.includes("daily"))) {
    return {
      events: [],
      result: { accepted: 0, rejected: 0, snapshotsUpdated: 0 },
      pendingFetch: { dataType, objectId }
    };
  }

  const athleteId = String(payload.user_id ?? payload.athleteId ?? "unknown");
  const events: IngestionEvent[] = [];
  const recordedAt = String(payload.timestamp ?? payload.day ?? new Date().toISOString());
  const readiness = asRecord(payload.readiness) ?? payload;
  const sleep = asRecord(payload.sleep);

  if (typeof readiness.score === "number") {
    events.push({
      provider: "oura",
      athleteId,
      metric: "readiness_score",
      value: readiness.score,
      unit: "score",
      recordedAt
    });
  }
  if (sleep && typeof sleep.total_sleep_duration === "number") {
    events.push({
      provider: "oura",
      athleteId,
      metric: "sleep_duration",
      value: sleep.total_sleep_duration,
      unit: "s",
      recordedAt
    });
  }

  return {
    events,
    result: {
      accepted: events.length,
      rejected: 0,
      snapshotsUpdated: events.length > 0 ? 1 : 0
    },
    pendingFetch: null
  };
}
