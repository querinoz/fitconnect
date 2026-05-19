"use client";

export const dynamic = "force-dynamic";

import { AuthGate } from "@/components/auth-gate";
import { ProfileTabPanel } from "@/components/mobile/athlete-tab-panels";
import { AthleteProfileForm } from "@/components/athlete/athlete-profile-form";
import { useAuthStore } from "@/lib/auth-store";
import { DEMO_ATHLETE_ID } from "@/lib/dashboard/seed";
import { selectAthlete, useDashboardStore } from "@/lib/dashboard-store";

export default function AthleteProfilePlaceholderPage() {
  const user = useAuthStore((s) => s.user);
  const athleteId = user?.athleteId ?? DEMO_ATHLETE_ID;
  const athlete = useDashboardStore((s) => selectAthlete(s, athleteId));

  return (
    <AuthGate roles={["athlete", "admin"]}>
      <div className="space-y-4 pb-8">
        <ProfileTabPanel
          name={user?.name ?? athlete?.name ?? "You"}
          subtitle={athlete ? athlete.sports.join(" · ") : "Athlete profile"}
          streakDays={(athlete?.streakWeeks ?? 5) * 7}
          readinessScore={athlete?.readiness ?? 82}
        />
        <AthleteProfileForm />
      </div>
    </AuthGate>
  );
}
