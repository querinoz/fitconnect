import type { IngestionEvent, IngestionResult } from "../index";

export type WhoopPendingFetch = {
  resource: "recovery" | "sleep" | "workout";
  id: string;
  userId: string;
};

const V2_ENVELOPE: Record<string, WhoopPendingFetch["resource"]> = {
  "recovery.updated": "recovery",
  "recovery.deleted": "recovery",
  "sleep.updated": "sleep",
  "sleep.deleted": "sleep",
  "workout.updated": "workout",
  "workout.deleted": "workout"
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function pushMetric(
  events: IngestionEvent[],
  athleteId: string,
  metric: string,
  value: unknown,
  unit: string,
  recordedAt: string
) {
  if (typeof value !== "number" || !Number.isFinite(value)) return;
  events.push({
    provider: "whoop",
    athleteId,
    metric,
    value,
    unit,
    recordedAt
  });
}

/**
 * WHOOP Developer API v2.
 * Webhook envelopes contain `{ user_id, id, type, trace_id }` — never a score.
 * Scores exist only after GET /developer/v2/recovery (or sleep/workout).
 * Do not invent HRV / recovery from an envelope.
 */
export function ingestWhoopWebhook(payload: Record<string, unknown>): {
  events: IngestionEvent[];
  result: IngestionResult;
  pendingFetch: WhoopPendingFetch | null;
} {
  const type = String(payload.type ?? "");
  const id = String(payload.id ?? "");
  const athleteId = String(payload.user_id ?? payload.athleteId ?? "unknown");
  const envelopeResource = V2_ENVELOPE[type];
  if (envelopeResource && id) {
    return {
      events: [],
      result: { accepted: 0, rejected: 0, snapshotsUpdated: 0 },
      pendingFetch: { resource: envelopeResource, id, userId: athleteId }
    };
  }

  const events: IngestionEvent[] = [];
  const recordedAt = String(
    payload.updated_at ?? payload.created_at ?? payload.recordedAt ?? new Date().toISOString()
  );
  const score = asRecord(payload.score) ?? payload;

  pushMetric(events, athleteId, "recovery_score", score.recovery_score ?? payload.recovery_score, "score", recordedAt);
  pushMetric(events, athleteId, "hrv", score.hrv_rmssd_milli ?? payload.hrv, "ms", recordedAt);
  pushMetric(events, athleteId, "resting_hr", score.resting_heart_rate ?? payload.resting_hr, "bpm", recordedAt);

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
