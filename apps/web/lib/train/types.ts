export type TrainSport =
  | "strength"
  | "hypertrophy"
  | "endurance"
  | "running"
  | "cycling"
  | "hiit"
  | "mobility"
  | "recovery"
  | "conditioning"
  | "sport"
  | "martial_arts";

export type TrainGoal =
  | "strength"
  | "hypertrophy"
  | "endurance"
  | "power"
  | "mobility"
  | "recovery"
  | "conditioning";

export type TrainDifficulty = "easy" | "moderate" | "hard";

export type TrainLocation = "gym" | "home" | "outdoor" | "pool";

export type PlannedIntensity = "restore" | "recover" | "moderate" | "high" | "peak";

export type ExerciseMode = "reps" | "time" | "bodyweight";

export type TrainExercise = {
  exerciseId: string;
  name: string;
  mode: ExerciseMode;
  weighted: boolean;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  targetLoadKg: number | null;
  targetTimeSec: number | null;
  restSec: number;
  tempo?: string;
  notes: string;
  muscles: string[];
  instructions: string;
  substitutions: string[];
};

export type CombatPlanMeta = {
  disciplineId: string;
  sessionMode: string;
  roundCount: number;
  roundDurationSec: number;
  restDurationSec: number;
  warningSec: number;
  focus: string;
};

export type TrainPlan = {
  id: string;
  title: string;
  purpose: string;
  outcome: string;
  durationMin: number;
  difficulty: TrainDifficulty;
  equipment: string[];
  location: TrainLocation;
  sport: TrainSport;
  goal: TrainGoal;
  plannedIntensity: PlannedIntensity;
  trainingType: string;
  muscleGroups: string[];
  structure: string[];
  zenithNote: string;
  exercises: TrainExercise[];
  combat?: CombatPlanMeta;
};

export type TrainSlot = {
  slotIndex: number;
  exerciseId: string;
  name: string;
  setNumber: number;
  targetSets: number;
  mode: ExerciseMode;
  weighted: boolean;
  targetRepsMin: number;
  targetRepsMax: number;
  targetLoadKg: number | null;
  targetTimeSec: number | null;
  restSec: number;
  notes: string;
  muscles: string[];
  instructions: string;
  substitutions: string[];
  tempo?: string;
};

export type TrainPhase =
  | "idle"
  | "prep"
  | "warmup"
  | "active"
  | "rest"
  | "paused"
  | "substituting"
  | "interrupted"
  | "completing"
  | "complete";

export type LoggedSet = {
  exerciseId: string;
  name: string;
  setNumber: number;
  reps: number | null;
  loadKg: number | null;
  timeSec: number | null;
  rpe: number | null;
  completedAtMs: number;
  skipped: boolean;
};

export type SaveStatus = "idle" | "save_pending" | "saved" | "local_only" | "failed";

export type TrainSnapshot = {
  phase: TrainPhase;
  resumePhase: TrainPhase | null;
  planId: string | null;
  sessionId: string;
  startedAtMs: number | null;
  completedAtMs: number | null;
  slotIndex: number;
  restRemainingSec: number;
  restDurationSec: number;
  workRemainingSec: number;
  workDurationSec: number;
  sets: LoggedSet[];
  lastError: string | null;
  saveStatus: SaveStatus;
  substituted: Record<string, string>;
};

export type ReadinessBand = "READY" | "PRIMED" | "CAUTION" | "RECOVER" | "RESTORE";

export type ReadinessView = {
  score: number | null;
  band: ReadinessBand | null;
  source: string;
  available: boolean;
  detail: string;
};

export type TrainCommand =
  | { type: "select_plan"; planId: string }
  | { type: "start"; nowMs: number; sessionId: string }
  | { type: "log_set"; nowMs: number; reps: number | null; loadKg: number | null; timeSec: number | null; rpe: number | null }
  | { type: "skip_exercise"; nowMs: number }
  | { type: "skip_rest" }
  | { type: "extend_rest"; extraSec: number }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "interrupt"; reason?: string }
  | { type: "enter_substitution" }
  | { type: "cancel_substitution" }
  | { type: "tick" }
  | { type: "finish"; nowMs: number }
  | { type: "reset" }
  | { type: "restore"; snapshot: TrainSnapshot }
  | { type: "mark_save"; status: SaveStatus; error?: string }
  | { type: "substitute"; replacementExerciseId: string };

export const TRAIN_PHASE_LABEL: Record<TrainPhase, string> = {
  idle: "IDLE",
  prep: "PREP",
  warmup: "WARM-UP",
  active: "ACTIVE",
  rest: "REST",
  paused: "PAUSED",
  substituting: "SUBSTITUTION",
  interrupted: "INTERRUPTED",
  completing: "COMPLETING",
  complete: "COMPLETED"
};

export const SAVE_STATUS_LABEL: Record<SaveStatus, string> = {
  idle: "READY",
  save_pending: "SAVE PENDING",
  saved: "SAVED",
  local_only: "LOCAL",
  failed: "SAVE FAILED"
};
