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
  | "PAUSED"
  | "FINISHED"
  | "CANCELLED";

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
