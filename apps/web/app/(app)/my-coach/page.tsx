"use client";

export const dynamic = "force-dynamic";

import { AuthGate } from "@/components/auth-gate";
import { CoachTabPanel } from "@/components/mobile/athlete-tab-panels";
import { useAuthStore } from "@/lib/auth-store";
import { resolveDashboardAthleteId, resolveDashboardCoachId } from "@/lib/dashboard/resolve-scope";
import { getTrainerById } from "@/lib/dashboard/seed";
import { selectAthlete, useDashboardStore } from "@/lib/dashboard-store";

export default function AthleteMyCoachPage() {
  const user = useAuthStore((s) => s.user);
  const athleteId = resolveDashboardAthleteId(user);
  const athlete = useDashboardStore((s) => selectAthlete(s, athleteId));
  const coachId = user?.coachId ?? athlete?.coachId ?? resolveDashboardCoachId(user);
  const coach = coachId ? getTrainerById(coachId) : undefined;

  return (
    <AuthGate roles={["athlete", "admin"]}>
      <CoachTabPanel
        coachName={coach?.name ?? "Your coach"}
        coachHeadline={coach?.headline}
        coachAvatar={coach?.avatar}
        hrvMs={athlete?.hrv}
      />
    </AuthGate>
  );
}
