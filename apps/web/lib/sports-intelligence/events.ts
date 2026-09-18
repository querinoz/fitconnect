/**
 * V10 Real-Time Sports Intelligence — athlete event contract.
 * Schema-versioned, identity-scoped, idempotent-capable.
 * Never carries secrets. Biometrics stay private to athlete scope.
 */

export const ATHLETE_EVENT_SCHEMA_VERSION = "2026.09.v10";

export type AthleteEventType =
  | "WORKOUT_STARTED"
  | "WORKOUT_PAUSED"
  | "WORKOUT_RESUMED"
  | "WORKOUT_COMPLETED"
  | "SET_COMPLETED"
  | "INTERVAL_COMPLETED"
  | "HEART_RATE_UPDATED"
  | "HRV_UPDATED"
  | "SLEEP_UPDATED"
  | "READINESS_UPDATED"
  | "RECOVERY_UPDATED"
  | "DEVICE_CONNECTED"
  | "DEVICE_DISCONNECTED"
  | "SYNC_STARTED"
  | "SYNC_COMPLETED"
  | "SYNC_FAILED"
  | "NUTRITION_LOGGED"
  | "MEAL_COMPLETED"
  | "HYDRATION_LOGGED"
  | "SPORT_ACTIVITY_STARTED"
  | "SPORT_ACTIVITY_COMPLETED";

export type AthleteEventSource =
  | "TRAIN"
  | "WEAROS"
  | "HEALTH_CONNECT"
  | "HEALTHKIT"
  | "GARMIN"
  | "WHOOP"
  | "NUTRITION"
  | "MANUAL"
  | "SYSTEM"
  | "MCP";

export type AthleteEvent = {
  id: string;
  type: AthleteEventType;
  timestamp: string;
  userId: string;
  source: AthleteEventSource;
  schemaVersion: string;
  /** Optional device / adapter metadata — never tokens */
  device?: {
    providerId?: string;
    deviceLabel?: string;
  };
  /** Client-supplied dedupe key; store also hashes type+timestamp+payload */
  dedupeKey?: string;
  payload: Record<string, unknown>;
};

export type Confidence = "HIGH" | "MEDIUM" | "LOW" | "NOT_AVAILABLE";

export type Freshness = "LIVE" | "RECENT" | "STALE" | "UNKNOWN";

export type MetricSample = {
  value: number | null;
  unit: string;
  source: string;
  sourceId?: string | null;
  timestamp: string | null;
  ingestedAt: string;
  confidence: Confidence;
  freshness: Freshness;
  provenance: "REAL" | "CALCULATED" | "ESTIMATED" | "MISSING";
};

export type AthleteContext = {
  userId: string;
  identity: {
    primarySport: string | null;
    goal: string | null;
  };
  training: {
    activeSessionId: string | null;
    phase: "IDLE" | "ACTIVE" | "PAUSED" | "COMPLETED" | "UNKNOWN";
    lastCompletedAt: string | null;
    trainingLoadLabel: string | null;
  };
  recovery: {
    readinessScore: number | null;
    readinessState: Confidence;
    recoveryNote: string | null;
  };
  nutrition: {
    lastLoggedAt: string | null;
    hydrationMlToday: number | null;
  };
  device: {
    status: "CONNECTED" | "SYNCING" | "SYNCED" | "STALE" | "DISCONNECTED" | "PERMISSION_REQUIRED" | "UNSUPPORTED" | "ERROR" | "NOT_CONNECTED";
    providers: string[];
    lastSyncAt: string | null;
  };
  competition: {
    nextEventAt: string | null;
    phase: string | null;
  };
  schedule: {
    availableMinToday: number | null;
  };
  metrics: {
    heartRate: MetricSample | null;
    hrv: MetricSample | null;
    sleepHours: MetricSample | null;
  };
  confidence: Confidence;
  lastUpdated: string;
  dataSources: string[];
  safety: {
    flags: string[];
    note: string | null;
  };
};

export function createEventId(): string {
  return `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function computeDedupeKey(event: Pick<AthleteEvent, "type" | "userId" | "timestamp" | "dedupeKey" | "payload">): string {
  if (event.dedupeKey) return `${event.userId}:${event.dedupeKey}`;
  const payloadHint =
    typeof event.payload.sessionId === "string"
      ? event.payload.sessionId
      : typeof event.payload.setId === "string"
        ? event.payload.setId
        : "";
  return `${event.userId}:${event.type}:${event.timestamp}:${payloadHint}`;
}
