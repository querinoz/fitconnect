"use client";

import { AuthGate } from "@/components/auth-gate";
import { GamificationPanel } from "@/components/gamification/gamification-panel";

export default function AchievementsPage() {
  return (
    <AuthGate roles={["athlete", "admin"]}>
      <GamificationPanel />
    </AuthGate>
  );
}
