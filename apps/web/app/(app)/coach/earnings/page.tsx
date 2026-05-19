"use client";

export const dynamic = "force-dynamic";

import { AuthGate } from "@/components/auth-gate";
import { CoachEarningsDashboard } from "@/components/coach/earnings-dashboard";
import { useAuthStore } from "@/lib/auth-store";
import { DEMO_COACH_TOMAS_ID } from "@/lib/dashboard/seed";

export default function CoachEarningsPage() {
  const user = useAuthStore((s) => s.user);
  const coachId = user?.coachId ?? DEMO_COACH_TOMAS_ID;

  return (
    <AuthGate roles={["coach", "admin"]}>
      <CoachEarningsDashboard coachId={coachId} />
    </AuthGate>
  );
}
