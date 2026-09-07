/**
 * FitConnect strength training domain (workout engine v1).
 * Cross-platform contracts — storage units explicit.
 */

export type ExerciseMode =
  | "REPS"
  | "TIME"
  | "DISTANCE"
  | "DURATION_SPEED"
  | "BODYWEIGHT"
  | "WEIGHTED_BODYWEIGHT";

export type ProgressionRule =
  | "LINEAR"
  | "DOUBLE_PROGRESSION"
  | "GREYSKULL_LP"
  | "TIME_PROGRESSION"
  | "NONE";

export type ProgressionState = "advance" | "hold" | "deload" | "reset";

export type SideMode = "none" | "per_side" | "alternating";

export type SetType = "warmup" | "working" | "dropset" | "amrap";

export type EffortScale = "rpe" | "rir";

export type StrengthSessionStatus =
  | "IDLE"
  | "PREP"
  | "ACTIVE"
  | "REST"
  | "PAUSED"
  | "COMPLETING"
  | "COMPLETED"
  | "FAILED"
  | "RECOVERING"
  | "SYNC_PENDING"
  | "SYNCED"
  | "FINISHED"
  | "CANCELLED";

/** Logged set laterality. BOTH is the default for bilateral work. */
export type SetSide = "LEFT" | "RIGHT" | "BOTH" | "NONE";

/**
 * RPE: Borg CR-10 mapped to 1–10 (optional). Half-steps allowed.
 * RIR: reps in reserve 0–5 (optional). Missing values stay null — never fabricated.
 */
export const RPE_SCALE = { min: 1, max: 10, step: 0.5 } as const;
export const RIR_SCALE = { min: 0, max: 5, step: 1 } as const;

export type CanonicalExercise = {
  id: string;
  userId: string | null;
  name: string;
  category: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string[];
  mode: ExerciseMode;
  sideAware: boolean;
  weighted: boolean;
  instructions: string | null;
  mediaUrl: string | null;
  mediaLicense: string | null;
  isCustom: boolean;
  source: "builtin" | "custom" | "imported";
};

export type CanonicalWorkoutSet = {
  setId: string;
  sessionId: string;
  exerciseId: string;
  sequence: number;
  setType: SetType;
  supersetGroupId: string | null;
  sideMode: SideMode;
  targetReps: number | null;
  actualReps: number | null;
  targetWeightKg: number | null;
  actualWeightKg: number | null;
  targetTimeSec: number | null;
  actualTimeSec: number | null;
  targetDistanceM: number | null;
  actualDistanceM: number | null;
  rpe: number | null;
  rir: number | null;
  side: SetSide;
  effortScale: EffortScale | null;
  completedAt: string | null;
  isFailed: boolean;
};

export type CanonicalStrengthSession = {
  sessionId: string;
  userId: string;
  workoutOccurrenceId: string | null;
  activityId: string | null;
  status: StrengthSessionStatus;
  startedAt: string | null;
  pausedAt: string | null;
  resumedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
};

export type PreviousSetPerformance = {
  setType: SetType;
  actualReps: number | null;
  actualWeightKg: number | null;
  actualTimeSec: number | null;
  targetReps: number | null;
  targetWeightKg: number | null;
  isFailed: boolean;
};

export type ProgressionInput = {
  rule: ProgressionRule;
  exerciseMode: ExerciseMode;
  sideMode: SideMode;
  previousSets: PreviousSetPerformance[];
  repMin: number;
  repMax: number;
  weightStepKg: number;
  timeStepSec: number;
  stallCount: number;
  deloadPercent: number;
};

export type ProgressionTarget = {
  targetWeightKg: number | null;
  targetRepsMin: number;
  targetRepsMax: number;
  targetTimeSec: number | null;
  rationale: string;
  progressionState: ProgressionState;
};

export type OneRepMaxEstimate = {
  estimatedKg: number;
  sourceWeightKg: number;
  sourceReps: number;
  formula: "epley";
  confidence: "high" | "medium" | "low";
  disclaimer: string;
};

export const STRENGTH_SCHEMA_VERSION = "fitconnect-strength-v1" as const;

export const EXPORT_SCHEMA_VERSION = "fitconnect-export-v1" as const;
