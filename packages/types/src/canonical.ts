/**
 * Canonical FitConnect domain contracts (P1-DATA).
 * Cross-platform: Web, Android, Wear must share these semantics.
 * Storage units are explicit — UI may convert for display.
 */

/** Product roles. ADMIN is server-assigned only (never client self-assign). */
export type CanonicalRole = "athlete" | "coach";

export type ActivityVisibility = "private" | "public" | "followers";

/**
 * Canonical sport keys for persisted activities.
 * Aligns with Android `Sport` enum names (lowercase for SQL text).
 */
export type CanonicalSport =
  | "RUN"
  | "TRAIL_RUN"
  | "WALK"
  | "HIKE"
  | "RIDE"
  | "MOUNTAIN_BIKE"
  | "GRAVEL"
  | "INDOOR_RIDE"
  | "E_BIKE"
  | "SWIM_POOL"
  | "SWIM_OPEN"
  | "STRENGTH"
  | "HIIT"
  | "YOGA"
  | "PILATES"
  | "MOBILITY"
  | "ROW"
  | "SKI"
  | "SNOWBOARD"
  | "SURF"
  | "SAIL"
  | "PADDLE"
  | "RACQUET"
  | "TEAM"
  | "GOLF"
  | "OTHER";

/** Storage units for activity telemetry — never ambiguous. */
export const ACTIVITY_UNITS = {
  distance: "m",
  duration: "ms",
  elevation: "m",
  heartRate: "bpm",
  pace: "sec_per_km",
  speed: "m_per_s",
  calories: "kcal",
  timestamp: "timestamptz_utc"
} as const;

/**
 * Readiness / physiology units.
 * HRV is stored as milliseconds (RMSSD-style). Not SDNN, not ln(RMSSD).
 */
export const READINESS_UNITS = {
  hrv: "ms_rmssd",
  sleep: "hours",
  sleepEfficiency: "ratio_0_1",
  timestamp: "timestamptz_utc"
} as const;

export type CanonicalActivity = {
  /** UUID — one ID for Android / Web / Watch / ASCEND / Squad / Social. */
  id: string;
  userId: string;
  provider: string;
  externalId: string;
  sport: string;
  startedAt: string;
  endedAt: string | null;
  /** meters */
  distanceM: number | null;
  /** milliseconds */
  durationMs: number | null;
  /** meters */
  elevationGainM: number | null;
  /** bpm */
  avgHeartRateBpm: number | null;
  /** kilocalories (not kJ) */
  caloriesKcal: number | null;
  visibility: ActivityVisibility;
  /** Generated: provider !== STRAVA */
  shareable: boolean;
  demoLabeled: boolean;
  createdAt: string;
  updatedAt: string;
};

/**
 * Identity keys (P1-AUTH / P1-DATA).
 * Firebase UID is the external IdP subject. Application userId is identity_profiles.id.
 * In this schema they are the same string — do not invent a second production user id.
 */
export type CanonicalIdentityKeys = {
  firebaseUid: string;
  identityProfileId: string;
  userId: string;
  role: CanonicalRole | "admin" | null;
};

export type CanonicalIdentityProfile = {
  /** identity_profiles.id = Firebase UID = canonical userId */
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  locale: string | null;
  timezone: string | null;
  accent: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CanonicalXpEvent = {
  /** xpEventId and idempotencyKey — PK (user_id, event_id) in ascend_events */
  eventId: string;
  userId: string;
  eventType: string;
  xpAwarded: number;
  sourceType: string | null;
  /** sourceEventId when awarded from an activity / domain event */
  sourceId: string | null;
  payload: Record<string, unknown>;
  processedAt: string;
};

export type CanonicalBadgeDefinition = {
  id: string;
  nameKey: string;
  descriptionKey: string;
  rarity: string;
  xpReward: number;
};

export type CanonicalUserBadge = {
  userId: string;
  badgeId: string;
  earnedAt: string;
  sourceEventId: string | null;
};

export type CanonicalReadinessSnapshot = {
  id: string;
  userId: string;
  score: number;
  hrvMs: number | null;
  sleepHours: number | null;
  sleepEfficiency: number | null;
  strainScore: number | null;
  recoveryStatus: "green" | "amber" | "red" | null;
  formulaVersion: string;
  source: string;
  capturedAt: string;
};

export type CanonicalNotification = {
  id: string;
  recipientId: string;
  type: string;
  sourceType: string | null;
  sourceId: string | null;
  payload: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
};

export type CanonicalDomainEventName =
  | "activity.started"
  | "activity.paused"
  | "activity.resumed"
  | "activity.completed"
  | "achievement.unlocked"
  | "squad.joined"
  | "squad.activity"
  | "comment.created"
  | "xp.awarded"
  | "readiness.updated"
  | "notification.created";

export type CanonicalDomainEvent = {
  eventId: string;
  eventName: CanonicalDomainEventName | string;
  entityType: string | null;
  entityId: string | null;
  actorId: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
};

/** kj → kcal conversion helper (Android legacy field was mislabeled kJ). */
export function kjToKcal(kj: number): number {
  return kj / 4.184;
}

export function kcalToKj(kcal: number): number {
  return kcal * 4.184;
}
