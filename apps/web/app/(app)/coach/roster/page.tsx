"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import { RosterList } from "@/components/app/roster-list";
import { CoachTabPanel } from "@/components/mobile/athlete-tab-panels";
import { EliteAppPage } from "@/components/shell/elite";
import { useAuthStore } from "@/lib/auth-store";
import { DEMO_COACH_TOMAS_ID } from "@/lib/dashboard/seed";
import type { DashboardAthlete } from "@/lib/dashboard/types";
import { useStitchMobile } from "@/lib/hooks/use-media-query";
import { useLocale } from "@/lib/i18n-provider";

export default function CoachRosterPage() {
  const user = useAuthStore((s) => s.user);
  const coachId = user?.coachId ?? DEMO_COACH_TOMAS_ID;
  const [roster, setRoster] = useState<DashboardAthlete[]>([]);
  const [loading, setLoading] = useState(true);
  const stitchMobile = useStitchMobile();
  const c = useLocale().mobileApp.coach;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/v1/coaches/roster?coachId=${encodeURIComponent(coachId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setRoster(data.roster ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [coachId]);

  const stitchRoster = useMemo(
    () =>
      roster.map((a) => ({
        name: a.name,
        readinessLabel:
          a.recoveryStatus === "amber"
            ? c.amberReadiness
            : a.recoveryStatus === "red"
              ? "Needs recovery"
              : c.greenReadiness,
        hrvMs: a.hrv
      })),
    [roster, c.amberReadiness, c.greenReadiness]
  );

  return (
    <AuthGate roles={["coach", "admin"]}>
      {stitchMobile ? (
        <CoachTabPanel isCoach coachName="Roster" roster={stitchRoster} />
      ) : (
        <EliteAppPage eyebrow="Coach OS" title="Your athletes">
          <RosterList roster={roster} loading={loading} />
        </EliteAppPage>
      )}
    </AuthGate>
  );
}
