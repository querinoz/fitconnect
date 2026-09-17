import type {
  DailyNutritionTarget,
  NutritionGoal,
  NutritionProfile,
  NutritionSafetyFlag,
  FoodRecord
} from "./types";

export const NUTRITION_EVIDENCE_CONFIG_VERSION = "2026.09.v1";

export type MacroPlanInput = {
  profile: NutritionProfile;
  sportNutritionKey: string;
  trainingDayKind: "rest" | "easy" | "moderate" | "hard" | "long" | "competition" | "recovery";
  bodyMassKg: number | null;
  sessionDurationMin: number | null;
};

export function blockedForCombatWeightCut(sportNutritionKey: string): NutritionSafetyFlag | null {
  if (sportNutritionKey !== "combat") return null;
  return {
    code: "COMBAT_WEIGHT_CUT_BLOCKED",
    severity: "BLOCK",
    message:
      "Acute weight cutting, dehydration, and unsafe fluid restriction are not automated by FitConnect.",
    handoff: "Use long-term body-composition planning with a qualified professional if competing."
  };
}

export function lowEnergyAvailabilityFlag(params: {
  estimatedKcal: number | null;
  bodyMassKg: number | null;
  hardTraining: boolean;
}): NutritionSafetyFlag | null {
  if (params.estimatedKcal == null || params.bodyMassKg == null || params.bodyMassKg <= 0) {
    return null;
  }
  const perKg = params.estimatedKcal / params.bodyMassKg;
  if (params.hardTraining && perKg < 30) {
    return {
      code: "LOW_ENERGY_AVAILABILITY_RISK",
      severity: "WARN",
      message:
        "Estimated intake relative to training demand may indicate low energy availability risk. Further restriction is blocked.",
      handoff: "Review with a sports dietitian. See IOC RED-S consensus (evidence registry)."
    };
  }
  return null;
}

/** Macro engine — ESTIMATE only; never presents as measured expenditure. */
export function planDailyTargets(input: MacroPlanInput): DailyNutritionTarget {
  const goal = input.profile.goal;
  const flags: NutritionSafetyFlag[] = [];
  const combat = blockedForCombatWeightCut(input.sportNutritionKey);
  if (combat) flags.push(combat);

  if (input.profile.highRiskContext || input.profile.declaredMedicalContext) {
    flags.push({
      code: "HIGH_RISK_CONTEXT",
      severity: "BLOCK",
      message: "High-risk context — no aggressive autonomous calorie prescription is generated.",
      handoff: "Seek professional guidance before changing intake."
    });
    return {
      kcal: null,
      proteinG: null,
      carbohydrateG: null,
      fatG: null,
      fiberG: null,
      hydrationMl: null,
      estimateKind: "ESTIMATE",
      confidence: "LOW",
      explanations: ["Targets withheld due to safety handoff."],
      safetyFlags: flags,
      evidenceConfigVersion: NUTRITION_EVIDENCE_CONFIG_VERSION
    };
  }

  if (!goal) {
    flags.push({
      code: "INSUFFICIENT_PROFILE",
      severity: "WARN",
      message: "Goal missing.",
      handoff: "Choose a nutrition goal to generate estimates."
    });
    return {
      kcal: null,
      proteinG: null,
      carbohydrateG: null,
      fatG: null,
      fiberG: 25,
      hydrationMl: 2500,
      estimateKind: "ESTIMATE",
      confidence: "LOW",
      explanations: ["No goal — hydration/fiber defaults only; not a diet prescription."],
      safetyFlags: flags,
      evidenceConfigVersion: NUTRITION_EVIDENCE_CONFIG_VERSION
    };
  }

  const mass = input.bodyMassKg;
  const proteinPerKg =
    goal === "MUSCLE_GAIN" || goal === "PERFORMANCE" ? 1.6 : goal === "FAT_LOSS" || goal === "BODY_RECOMPOSITION" ? 1.8 : 1.4;

  const proteinG = mass != null ? Math.round(mass * proteinPerKg) : null;

  const carbGPerKg: Record<MacroPlanInput["trainingDayKind"], number> = {
    rest: 3,
    recovery: 3.5,
    easy: 4,
    moderate: 5,
    hard: 6,
    long: 7,
    competition: 7
  };
  const carbohydrateG = mass != null ? Math.round(mass * carbGPerKg[input.trainingDayKind]) : null;

  let kcal: number | null = null;
  if (mass != null) {
    const base = mass * 30;
    const sessionBonus =
      input.sessionDurationMin != null ? Math.round(input.sessionDurationMin * 8) : 0;
    kcal = Math.round(base + sessionBonus);
    if (goal === "FAT_LOSS") {
      kcal = Math.round(kcal * 0.9);
      flags.push({
        code: "AGGRESSIVE_DEFICIT_BLOCKED",
        severity: "INFO",
        message: "Fat-loss estimate uses a modest deficit only — not maximum speed loss.",
        handoff: "Adjust with a professional if needed."
      });
    }
  }

  const lea = lowEnergyAvailabilityFlag({
    estimatedKcal: kcal,
    bodyMassKg: mass,
    hardTraining:
      input.trainingDayKind === "hard" ||
      input.trainingDayKind === "long" ||
      input.trainingDayKind === "competition"
  });
  if (lea) {
    flags.push(lea);
    if (kcal != null && mass != null) {
      kcal = Math.max(kcal, Math.round(mass * 35));
    }
  }

  const fatG =
    kcal != null && proteinG != null && carbohydrateG != null
      ? Math.max(0, Math.round((kcal - proteinG * 4 - carbohydrateG * 4) / 9))
      : null;

  return {
    kcal,
    proteinG,
    carbohydrateG,
    fatG,
    fiberG: 25,
    hydrationMl:
      input.trainingDayKind === "long" || input.trainingDayKind === "competition" ? 3500 : 2500,
    estimateKind: "ESTIMATE",
    confidence: mass != null ? "MEDIUM" : "LOW",
    explanations: [
      `Goal: ${goal}`,
      `Training day kind: ${input.trainingDayKind}`,
      `Sport nutrition profile: ${input.sportNutritionKey}`,
      "Values are ESTIMATES — not measured expenditure.",
      `Evidence config: ${NUTRITION_EVIDENCE_CONFIG_VERSION}`
    ],
    safetyFlags: flags,
    evidenceConfigVersion: NUTRITION_EVIDENCE_CONFIG_VERSION
  };
}

export function allergenBlocked(food: FoodRecord, allergies: string[]): boolean {
  const blob = food.name.toLowerCase();
  return allergies.some((a) => a.trim() && blob.includes(a.trim().toLowerCase()));
}

export type { NutritionGoal };
