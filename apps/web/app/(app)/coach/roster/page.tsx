"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import { RosterList } from "@/components/app/roster-list";
import { SectionHeader } from "@/components/ui-glass/premium-system";
import { useAuthStore } from "@/lib/auth-store";
import { DEMO_COACH_TOMAS_ID } from "@/lib/dashboard/seed";
import type { DashboardAthlete } from "@/lib/dashboard/types";

export default function CoachRosterPage() {
  const user = useAuthStore((s) => s.user);
  const coachId = user?.coachId ?? DEMO_COACH_TOMAS_ID;
  const [roster, setRoster] = useState<DashboardAthlete[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <AuthGate roles={["coach", "admin"]}>
      <SectionHeader eyebrow="Coach OS" title="Your athletes" />
      <RosterList roster={roster} loading={loading} />
    </AuthGate>
  );
}
