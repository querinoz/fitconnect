import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { suggestMealSwaps, applyMealSwap } from "@/lib/nutrition/meal-swap";
import type { PlannedMealSlot } from "@/lib/nutrition/meal-planner";
import type { NutritionProfile } from "@/lib/nutrition/types";
import { FOOD_SEED } from "@/lib/nutrition/sources/food-catalog";

/**
 * Meal swap API.
 * suggest → read-only candidates
 * apply  → requires confirm:true; mutates in-memory plan slot only (not diary)
 */
export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const action = typeof b.action === "string" ? b.action : "suggest";
  const raw = b.slot as Partial<PlannedMealSlot> | undefined;

  if (!raw || typeof raw.slot !== "string" || !Array.isArray(raw.foodIds)) {
    return NextResponse.json({ error: "slot_required" }, { status: 400 });
  }

  const foods =
    Array.isArray(raw.foods) && raw.foods.length
      ? raw.foods
      : raw.foodIds
          .map((id) => FOOD_SEED.find((f) => f.foodId === id))
          .filter((f): f is NonNullable<typeof f> => Boolean(f));

  const slot: PlannedMealSlot = {
    slot: raw.slot as PlannedMealSlot["slot"],
    label: typeof raw.label === "string" ? raw.label : raw.slot,
    foodIds: raw.foodIds as string[],
    why: Array.isArray(raw.why) ? (raw.why as string[]) : [],
    foods
  };

  const allergies = Array.isArray(b.allergies)
    ? (b.allergies as string[])
    : typeof b.allergies === "string"
      ? b.allergies.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

  const profile: NutritionProfile = {
    userId: auth.user.id,
    goal: "PERFORMANCE",
    dietPattern: null,
    allergies,
    intolerances: [],
    dislikes: [],
    religiousRestrictions: [],
    mealFrequency: 4,
    countryLocale: typeof b.locale === "string" ? b.locale : "pt-PT",
    highRiskContext: false,
    declaredMedicalContext: false
  };

  if (action === "suggest") {
    const options = suggestMealSwaps({ current: slot, profile, limit: 6 });
    return NextResponse.json({
      action: "suggest",
      options,
      note: "Suggestions only. Apply requires action=apply and confirm:true."
    });
  }

  if (action === "apply") {
    if (b.confirm !== true) {
      return NextResponse.json(
        {
          error: "confirmation_required",
          message: "Set confirm:true after explicit athlete acceptance."
        },
        { status: 400 }
      );
    }
    const nextFoodId = typeof b.nextFoodId === "string" ? b.nextFoodId : "";
    if (!nextFoodId) {
      return NextResponse.json({ error: "next_food_required" }, { status: 400 });
    }
    const next = applyMealSwap(slot, nextFoodId);
    if (!next) {
      return NextResponse.json({ error: "food_not_found" }, { status: 404 });
    }
    return NextResponse.json({
      action: "apply",
      slot: next,
      note: "Plan slot updated in session. Diary unchanged until confirm-gated food log."
    });
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}
