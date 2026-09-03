export type {
  UserRole,
  RecoveryStatus,
  WearableProvider,
  PlanBlock,
  ReadinessSnapshot,
  SessionSummary,
  ThreadMessage,
  PaginatedMeta,
  PaginatedSessionsResponse,
  ReadinessComputeStatus,
  ReadinessComputeResult
} from "./domain";

export type {
  CanonicalRole,
  ActivityVisibility,
  CanonicalSport,
  CanonicalActivity,
  CanonicalIdentityKeys,
  CanonicalIdentityProfile,
  CanonicalXpEvent,
  CanonicalBadgeDefinition,
  CanonicalUserBadge,
  CanonicalReadinessSnapshot,
  CanonicalNotification,
  CanonicalDomainEventName,
  CanonicalDomainEvent
} from "./canonical";

export { ACTIVITY_UNITS, READINESS_UNITS, kjToKcal, kcalToKj } from "./canonical";

export type {
  StravaSportType,
  StravaLegacyActivityType,
  StravaSummaryActivity,
  StravaDetailedActivity,
  StravaLap,
  StravaSegmentEffort,
  StravaStream,
  StravaStreamType,
  StravaWebhookEvent,
  StravaRateLimit,
  SportCategory,
  SportTypeMeta
} from "./strava";

export {
  STRAVA_SPORT_TYPES,
  SportTypeConfig,
  resolveStravaSportType,
  getSportMeta
} from "./strava";
