import type { ReadinessView } from "@/lib/train/types";
import { TRAIN_PLANS } from "@/lib/train/catalog";
import type { TrainPlan } from "@/lib/train/types";
import { getSport, type SportId, sportFromLegacyTrainSport } from "./sport-registry";
import { composeSession, type ComposedSession, type TrainingBlock } from "./session-composer";
import type { SportsIdentityProfile } from "./sports-identity";

export type HonestyState =
  | "AVAILABLE"
  | "LOADING"
  | "MISSING"
  | "UNAVAILABLE"
  | "NOT_CONNECTED"
  | "ERROR";

export type AdaptationContext = {
  profile: SportsIdentityProfile;
  readiness: ReadinessView;
  recentPlanIds: string[];
  timeAvailableMin?: number;
  equipmentOverride?: string[];
};

export type TodayTrainingCard = {
  sportId: SportId;
  session: ComposedSession;
  readinessState: HonestyState;
  readinessScore: number | null;
  trainingLoadLabel: "LOW" | "MODERATE" | "HIGH" | "UNKNOWN";
  adapted: boolean;
  fuelingHint: string;
};

function readinessState(view: ReadinessView): HonestyState {
  if (view.source === "pending") return "LOADING";
  if (view.source === "unauthorized") return "ERROR";
  if (view.source === "offline") return "UNAVAILABLE";
  if (!view.available || view.score == null) return "MISSING";
  return "AVAILABLE";
}

function intensityForBand(
  band: ReadinessView["band"]
): TrainPlan["plannedIntensity"] | null {
  if (!band) return null;
  if (band === "RESTORE") return "restore";
  if (band === "RECOVER") return "recover";
  if (band === "CAUTION") return "moderate";
  if (band === "PRIMED") return "moderate";
  return "high";
}

function pickPlan(ctx: AdaptationContext, sportId: SportId): { plan: TrainPlan; adapted: boolean; why: string } {
  const profile = getSport(sportId);
  const legacy = new Set(profile.legacyTrainSports);
  const pool = TRAIN_PLANS.filter((p) => legacy.has(p.sport));
  const candidates = pool.length > 0 ? pool : TRAIN_PLANS;
  const bandIntensity = intensityForBand(ctx.readiness.band);
  const timeCap = ctx.timeAvailableMin ?? ctx.profile.sessionDurationMin ?? undefined;

  let adapted = false;
  let why = "Catalog session matched to sport profile.";
  let plan =
    candidates.find((p) => !ctx.recentPlanIds.includes(p.id)) ?? candidates[0]!;

  if (ctx.readiness.available && bandIntensity) {
    const match = candidates.find(
      (p) =>
        p.plannedIntensity === bandIntensity &&
        (timeCap == null || p.durationMin <= timeCap + 5)
    );
    if (match) {
      plan = match;
      adapted = true;
      why = `Session intensity aligned to readiness band ${ctx.readiness.band} from ${ctx.readiness.source}.`;
    } else {
      why = `Readiness band ${ctx.readiness.band} available, but no exact intensity match — using closest catalog session.`;
      adapted = true;
    }
  } else {
    why =
      "No reliable recovery signal. Showing a catalog session — not an adapted prescription.";
  }

  if (timeCap != null && plan.durationMin > timeCap) {
    const shorter = candidates.find((p) => p.durationMin <= timeCap);
    if (shorter) {
      plan = shorter;
      adapted = true;
      why += ` Duration capped to available time (~${timeCap} min).`;
    }
  }

  return { plan, adapted, why };
}

function blocksFromPlan(plan: TrainPlan): TrainingBlock[] {
  const warmup: TrainingBlock = {
    id: `${plan.id}_warmup`,
    kind: "WARMUP",
    title: "Warm-up",
    durationMin: Math.max(5, Math.round(plan.durationMin * 0.15)),
    exercises: plan.exercises.slice(0, 1).map((ex) => ({
      exerciseId: ex.exerciseId,
      name: ex.name,
      sets: 1,
      target: {
        reps: ex.targetRepsMin,
        loadKg: null,
        timeSec: ex.targetTimeSec
      },
      restSec: ex.restSec,
      isWarmup: true
    })),
    notes: "Warm-up volume is excluded from progression baseline by default."
  };

  const mainExercises = plan.exercises.slice(plan.exercises.length > 1 ? 1 : 0);
  const main: TrainingBlock = {
    id: `${plan.id}_main`,
    kind: "MAIN",
    title: "Main",
    durationMin: Math.round(plan.durationMin * 0.7),
    exercises: mainExercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      name: ex.name,
      sets: ex.targetSets,
      target: {
        reps: ex.targetRepsMax,
        loadKg: ex.targetLoadKg,
        timeSec: ex.targetTimeSec,
        rpe: null,
        rir: null
      },
      restSec: ex.restSec
    }))
  };

  const cooldown: TrainingBlock = {
    id: `${plan.id}_cooldown`,
    kind: "COOLDOWN",
    title: "Cooldown",
    durationMin: Math.max(4, Math.round(plan.durationMin * 0.1)),
    notes: "Easy movement and breath — not a scored block."
  };

  return [warmup, main, cooldown];
}

