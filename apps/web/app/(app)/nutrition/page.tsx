"use client";

export const dynamic = "force-dynamic";

import { AuthGate } from "@/components/auth-gate";
import { NutritionExperience } from "@/components/nutrition/nutrition-experience";

export default function NutritionPage() {
  return (
    <AuthGate roles={["athlete", "admin"]}>
      <NutritionExperience />
    </AuthGate>
  );
}
