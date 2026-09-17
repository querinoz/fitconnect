import type {
  DailyNutritionTarget,
  MealPlanDay,
  MealSlotId,
  NutritionProfile,
  FoodRecord
} from "./types";
import { allergenBlocked, planDailyTargets, type MacroPlanInput } from "./planning-engine";
import { FOOD_SEED } from "./sources/food-catalog";

export type PantryItem = {
  foodId: string;
  quantity: number;
  unit: string;
};

export type MealPlanRequest = {
  profile: NutritionProfile;
  sportNutritionKey: string;
  trainingDayKind: MacroPlanInput["trainingDayKind"];
  bodyMassKg: number | null;
  sessionDurationMin: number | null;
  /** Week start ISO date (YYYY-MM-DD), Monday preferred */
  weekStartISO: string;
  pantry?: PantryItem[];
  /** Foods already preferred by the athlete */
  preferredFoodIds?: string[];
};

export type PlannedMealSlot = MealPlanDay["slots"][number] & {
  foods: FoodRecord[];
};

export type GeneratedMealPlan = {
  weekStartISO: string;
  days: Array<Omit<MealPlanDay, "slots"> & { slots: PlannedMealSlot[] }>;
  evidenceConfigVersion: string;
};

const SLOT_ORDER: MealSlotId[] = [
  "breakfast",
  "lunch",
  "pre_workout",
  "post_workout",
  "dinner",
  "snack"
];

const SLOT_LABELS: Record<MealSlotId, string> = {
  breakfast: "Breakfast",
  mid_morning: "Mid-morning",
  lunch: "Lunch",
  pre_workout: "Pre-workout",
  during_workout: "During workout",
  post_workout: "Post-workout",
  dinner: "Dinner",
  evening: "Evening",
  snack: "Snack"
};

function addDaysISO(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function trainingContextLabel(kind: MacroPlanInput["trainingDayKind"]): string {
  return kind.toUpperCase().replace(/_/g, " ");
}

function scoreFood(
  food: FoodRecord,
  slot: MealSlotId,
  profile: NutritionProfile,
  pantryIds: Set<string>,
  preferred: Set<string>
): { score: number; why: string[] } {
  if (allergenBlocked(food, profile.allergies)) {
    return { score: -Infinity, why: ["Blocked: allergen match"] };
  }
  for (const d of profile.dislikes) {
    if (d && food.name.toLowerCase().includes(d.toLowerCase())) {
      return { score: -Infinity, why: [`Blocked: dislike (${d})`] };
    }
  }

  const why: string[] = [];
  let score = 0;

  if (pantryIds.has(food.foodId)) {
    score += 40;
    why.push("Uses foods already in your pantry");
  }
  if (preferred.has(food.foodId)) {
    score += 20;
    why.push("Matches your preferred foods");
  }
  if (profile.countryLocale.startsWith("pt") && food.source === "PORTFIR") {
    score += 15;
    why.push("PortFIR-tagged food for PT locale");
  }
  if (food.confidence === "HIGH") score += 10;
  else if (food.confidence === "MEDIUM") score += 5;

  if (slot === "pre_workout" || slot === "during_workout") {
    if (food.carbohydrateG >= 15) {
      score += 25;
      why.push("Fits pre/during session carbohydrate fueling");
    }
  }
  if (slot === "post_workout") {
    if (food.proteinG >= 15) {
      score += 25;
      why.push("Provides protein within recovery target range");
    }
    if (food.carbohydrateG >= 10) {
      score += 10;
      why.push("Supports post-session carbohydrate recovery");
    }
  }
  if (slot === "breakfast" || slot === "lunch" || slot === "dinner") {
    if (food.proteinG >= 7) score += 8;
    if ((food.fiberG ?? 0) >= 2) {
      score += 5;
      why.push("Contributes fiber toward daily coherence");
    }
  }

  if (why.length === 0) why.push("Available in catalog with source metadata");
  return { score, why };
}

function pickForSlot(
  slot: MealSlotId,
  profile: NutritionProfile,
  catalog: FoodRecord[],
  pantryIds: Set<string>,
  preferred: Set<string>,
  used: Set<string>
): PlannedMealSlot | null {
  const ranked = catalog
    .map((food) => {
      const { score, why } = scoreFood(food, slot, profile, pantryIds, preferred);
      const varietyPenalty = used.has(food.foodId) ? 30 : 0;
      return { food, score: score - varietyPenalty, why };
    })
    .filter((r) => Number.isFinite(r.score) && r.score > -1000)
    .sort((a, b) => b.score - a.score);

  const top = ranked[0];
  if (!top) return null;
  used.add(top.food.foodId);
  return {
    slot,
    label: SLOT_LABELS[slot],
    foodIds: [top.food.foodId],
    why: top.why.slice(0, 4),
    foods: [top.food]
  };
}

function slotsForDay(kind: MacroPlanInput["trainingDayKind"]): MealSlotId[] {
  if (kind === "rest" || kind === "recovery") {
    return ["breakfast", "lunch", "dinner", "snack"];
  }
  if (kind === "long" || kind === "competition" || kind === "hard") {
    return ["breakfast", "lunch", "pre_workout", "post_workout", "dinner"];
  }
  return ["breakfast", "lunch", "post_workout", "dinner"];
}

/** Constraint-aware weekly meal plan — never silently mutates diary. */
export function generateWeeklyMealPlan(req: MealPlanRequest): GeneratedMealPlan {
  const targets: DailyNutritionTarget = planDailyTargets({
    profile: req.profile,
    sportNutritionKey: req.sportNutritionKey,
    trainingDayKind: req.trainingDayKind,
    bodyMassKg: req.bodyMassKg,
    sessionDurationMin: req.sessionDurationMin
  });

  const pantryIds = new Set((req.pantry ?? []).map((p) => p.foodId));
  const preferred = new Set(req.preferredFoodIds ?? []);
  const days: GeneratedMealPlan["days"] = [];

  for (let i = 0; i < 7; i++) {
    const dateISO = addDaysISO(req.weekStartISO, i);
    const used = new Set<string>();
    const daySlots = slotsForDay(req.trainingDayKind);
    const slots: PlannedMealSlot[] = [];
    for (const slot of daySlots) {
      if (!SLOT_ORDER.includes(slot) && !daySlots.includes(slot)) continue;
      const planned = pickForSlot(slot, req.profile, FOOD_SEED, pantryIds, preferred, used);
      if (planned) slots.push(planned);
    }
    days.push({
      dateISO,
      trainingContext: trainingContextLabel(req.trainingDayKind),
      targets,
      slots
    });
  }

  return {
    weekStartISO: req.weekStartISO,
    days,
    evidenceConfigVersion: targets.evidenceConfigVersion
  };
}

/** Property: no allergen-blocked food enters generated slots. */
export function mealPlanAllergenSafe(plan: GeneratedMealPlan, allergies: string[]): boolean {
  for (const day of plan.days) {
    for (const slot of day.slots) {
      for (const food of slot.foods) {
        if (allergenBlocked(food, allergies)) return false;
      }
    }
  }
  return true;
}
