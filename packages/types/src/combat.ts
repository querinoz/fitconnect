/**
 * Martial Arts / Combat Sports OS — shared contracts.
 * Web, Android, Wear, and iOS must share these semantics.
 *
 * Force is never inferred from acceleration. Missing stays missing.
 */

export const COMBAT_OS_VERSION = "2026.09.1";

export type CombatFamily =
  | "striking"
  | "grappling"
  | "mixed"
  | "traditional_cultural"
  | "self_defense"
  | "internal";

export type PracticeKind =
  | "sport"
  | "combat_sport"
  | "martial_art"
  | "traditional_practice"
  | "cultural_practice"
  | "fitness_conditioning"
  | "self_defense";

export type ContactLevel = "none" | "light" | "moderate" | "full" | "varies";

export type MeasurementType = "DIRECT" | "ESTIMATED" | "PROXY";

export type MeasurementConfidence = "HIGH" | "MEDIUM" | "LOW" | "MISSING";

export type ClassificationStatus = "DETECTED" | "CLASSIFIED" | "CONFIRMED";

export type CombatSessionMode =
  | "technique"
  | "pad_work"
  | "bag_work"
  | "shadowboxing"
  | "sparring"
  | "drill"
  | "footwork"
  | "conditioning"
  | "strength"
  | "mobility"
  | "grappling_drill"
  | "rolling"
  | "live_round"
  | "competition_prep"
  | "recovery"
  | "warmup"
  | "cooldown"
  | "kata"
  | "kumite"
  | "taolu"
  | "sanda"
  | "roda"
  | "forms"
  | "randori";

export type StrikeKind =
  | "punch"
  | "kick"
  | "knee"
  | "elbow"
  | "headbutt"
  | "open_hand"
  | "weapon_form";

export type PunchClass = "jab" | "cross" | "hook" | "uppercut" | "overhand" | "unclassified";

export type KickClass =
  | "front"
  | "round"
  | "side"
  | "back"
  | "push"
  | "low"
  | "body"
  | "head"
  | "turning"
  | "unclassified";

export type GrapplingKind =
  | "takedown"
  | "throw"
  | "sweep"
  | "pass"
  | "control"
  | "submission"
  | "escape"
  | "sprawl"
  | "scramble"
  | "shot"
  | "mat_return"
  | "hold_down";

export type Side = "left" | "right" | "both" | "unknown";

export type CombatSensor =
  | "WATCH_IMU"
  | "PHONE_IMU"
  | "GLOVE_IMU"
  | "WRIST_BAND_IMU"
  | "INSTRUMENTED_GLOVE_FORCE"
  | "INSTRUMENTED_BAG"
  | "INSTRUMENTED_PAD"
  | "INSOLE_PRESSURE"
  | "FORCE_PLATE"
  | "HR_STRAP"
  | "HR_WATCH"
  | "SEMG"
  | "ELECTRONIC_SCORING"
  | "MANUAL"
  | "COACH"
  | "OFFICIAL_RESULT"
  | "UNKNOWN";

export type CombatMetricKey =
  | "punch_count"
  | "kick_count"
  | "knee_count"
  | "elbow_count"
  | "strike_count"
  | "strike_rate"
  | "strike_acceleration"
  | "strike_velocity"
  | "peak_velocity"
  | "impact_force"
  | "impact_estimate"
  | "impact_impulse"
  | "contact_duration"
  | "combination_length"
  | "work_rate"
  | "output_decline"
  | "heart_rate"
  | "distance"
  | "round_duration"
  | "control_time"
  | "takedown_attempts"
  | "takedowns"
  | "submission_attempts"
  | "rpe"
  | "session_duration";

export type CombatMeasurement = {
  metric: CombatMetricKey | string;
  value: number | null;
  unit: string | null;
  measurementType: MeasurementType;
  sensor: CombatSensor;
  source: string;
  provider: string;
  confidence: MeasurementConfidence;
  sampledAt: string | null;
  sessionId: string;
  roundIndex: number | null;
  notes?: string;
};

export type CombatEventBase = {
  id: string;
  sessionId: string;
  roundIndex: number | null;
  occurredAtMs: number;
  source: CombatSensor;
  classification: ClassificationStatus;
  confidence: MeasurementConfidence;
  confirmedBy: string | null;
};

export type StrikeEvent = CombatEventBase & {
  kind: "strike";
  strikeKind: StrikeKind;
  punchClass?: PunchClass;
  kickClass?: KickClass;
  side: Side;
  target: "head" | "body" | "leg" | "unknown";
  measurements: CombatMeasurement[];
};

export type GrapplingEvent = CombatEventBase & {
  kind: "grappling";
  grapplingKind: GrapplingKind;
  techniqueFamily: string | null;
  successful: boolean | null;
  durationMs: number | null;
  measurements: CombatMeasurement[];
};

export type MovementEvent = CombatEventBase & {
  kind: "movement";
  label: string;
  measurements: CombatMeasurement[];
};

export type ImpactSafetyEvent = CombatEventBase & {
  kind: "impact_safety";
  region: "head" | "body" | "unknown";
  /** Never a medical diagnosis. */
  advisory: "IMPACT_EVENT";
};

export type CombatEvent = StrikeEvent | GrapplingEvent | MovementEvent | ImpactSafetyEvent;

export type RankSystemId =
  | "none"
  | "bjj_ibjjf"
  | "judo_kyu_dan"
  | "karate_kyu_dan"
  | "tkd_geup_dan"
  | "capoeira_cordao"
  | "kendo_kyu_dan"
  | "sambo_sport"
  | "wrestling_none"
  | "boxing_none"
  | "org_specific";

export type RulesetRef = {
  id: string;
  version: string;
  name: string;
  scoringConcepts: string[];
  /** Scoring is never inferred from a generic wearable. */
  officialScoringFromWearable: false;
};

export type MartialArtDiscipline = {
  id: string;
  name: string;
  aliases: string[];
  regions: string[];
  tradition: string;
  family: CombatFamily;
  practiceKinds: PracticeKind[];
  competitive: boolean;
  noncompetitive: boolean;
  contactLevel: ContactLevel;
  styles: string[];
  rulesets: RulesetRef[];
  sessionModes: CombatSessionMode[];
  techniqueFamilies: string[];
  equipment: string[];
  metrics: CombatMetricKey[];
  federations: string[];
  coachSpecialization: string;
  rankSystem: RankSystemId;
  unescoIch?: { id: string; year: number; title: string };
  culturalNote?: string;
  telemetryNotes: string;
};

export type CombatRoundPrescription = {
  roundCount: number;
  workSec: number;
  restSec: number;
  warningSec: number;
  countdownSec: number;
  sessionMode: CombatSessionMode;
};

export type CombatAthleteProfile = {
  userId: string;
  primaryDisciplineId: string | null;
  disciplines: string[];
  rankSystem: RankSystemId | null;
  rank: string | null;
  rankSource: "self" | "coach" | "federation" | null;
  promotionDate: string | null;
  gym: string | null;
  coach: string | null;
  weightClass: string | null;
  competitionRecord: { wins: number; losses: number; draws: number; source: string } | null;
};
