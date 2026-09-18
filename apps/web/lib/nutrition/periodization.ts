/**
 * V10.3 Nutrition periodization — day-kind aware targets context.
 * Builds on planning-engine; never invents body metrics.
 */

import { planDailyTargets } from "@/lib/nutrition/planning-engine";
import type { NutritionProfile, DailyNutritionTarget } from "@/lib/nutrition/types";

export type NutritionDayKind =
  | "rest"
  | "easy"
  | "moderate"
  | "hard"
  | "long"
  | "competition"
  | "recovery";

export type PeriodizedNutritionPlan = {
  dayKind: NutritionDayKind;
  targets: DailyNutritionTarget;
  fuelingWindows: Array<{
    slot: "pre" | "during" | "post" | "recovery" | "rest";
    guidance: string;
    applicable: boolean;
  }>;
  hydrationContext: {
    estimateMl: number | null;
    caution: string;
  };
};

export function periodizeNutritionDay(input: {
  profile: NutritionProfile;
  sportNutritionKey: string;
  dayKind: NutritionDayKind;
  bodyMassKg: number | null;
  sessionDurationMin: number | null;
}): PeriodizedNutritionPlan {
  const targets = planDailyTargets({
    profile: input.profile,
    sportNutritionKey: input.sportNutritionKey,
    trainingDayKind: input.dayKind,
    bodyMassKg: input.bodyMassKg,
    sessionDurationMin: input.sessionDurationMin
  });

  const fuelingWindows: PeriodizedNutritionPlan["fuelingWindows"] = [
    {
      slot: "pre",
      guidance: "Prefer familiar carbohydrate 1–3h pre-session when training.",
      applicable: !["rest", "recovery"].includes(input.dayKind)
    },
    {
      slot: "during",
      guidance: "During-session fueling only for long/hard/competition when duration supports it.",
      applicable: ["long", "hard", "competition"].includes(input.dayKind)
    },
    {
      slot: "post",
      guidance: "Post-session protein + carbohydrate within recovery window.",
      applicable: !["rest"].includes(input.dayKind)
    },
    {
      slot: "recovery",
      guidance: "Emphasize energy availability; avoid aggressive deficit.",
      applicable: input.dayKind === "recovery" || input.dayKind === "rest"
    },
    {
      slot: "rest",
      guidance: "Maintain protein; reduce session-specific carb loading.",
      applicable: input.dayKind === "rest"
    }
  ];

  return {
    dayKind: input.dayKind,
    targets,
    fuelingWindows: fuelingWindows.filter((w) => w.applicable),
    hydrationContext: {
      estimateMl: targets.hydrationMl,
      caution:
        "Never automate acute weight cutting, diuretics, or dangerous fluid restriction. Hydration estimate only."
    }
  };
}
