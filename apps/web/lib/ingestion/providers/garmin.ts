import type { IngestionEvent, IngestionResult } from "../index";

/**
 * Garmin Health API is partner-gated. This mapper never invents Body Battery,
 * stress, or HR. It only copies numeric fields that already exist on a verified payload.
 */
export function ingestGarminHealthPayload(payload: Record<string, unknown>): {
  events: IngestionEvent[];
  result: IngestionResult;
  blocked: boolean;
} {
  if (payload.partnerApproved !== true) {
    return {
      events: [],
      result: { accepted: 0, rejected: 0, snapshotsUpdated: 0 },
      blocked: true
    };
  }

  const athleteId = String(payload.userId ?? payload.athleteId ?? "unknown");
  const recordedAt = String(payload.calendarDate ?? payload.recordedAt ?? new Date().toISOString());
  const events: IngestionEvent[] = [];
  const map: Array<[string, string, string]> = [
    ["restingHeartRateInBeatsPerMinute", "resting_hr", "bpm"],
    ["durationInSeconds", "sleep_duration", "s"],
    ["bodyBatteryChargedValue", "body_battery", "score"]
  ];
  for (const [key, metric, unit] of map) {
    const value = payload[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      events.push({
        provider: "garmin",
        athleteId,
        metric,
        value,
        unit,
        recordedAt
      });
    }
  }
  return {
    events,
    result: {
      accepted: events.length,
      rejected: 0,
      snapshotsUpdated: events.length > 0 ? 1 : 0
    },
    blocked: false
  };
}
