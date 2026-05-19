"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import { useAuthStore } from "@/lib/auth-store";
import {
  useDashboardStore,
  selectAthletesForCoach,
  selectCoachMetrics
} from "@/lib/dashboard-store";
import { DEMO_COACH_TOMAS_ID, getTrainerById } from "@/lib/dashboard/seed";
import { GlassCard } from "@/components/ui-glass/glass-card";
import { VoltButton } from "@/components/ui-glass/volt-button";
import { useCoPilot } from "@/components/loops/ai-copilot/use-co-pilot";
import { evaluateRoster } from "@/lib/ai/rules";
import { useCoachBookingInbox } from "@/lib/hooks/use-coach-booking-inbox";
import { CoachOsDashboard } from "@/components/dashboard/os/coach-os-dashboard";
import { useRouter } from "next/navigation";

export default function CoachDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const coachId = user?.coachId ?? DEMO_COACH_TOMAS_ID;
  const router = useRouter();
  const resetDemo = useDashboardStore((s) => s.resetDemo);
  const [demoPanel, setDemoPanel] = useState(false);
  const evaluatedRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDemoPanel(window.location.search.includes("demo=1"));
  }, []);

  const metrics = useDashboardStore((s) => selectCoachMetrics(s, coachId));
  const coach = getTrainerById(coachId);

  useCoPilot(coachId);
  useCoachBookingInbox(coachId);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const key = `${coachId}:${today}`;
    if (evaluatedRef.current === key) return;
    evaluatedRef.current = key;

    const state = useDashboardStore.getState();
    const xs = selectAthletesForCoach(state, coachId);
    const snaps = xs.map((a) => ({
      id: a.id,
      name: a.name,
      hrvSeries: [
        a.hrv - 6,
        a.hrv - 4,
        a.hrv,
        a.hrv - 2,
        a.hrv + 1,
        a.hrv - 8,
        a.hrv - 12
      ],
      sleepSeries: [7.5, 7.2, 7.0, 6.8, 6.5, 5.6, 5.4],
      missedSessions: a.recoveryStatus === "red" ? 3 : 0
    }));
    evaluateRoster(snaps, coachId).forEach((alert) => {
      state.pushAIAlert(alert);
    });
  }, [coachId]);

  const demoSection =
    demoPanel ? (
      <GlassCard tone="live" className="mb-6 space-y-3">
        <p className="text-xs uppercase tracking-[0.18em] text-volt-500">Voltline demo</p>
        <p className="text-sm text-ink-300">
          Open a second tab as Athlete to test BroadcastChannel loops.
        </p>
        <div className="flex flex-wrap gap-2">
          <VoltButton type="button" variant="subtle" onClick={() => resetDemo()}>
            Reset demo data
          </VoltButton>
          <VoltButton
            type="button"
            variant="ghost"
            onClick={() => router.push("/signin?demo=athlete")}
          >
            Athlete sign-in shortcut
          </VoltButton>
        </div>
      </GlassCard>
    ) : null;

  return (
    <AuthGate roles={["coach", "admin"]}>
      <CoachOsDashboard
        coachId={coachId}
        coachName={coach?.name ?? "Coach"}
        coachTitle={coach?.headline ?? "Verified specialist"}
        coachAvatar={coach?.avatar}
        netPayout={metrics.revenueMtd}
        attentionCount={1}
        demoSection={demoSection}
      />
    </AuthGate>
  );
}