function sessionTypeForPlan(plan: TrainPlan, sportId: SportId): string {
  const types = getSport(sportId).sessionTypes;
  const training = plan.trainingType?.toLowerCase() ?? "";
  const hit = types.find((t) => training.includes(t) || t.includes(training.split(" ")[0] ?? ""));
  if (hit) return hit;
  if (plan.plannedIntensity === "restore" || plan.plannedIntensity === "recover") {
    return types.includes("recovery") ? "recovery" : types[0]!;
  }
  return types.find((t) => t === "strength" || t === "easy" || t === "endurance") ?? types[0]!;
}

function fuelingHint(sportId: SportId, sessionType: string, intensity: string): string {
  const profile = getSport(sportId).nutritionProfileKey;
  if (intensity === "restore" || sessionType === "recovery") {
    return "Rest/recovery day fueling — prioritize protein and hydration; no aggressive restriction.";
  }
  if (profile === "endurance" && (sessionType.includes("long") || sessionType.includes("threshold") || intensity === "high" || intensity === "peak")) {
    return "Endurance session — consider carbohydrate availability around the session (confirm foods before logging).";
  }
  if (profile === "combat") {
    return "Combat training fueling — food-first; never dehydrate or cut weight acutely via this app.";
  }
  if (profile === "strength" || profile === "hypertrophy") {
    return "Strength session — protein distribution across meals; confirm any meal log explicitly.";
  }
  return "Fuel according to today's session demand — open nutrition context to confirm.";
}

/** TrainingAdaptationEngine — explainable, never "AI decided". */
export function adaptTodaySession(ctx: AdaptationContext): TodayTrainingCard {
  const sportId =
    ctx.profile.primarySport ??
    (ctx.profile.secondarySports[0] ?? "GENERAL_FITNESS");

  const { plan, adapted, why } = pickPlan(ctx, sportId);
  const sessionType = sessionTypeForPlan(plan, sportId);
  const blocks = blocksFromPlan(plan);
  const session = composeSession({
    sportId,
    sessionType,
    intent: plan.purpose,
    durationMin: plan.durationMin,
    equipment: ctx.equipmentOverride ?? plan.equipment,
    blocks,
    legacyPlanId: plan.id,
    plannedIntensity: plan.plannedIntensity,
    explanation: {
      what: plan.title,
      why,
      dataUsed: [
        `sport:${sportId}`,
        `readiness:${ctx.readiness.available ? ctx.readiness.band ?? "score" : "unavailable"}`,
        `source:${ctx.readiness.source}`,
        ctx.recentPlanIds[0] ? `recent:${ctx.recentPlanIds[0]}` : "recent:none"
      ],
      confidence: ctx.readiness.available ? "MEDIUM" : "LOW"
    }
  });

  const loadLabel: TodayTrainingCard["trainingLoadLabel"] =
    plan.plannedIntensity === "peak" || plan.plannedIntensity === "high"
      ? "HIGH"
      : plan.plannedIntensity === "moderate"
        ? "MODERATE"
        : plan.plannedIntensity === "restore" || plan.plannedIntensity === "recover"
          ? "LOW"
          : "UNKNOWN";

  return {
    sportId,
    session,
    readinessState: readinessState(ctx.readiness),
    readinessScore: ctx.readiness.score,
    trainingLoadLabel: loadLabel,
    adapted,
    fuelingHint: fuelingHint(sportId, sessionType, plan.plannedIntensity)
  };
}

export function resolveSportIdFromTrainSport(legacy: string): SportId {
  return sportFromLegacyTrainSport(legacy);
}
