import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { searchFoods, getFoodById, getFoodByBarcode } from "@/lib/nutrition/sources/food-catalog";
import { planDailyTargets } from "@/lib/nutrition/planning-engine";
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

  if (view === "foods") {
    const q = url.searchParams.get("q") ?? "";
    const barcode = url.searchParams.get("barcode");
    if (barcode) {
      const food = getFoodByBarcode(barcode);
      return NextResponse.json({
        food: food ?? null,
        note: food
          ? "Confirm before logging — barcode lookup never auto-logs."
          : "No local match — remote Open Food Facts proxy not configured in this build."
      });
    }
    const id = url.searchParams.get("id");
    if (id) {
      return NextResponse.json({ food: getFoodById(id) ?? null });
    }
    return NextResponse.json({
      foods: searchFoods(q, url.searchParams.get("locale") ?? undefined),
      sources: ["PORTFIR", "USDA", "OPEN_FOOD_FACTS"],
      note: "Cached source-tagged foods. Production should proxy official APIs with attribution."
    });
  }

  const sport = resolveSport(url.searchParams.get("sport"));

  const profile: NutritionProfile = {
    userId: auth.user.id,
    goal: null,
    dietPattern: null,
    allergies: [],
    intolerances: [],
    dislikes: [],
    religiousRestrictions: [],
    mealFrequency: null,
    countryLocale: "pt-PT",
    highRiskContext: false,
    declaredMedicalContext: false
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
  const bodyMassKg = massRaw != null && massRaw !== "" ? Number(massRaw) : null;

  const targets = planDailyTargets({
    profile,
    sportNutritionKey: sport.nutritionProfileKey,
    trainingDayKind: dayKind,
    bodyMassKg: Number.isFinite(bodyMassKg) ? bodyMassKg : null,
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
