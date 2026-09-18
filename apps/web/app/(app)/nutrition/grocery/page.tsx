"use client";

export const dynamic = "force-dynamic";

import { AuthGate } from "@/components/auth-gate";
import { GroceryExperience } from "@/components/nutrition/grocery-experience";

export default function NutritionGroceryPage() {
  return (
    <AuthGate roles={["athlete", "admin"]}>
      <GroceryExperience />
    </AuthGate>
  );
}
