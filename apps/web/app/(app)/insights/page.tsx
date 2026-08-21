"use client";

import { AuthGate } from "@/components/auth-gate";
import { InsightsWorkspace } from "@/components/dashboard/insights/insights-workspace";

export default function InsightsPage() {
  return (
    <AuthGate roles={["athlete", "admin"]}>
      <InsightsWorkspace />
    </AuthGate>
  );
}
