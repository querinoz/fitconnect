import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { lookupFoods } from "@/lib/nutrition/sources/food-lookup";
import { planDailyTargets } from "@/lib/nutrition/planning-engine";
import { generateWeeklyMealPlan } from "@/lib/nutrition/meal-planner";
import { buildGroceryList } from "@/lib/nutrition/grocery";
import { listRecipes, getRecipeById, computeRecipeNutrition } from "@/lib/nutrition/recipes";
import { readNutritionProfile } from "@/lib/nutrition/nutrition-repository";
import type { NutritionProfile } from "@/lib/nutrition/types";
import { SPORT_REGISTRY, type SportId } from "@/lib/sport-intelligence/sport-registry";

function resolveSport(id: string | null) {
  if (id && id in SPORT_REGISTRY) return SPORT_REGISTRY[id as SportId];
  return SPORT_REGISTRY.GENERAL_FITNESS;
}

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const view = url.searchParams.get("view") ?? "targets";

  if (view === "recipes") {
    const id = url.searchParams.get("id");
    if (id) {
      const recipe = getRecipeById(id);
      return NextResponse.json({
        recipe: recipe ?? null,
        nutrition: recipe ? computeRecipeNutrition(recipe) : null
      });
    }
    const sportKey = url.searchParams.get("sportKey") ?? undefined;
    return NextResponse.json({ recipes: listRecipes(sportKey) });
  }

  if (view === "meal-plan") {
    const sport = resolveSport(url.searchParams.get("sport"));
    const profile: NutritionProfile = {
      userId: auth.user.id,
      goal: (url.searchParams.get("goal") as NutritionProfile["goal"]) ?? "PERFORMANCE",
      dietPattern: null,
      allergies: (url.searchParams.get("allergies") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      intolerances: [],
      dislikes: [],
      religiousRestrictions: [],
      mealFrequency: 4,
      countryLocale: url.searchParams.get("locale") ?? "pt-PT",
      highRiskContext: false,
      declaredMedicalContext: false
    };
    const weekStartISO =
      url.searchParams.get("weekStart") ?? new Date().toISOString().slice(0, 10);
    const dayKind =
      (url.searchParams.get("day") as
        | "rest"
        | "easy"
        | "moderate"
        | "hard"
        | "long"
        | "competition"
        | "recovery"
        | null) ?? "moderate";
    const massRaw = url.searchParams.get("massKg");
    const plan = generateWeeklyMealPlan({
      profile,
      sportNutritionKey: sport.nutritionProfileKey,
      trainingDayKind: dayKind,
      bodyMassKg: massRaw != null && massRaw !== "" ? Number(massRaw) : 70,
      sessionDurationMin: url.searchParams.get("durationMin")
        ? Number(url.searchParams.get("durationMin"))
        : 45,
      weekStartISO
    });
    const grocery = buildGroceryList(plan);
    return NextResponse.json({
      view: "meal-plan",
      plan,
      grocery,
      note: "Generated plan is a suggestion. Logging meals requires explicit confirmation — not auto-applied."
    });
  }

  if (view === "foods") {
    const q = url.searchParams.get("q") ?? "";
    const barcode = url.searchParams.get("barcode");
    const id = url.searchParams.get("id");
    const locale = url.searchParams.get("locale") ?? undefined;
    const looked = await lookupFoods({
      query: q,
      barcode: barcode ?? undefined,
      foodId: id ?? undefined,
      locale
    });
    if (barcode || id) {
      return NextResponse.json({
        food: looked.foods[0] ?? null,
        foods: looked.foods,
        state: looked.state,
        note: looked.note
      });
    }
    return NextResponse.json({
      foods: looked.foods,
      state: looked.state,
      sources: looked.sourcesQueried,
      note: looked.note
    });
  }

  const sport = resolveSport(url.searchParams.get("sport"));

  const stored = await readNutritionProfile(auth.user.id);
  const profile: NutritionProfile = {
    userId: auth.user.id,
    goal: stored.profile.goal,
    dietPattern: stored.profile.dietPattern,
    allergies: stored.profile.allergies,
    intolerances: stored.profile.intolerances,
    dislikes: stored.profile.dislikes,
    religiousRestrictions: stored.profile.religiousRestrictions,
    mealFrequency: stored.profile.mealFrequency,
    countryLocale: stored.profile.countryLocale,
    highRiskContext: stored.profile.highRiskContext,
    declaredMedicalContext: stored.profile.declaredMedicalContext
  };

  const goalParam = url.searchParams.get("goal");
  if (
    goalParam &&
    [
      "MUSCLE_GAIN",
      "FAT_LOSS",
      "BODY_RECOMPOSITION",
      "MAINTENANCE",
      "ENDURANCE",
      "PERFORMANCE",
      "ENERGY",
      "RECOVERY",
      "GENERAL_HEALTH"
    ].includes(goalParam)
  ) {
    profile.goal = goalParam as NutritionProfile["goal"];
  }

  const dayKind =
    (url.searchParams.get("day") as
      | "rest"
      | "easy"
      | "moderate"
      | "hard"
      | "long"
      | "competition"
      | "recovery"
      | null) ?? "moderate";

  const massRaw = url.searchParams.get("massKg");
  const bodyMassKg =
    massRaw != null && massRaw !== ""
      ? Number(massRaw)
      : stored.profile.bodyMassKg;

  const targets = planDailyTargets({
    profile,
    sportNutritionKey: sport.nutritionProfileKey,
    trainingDayKind: dayKind,
    bodyMassKg: Number.isFinite(bodyMassKg as number) ? (bodyMassKg as number) : null,
    sessionDurationMin: url.searchParams.get("durationMin")
      ? Number(url.searchParams.get("durationMin"))
      : null
  });

  return NextResponse.json({
    view: "targets",
    sportId: sport.id,
    targets,
    note: "ESTIMATE only. Mutations (log food/meal) require explicit user confirmation via dedicated write endpoints."
  });
}

export async function POST() {
  return NextResponse.json(
    {
      error: "explicit_confirmation_required",
      message:
        "Nutrition diary mutations are not accepted on this read endpoint. Use a confirmed write flow."
    },
    { status: 405 }
  );
}
