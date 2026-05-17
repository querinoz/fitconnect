"use client";

export const dynamic = "force-dynamic";

import { AuthGate } from "@/components/auth-gate";
import { AthleteDashboardView } from "@/components/dashboard/athlete-dashboard-view";

export default function DashboardPage() {
  return (
    <AuthGate roles={["athlete", "admin"]}>
      <AthleteDashboardView />
    </AuthGate>
  );
}
