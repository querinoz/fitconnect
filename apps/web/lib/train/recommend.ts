import { TRAIN_PLANS } from "./catalog";
import { listLocalHistory } from "./persistence";
import type { ReadinessView, TrainPlan } from "./types";

export type Recommendation = {
  plan: TrainPlan;
  adapted: boolean;
  reason: string;
};

export function recommendPlan(readiness: ReadinessView, plans = TRAIN_PLANS): Recommendation {
  const fallback = plans.find((plan) => plan.id === "plan_upper_push_v2") ?? plans[0]!;
  const recent = typeof window !== "undefined" ? listLocalHistory()[0] : undefined;
  const recentNote =
    recent && recent.planId === fallback.id
      ? " Your last session on this device was the same plan — pick another card if you want variety."
      : "";

  if (!readiness.available || !readiness.band) {
    return {
      plan: fallback,
      adapted: false,
      reason:
        "No reliable recovery signal. Showing the default strength session — not an adapted prescription." +
        recentNote
    };
  }
  const pick =
    readiness.band === "RESTORE"
      ? plans.find((plan) => plan.plannedIntensity === "restore")
      : readiness.band === "RECOVER"
        ? plans.find((plan) => plan.plannedIntensity === "recover" || plan.sport === "mobility")
        : readiness.band === "CAUTION"
          ? plans.find((plan) => plan.plannedIntensity === "moderate" && plan.durationMin <= 30)
          : readiness.band === "PRIMED"
            ? plans.find((plan) => plan.sport === "strength" && plan.difficulty === "moderate")
            : plans.find((plan) => plan.id === "plan_upper_push_v2");
  return {
    plan: pick ?? fallback,
    adapted: true,
    reason: `Matched to your ${readiness.band} band from ${readiness.source}. This uses your private score only.`
  };
}
