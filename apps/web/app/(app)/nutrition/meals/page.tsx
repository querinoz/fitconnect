"use client";

export const dynamic = "force-dynamic";

import { AuthGate } from "@/components/auth-gate";
import { MealPlanExperience } from "@/components/nutrition/meal-plan-experience";

export default function NutritionMealsPage() {
  return (
    <AuthGate roles={["athlete", "admin"]}>
      <MealPlanExperience />
    </AuthGate>
  );
}
