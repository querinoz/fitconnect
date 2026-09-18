"use client";

export const dynamic = "force-dynamic";

import { AuthGate } from "@/components/auth-gate";
import { ProfileTabPanel } from "@/components/mobile/athlete-tab-panels";
import { AthleteProfileForm } from "@/components/athlete/athlete-profile-form";
import { SportsIdentityForm } from "@/components/profile/sports-identity-form";
import { ActiveExperienceSwitcher } from "@/components/identity/active-experience-switcher";
import { useAuthStore } from "@/lib/auth-store";
import { resolveDashboardAthleteId } from "@/lib/dashboard/resolve-scope";
import { selectAthlete, useDashboardStore } from "@/lib/dashboard-store";
import { useStitchMobile } from "@/lib/hooks/use-media-query";

export default function AthleteProfilePage() {
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
        extra={
          <>
            <ActiveExperienceSwitcher />
            <SportsIdentityForm userId={athleteId} />
            {stitchMobile ? undefined : <AthleteProfileForm />}
            <p className="mt-4 text-sm">
              <a className="text-eos-telemetry underline-offset-4 hover:underline" href="/nutrition">
                Nutrition — targets, food search, confirm log
              </a>
            </p>
            <p className="mt-2 text-sm">
              <a className="text-eos-telemetry underline-offset-4 hover:underline" href="/martial-arts">
                Martial Arts OS — discipline, rank, gym, competition
              </a>
            </p>
          </>
        }
      />
    </AuthGate>
  );
}
