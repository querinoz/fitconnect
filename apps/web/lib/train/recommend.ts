import { TRAIN_PLANS } from "./catalog";
import { listLocalHistory } from "./persistence";
import type { ReadinessView, TrainPlan, TrainSport } from "./types";

export type Recommendation = {
  plan: TrainPlan;
  adapted: boolean;
  reason: string;
};

export function recommendPlan(
  readiness: ReadinessView,
  plans = TRAIN_PLANS,
  preferredSport?: TrainSport | "all" | string
): Recommendation {
  const combat = plans.filter((plan) => plan.sport === "martial_arts");
  const useCombat = preferredSport === "martial_arts" && combat.length > 0;
  const fallback = useCombat
    ? (combat.find((plan) => plan.id === "plan_combat_v1") ?? combat[0]!)
    : (plans.find((plan) => plan.id === "plan_upper_push_v2") ?? plans[0]!);
  const recent = typeof window !== "undefined" ? listLocalHistory()[0] : undefined;
  const recentNote =
    recent && recent.planId === fallback.id
      ? " Your last session on this device was the same plan — pick another card if you want variety."
      : "";

  if (!readiness.available || !readiness.band) {
    return {
      plan: fallback,
      adapted: false,
      reason: useCombat
        ? "No reliable recovery signal. Showing a catalog combat session — not an adapted fight camp." +
          recentNote
        : "No reliable recovery signal. Showing the default strength session — not an adapted prescription." +
          recentNote
    };
  }

  const pool = useCombat ? combat : plans;
  const pick =
    readiness.band === "RESTORE"
      ? pool.find((plan) => plan.plannedIntensity === "restore") ??
        plans.find((plan) => plan.plannedIntensity === "restore")
      : readiness.band === "RECOVER"
        ? pool.find((plan) => plan.plannedIntensity === "recover" || plan.sport === "mobility") ??
          plans.find((plan) => plan.sport === "mobility")
        : readiness.band === "CAUTION"
          ? pool.find((plan) => plan.plannedIntensity === "moderate" && plan.durationMin <= 30)
          : readiness.band === "PRIMED"
            ? pool.find((plan) =>
                useCombat
                  ? plan.difficulty === "moderate"
                  : plan.sport === "strength" && plan.difficulty === "moderate"
              )
            : useCombat
              ? pool.find((plan) => plan.id === "plan_boxing_bag_v1")
              : pool.find((plan) => plan.id === "plan_upper_push_v2");
  return {
    plan: pick ?? fallback,
    adapted: true,
    reason: useCombat
      ? `Combat catalog matched to your ${readiness.band} band from ${readiness.source}. Private score only — not a sparring clearance.`
      : `Matched to your ${readiness.band} band from ${readiness.source}. This uses your private score only.`
  };
}
