"use client";

export const dynamic = "force-dynamic";

import { AuthGate } from "@/components/auth-gate";
import { CoachDashboardView } from "@/components/dashboard/coach-dashboard-view";

export default function CoachDashboardPage() {
  return (
    <AuthGate roles={["coach", "admin"]}>
      <CoachDashboardView />
    </AuthGate>
  );
}
