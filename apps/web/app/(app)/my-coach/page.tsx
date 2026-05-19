"use client";

export const dynamic = "force-dynamic";

import { AuthGate } from "@/components/auth-gate";
import { CoachTabPanel } from "@/components/mobile/athlete-tab-panels";
import { useAuthStore } from "@/lib/auth-store";
import { DEMO_ATHLETE_ID, DEMO_COACH_TOMAS_ID, getTrainerById } from "@/lib/dashboard/seed";
import { selectAthlete, useDashboardStore } from "@/lib/dashboard-store";

export default function AthleteMyCoachPage() {
  const user = useAuthStore((s) => s.user);
  const athleteId = user?.athleteId ?? DEMO_ATHLETE_ID;
  const athlete = useDashboardStore((s) => selectAthlete(s, athleteId));
  const coachId = user?.coachId ?? athlete?.coachId ?? DEMO_COACH_TOMAS_ID;
  const coach = getTrainerById(coachId);

  return (
    <AuthGate roles={["athlete", "admin"]}>
      <CoachTabPanel
        coachName={coach?.name ?? "Your coach"}
        coachHeadline={coach?.headline}
        coachAvatar={coach?.avatar}
        hrvMs={athlete?.hrv ?? 68}
      />
    </AuthGate>
  );
}
