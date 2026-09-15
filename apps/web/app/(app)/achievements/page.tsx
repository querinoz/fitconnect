"use client";

import { AuthGate } from "@/components/auth-gate";
import { AscendExperience } from "@/components/ascend/ascend-experience";

export default function AchievementsPage() {
  return (
    <AuthGate roles={["athlete", "admin"]}>
      <AscendExperience />
    </AuthGate>
  );
}
