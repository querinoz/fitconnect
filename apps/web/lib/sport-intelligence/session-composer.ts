import type { SportId } from "./sport-registry";

export type BlockKind =
  | "WARMUP"
  | "PREP"
  | "SKILL"
  | "MAIN"
  | "ACCESSORY"
  | "CONDITIONING"
  | "RECOVERY"
  | "COOLDOWN"
  | "INSTRUCTION"
  | "NUTRITION_TIMING";

export type ExerciseUnit =
  | "reps"
  | "seconds"
  | "minutes"
  | "distance_m"
  | "weight_kg"
  | "speed"
  | "pace"
  | "power_w"
  | "calories"
  | "rounds"
  | "laps";

export type TrainingExerciseSpec = {
  id: string;
  name: string;
  sportIds: SportId[];
  movementPattern: string;
  muscleGroups: string[];
  equipment: string[];
  difficulty: "easy" | "moderate" | "hard";
  instructions: string;
  coachingCues: string[];
  contraindications: string[];
  units: ExerciseUnit[];
  defaultRestSec: number;
  progressionMode: string;
  /** Warm-up flag — excluded from progression baseline by default */
  isWarmup?: boolean;
};

export type TrainingSetTarget = {
  reps?: number | null;
  loadKg?: number | null;
  timeSec?: number | null;
  distanceM?: number | null;
  paceSecPerKm?: number | null;
  powerW?: number | null;
  rir?: number | null;
  rpe?: number | null;
};

export type TrainingSetLogged = TrainingSetTarget & {
  completedAtMs: number;
  skipped?: boolean;
};

export type TrainingInterval = {
  id: string;
  workSec: number;
  restSec: number;
  repeats: number;
  target?: TrainingSetTarget;
};

export type RestBlock = { kind: "REST"; durationSec: number };
export type InstructionBlock = { kind: "INSTRUCTION"; text: string };

export type TrainingBlock = {
  id: string;
  kind: BlockKind;
  title: string;
  durationMin?: number;
  exercises?: Array<{
    exerciseId: string;
    name: string;
    sets: number;
    target: TrainingSetTarget;
    restSec: number;
    isWarmup?: boolean;
  }>;
  intervals?: TrainingInterval[];
  notes?: string;
};

export type ComposedSession = {
  id: string;
  sportId: SportId;
  sessionType: string;
  intent: string;
  title: string;
  durationMin: number;
  plannedIntensity: "restore" | "recover" | "moderate" | "high" | "peak";
  equipment: string[];
  blocks: TrainingBlock[];
  explanation: {
    what: string;
    why: string;
    dataUsed: string[];
    confidence: "HIGH" | "MEDIUM" | "LOW";
  };
  /** Linked legacy catalog plan when composed from existing TRAIN plans */
  legacyPlanId?: string;
};

export type SessionComposerInput = {
  sportId: SportId;
  sessionType: string;
  intent: string;
  durationMin: number;
  equipment: string[];
  blocks: TrainingBlock[];
  legacyPlanId?: string;
  explanation: ComposedSession["explanation"];
  plannedIntensity?: ComposedSession["plannedIntensity"];
};

export function composeSession(input: SessionComposerInput): ComposedSession {
  return {
    id: `session_${input.sportId}_${input.sessionType}_${Date.now()}`,
    sportId: input.sportId,
    sessionType: input.sessionType,
    intent: input.intent,
    title: `${input.sessionType.replace(/_/g, " ")} · ${input.intent}`,
    durationMin: input.durationMin,
    plannedIntensity: input.plannedIntensity ?? "moderate",
    equipment: input.equipment,
    blocks: input.blocks,
    explanation: input.explanation,
    legacyPlanId: input.legacyPlanId
  };
}

export function blockOrder(kind: BlockKind): number {
  const order: BlockKind[] = [
    "WARMUP",
    "PREP",
    "SKILL",
    "MAIN",
    "ACCESSORY",
    "CONDITIONING",
    "RECOVERY",
    "COOLDOWN",
    "INSTRUCTION",
    "NUTRITION_TIMING"
  ];
  return order.indexOf(kind);
}

export function sortBlocks(blocks: TrainingBlock[]): TrainingBlock[] {
  return [...blocks].sort((a, b) => blockOrder(a.kind) - blockOrder(b.kind));
}
