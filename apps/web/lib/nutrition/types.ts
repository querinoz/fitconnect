export type FoodSource = "PORTFIR" | "USDA" | "OPEN_FOOD_FACTS" | "USER" | "UNKNOWN";

export type NutritionConfidence = "HIGH" | "MEDIUM" | "LOW";

export type FoodRecord = {
  foodId: string;
  source: FoodSource;
  sourceId: string;
  name: string;
  locale: string;
  servingSize: string;
  grams: number;
  kcal: number;
  proteinG: number;
  carbohydrateG: number;
  fatG: number;
  fiberG: number | null;
  micronutrients: Record<string, number>;
  confidence: NutritionConfidence;
  sourceTimestamp: string;
  barcode?: string | null;
  caveat?: string | null;
};

export type NutritionGoal =
  | "MUSCLE_GAIN"
  | "FAT_LOSS"
  | "BODY_RECOMPOSITION"
  | "MAINTENANCE"
  | "ENDURANCE"
  | "PERFORMANCE"
  | "ENERGY"
  | "RECOVERY"
  | "GENERAL_HEALTH";

export type NutritionSafetyFlagCode =
  | "LOW_ENERGY_AVAILABILITY_RISK"
  | "HIGH_RISK_CONTEXT"
  | "AGGRESSIVE_DEFICIT_BLOCKED"
  | "COMBAT_WEIGHT_CUT_BLOCKED"
  | "INSUFFICIENT_PROFILE";

export type NutritionSafetyFlag = {
  code: NutritionSafetyFlagCode;
  severity: "INFO" | "WARN" | "BLOCK";
  message: string;
  handoff: string;
};

export type DailyNutritionTarget = {
  kcal: number | null;
  proteinG: number | null;
  carbohydrateG: number | null;
  fatG: number | null;
  fiberG: number | null;
  hydrationMl: number | null;
  estimateKind: "ESTIMATE" | "MEASURED";
  confidence: NutritionConfidence;
  explanations: string[];
  safetyFlags: NutritionSafetyFlag[];
  evidenceConfigVersion: string;
};

export type MealSlotId =
  | "breakfast"
  | "mid_morning"
  | "lunch"
  | "pre_workout"
  | "during_workout"
  | "post_workout"
  | "dinner"
  | "evening"
  | "snack";

export type MealPlanDay = {
  dateISO: string;
  trainingContext: string;
  targets: DailyNutritionTarget;
  slots: Array<{
    slot: MealSlotId;
    label: string;
    foodIds: string[];
    why: string[];
  }>;
};

export type NutritionProfile = {
  userId: string;
  goal: NutritionGoal | null;
  dietPattern: string | null;
  allergies: string[];
  intolerances: string[];
  dislikes: string[];
  religiousRestrictions: string[];
  mealFrequency: number | null;
  countryLocale: string;
  highRiskContext: boolean;
  /** Explicit opt-in sensitive flags — never inferred silently */
  declaredMedicalContext: boolean;
};
