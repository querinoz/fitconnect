"use client";

import { AuthGate } from "@/components/auth-gate";
import { RecipeExperience } from "@/components/nutrition/recipe-experience";

export default function NutritionRecipesPage() {
  return (
    <AuthGate roles={["athlete", "admin"]}>
      <RecipeExperience />
    </AuthGate>
  );
}
