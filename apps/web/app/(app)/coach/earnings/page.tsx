"use client";

export const dynamic = "force-dynamic";

import { AuthGate } from "@/components/auth-gate";
import { CoachEarningsDashboard } from "@/components/coach/earnings-dashboard";
import { useAuthStore } from "@/lib/auth-store";
import { resolveDashboardCoachId } from "@/lib/dashboard/resolve-scope";

export default function CoachEarningsPage() {
  const user = useAuthStore((s) => s.user);
  const coachId = user?.coachId ?? resolveDashboardCoachId(user);

  return (
    <AuthGate roles={["coach", "admin"]}>
      <CoachEarningsDashboard coachId={coachId} />
    </AuthGate>
  );
}
