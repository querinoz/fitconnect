"use client";

export const dynamic = "force-dynamic";

import { AuthGate } from "@/components/auth-gate";
import { ProfileTabPanel } from "@/components/mobile/athlete-tab-panels";
import { AthleteProfileForm } from "@/components/athlete/athlete-profile-form";
import { useAuthStore } from "@/lib/auth-store";
import { resolveDashboardAthleteId } from "@/lib/dashboard/resolve-scope";
import { selectAthlete, useDashboardStore } from "@/lib/dashboard-store";
import { useStitchMobile } from "@/lib/hooks/use-media-query";

export default function AthleteProfilePlaceholderPage() {
  const user = useAuthStore((s) => s.user);
  const athleteId = resolveDashboardAthleteId(user);
  const athlete = useDashboardStore((s) => selectAthlete(s, athleteId));
  const stitchMobile = useStitchMobile();

  return (
    <AuthGate roles={["athlete", "admin"]}>
      <ProfileTabPanel
        name={user?.name ?? athlete?.name ?? "You"}
        subtitle={athlete ? athlete.sports.join(" · ") : "Athlete profile"}
        streakDays={(athlete?.streakWeeks ?? 0) * 7}
        readinessScore={athlete?.readiness ?? 0}
        extra={stitchMobile ? undefined : <AthleteProfileForm />}
      />
    </AuthGate>
  );
}
