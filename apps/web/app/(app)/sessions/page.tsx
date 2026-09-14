"use client";

export const dynamic = "force-dynamic";

import { AuthGate } from "@/components/auth-gate";
import { SessionsTabPanel } from "@/components/mobile/athlete-tab-panels";
import { useAthleteSessions } from "@/lib/api/hooks/use-athlete-sessions";
import { useAuthStore } from "@/lib/auth-store";
import { resolveDashboardAthleteId } from "@/lib/dashboard/resolve-scope";
import { getTrainerById } from "@/lib/dashboard/seed";
import { selectAthlete, useDashboardStore } from "@/lib/dashboard-store";

export default function AthleteSessionsPage() {
  const user = useAuthStore((s) => s.user);
  const athleteId = resolveDashboardAthleteId(user);
  const { sessions, loading } = useAthleteSessions(athleteId);
  const athlete = useDashboardStore((s) => selectAthlete(s, athleteId));
  const coach = athlete?.coachId ? getTrainerById(athlete.coachId) : undefined;

  return (
    <AuthGate roles={["athlete", "admin"]}>
      <SessionsTabPanel
        sessions={sessions}
        loading={loading}
        coachName={coach?.name?.split(" ")[0] ?? "Coach"}
      />
    </AuthGate>
  );
}
