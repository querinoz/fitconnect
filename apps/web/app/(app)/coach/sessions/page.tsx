"use client";

export const dynamic = "force-dynamic";

import { AuthGate } from "@/components/auth-gate";
import { SessionsList } from "@/components/app/sessions-list";
import { SessionsTabPanel } from "@/components/mobile/athlete-tab-panels";
import { SectionHeader } from "@/components/ui-glass/premium-system";
import { useAuthStore } from "@/lib/auth-store";
import { DEMO_COACH_TOMAS_ID } from "@/lib/dashboard/seed";
import type { SessionSummary } from "@fitconnect/types";
import { useStitchMobile } from "@/lib/hooks/use-media-query";
import { useEffect, useState } from "react";

export default function CoachSessionsPage() {
  const user = useAuthStore((s) => s.user);
  const coachId = user?.coachId ?? DEMO_COACH_TOMAS_ID;
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const stitchMobile = useStitchMobile();

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/v1/sessions?coachId=${encodeURIComponent(coachId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setSessions(data.sessions ?? []);
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
      {stitchMobile ? (
        <SessionsTabPanel sessions={sessions} loading={loading} coachName="You" />
      ) : (
        <>
          <SectionHeader eyebrow="Coach OS" title="Sessions" />
          <SessionsList sessions={sessions} loading={loading} />
        </>
      )}
    </AuthGate>
  );
}
