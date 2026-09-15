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

export { ACTIVITY_UNITS, CANONICAL_SPORTS, READINESS_UNITS, kjToKcal, kcalToKj } from "./canonical";

export type {
  CombatFamily,
  PracticeKind,
  ContactLevel,
  MeasurementType,
  MeasurementConfidence,
  ClassificationStatus,
  CombatSessionMode,
  StrikeKind,
  PunchClass,
  KickClass,
  GrapplingKind,
  Side,
  CombatSensor,
  CombatMetricKey,
  CombatMeasurement,
  CombatEvent,
  StrikeEvent,
  GrapplingEvent,
  MovementEvent,
  ImpactSafetyEvent,
  RankSystemId,
  RulesetRef,
  MartialArtDiscipline,
  CombatRoundPrescription,
  CombatAthleteProfile
} from "./combat";

export { COMBAT_OS_VERSION } from "./combat";

export type {
  ProviderId,
  MetricProvenance,
  ProviderTier,
  ProviderConstraints,
  Provenanced,
  NormalizedSample,
  FitnessProvider
} from "./fitness";

export {
  DISABLED_AGGREGATORS,
  constraintsFor,
  missingMetric,
  reconcileSamples
} from "./fitness";

export type {
  AppCapability,
  ActiveMode,
  SubscriptionPlanId,
  CapabilitySource,
  UserCapabilities,
  EntitlementSnapshot,
  UnifiedIdentityMe
} from "./identity";

export {
  capabilitiesFromPlan,
  resolveActiveMode,
  toUserCapabilities,
  isEntitlementLive,
  effectiveCapabilities
} from "./identity";

export type {
  ExerciseMode,
  ProgressionRule,
  ProgressionState,
  SideMode,
  SetType,
  EffortScale,
  StrengthSessionStatus,
  SetSide,
  CanonicalExercise,
  CanonicalWorkoutSet,
  CanonicalStrengthSession,
  PreviousSetPerformance,
  ProgressionInput,
  ProgressionTarget,
  OneRepMaxEstimate
} from "./strength";

export { STRENGTH_SCHEMA_VERSION, EXPORT_SCHEMA_VERSION, RPE_SCALE, RIR_SCALE } from "./strength";

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
