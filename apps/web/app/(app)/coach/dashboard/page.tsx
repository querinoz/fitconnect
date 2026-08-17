"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { AuthGate } from "@/components/auth-gate";
import { useAuthStore } from "@/lib/auth-store";
import {
  useDashboardStore,
  selectAthletesForCoach,
  selectCoachMetrics
} from "@/lib/dashboard-store";
import { DEMO_COACH_TOMAS_ID, getTrainerById } from "@/lib/dashboard/seed";
import { BentoCard, EliteButton } from "@/components/elite-os";
import { useCoPilot } from "@/components/loops/ai-copilot/use-co-pilot";
import { evaluateRoster } from "@/lib/ai/rules";
import { useCoachBookingInbox } from "@/lib/hooks/use-coach-booking-inbox";
import { CoachOsDashboard } from "@/components/dashboard/os/coach-os-dashboard";
import { StitchCoachScreen } from "@/components/mobile/stitch-screens";
import { useStitchMobile } from "@/lib/hooks/use-media-query";
import { useRouter } from "next/navigation";

export default function CoachDashboardPage() {
  return (
    <AuthGate roles={["coach", "admin"]}>
      <CoachDashboardBody />
    </AuthGate>
  );
}

function CoachDashboardBody() {
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
  const athletes = useDashboardStore(
    useShallow((s) => selectAthletesForCoach(s, coachId))
  );
  const coach = getTrainerById(coachId);
  const stitchMobile = useStitchMobile();
  const amberCount = athletes.filter((a) => a.recoveryStatus === "amber").length;

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
      <BentoCard elevation="2" className="mb-6 space-y-3 border-eos-voltline/20">
        <p className="eos-label-caps text-eos-voltline">Voltline demo</p>
        <p className="text-sm text-ink-300">
          Open a second tab as Athlete to test BroadcastChannel loops.
        </p>
        <div className="flex flex-wrap gap-2">
          <EliteButton type="button" variant="ghost" onClick={() => resetDemo()}>
            Reset demo data
          </EliteButton>
          <EliteButton type="button" variant="secondary" onClick={() => router.push("/signin?demo=athlete")}>
            Athlete sign-in shortcut
          </EliteButton>
        </div>
      </BentoCard>
    ) : null;

  if (stitchMobile) {
    return (
      <div className="space-y-4">
        {demoSection}
        <StitchCoachScreen
          isCoach
          coachName={coach?.name ?? "Coach"}
          roster={athletes.slice(0, 5).map((a) => ({
            name: a.name,
            readinessLabel:
              a.recoveryStatus === "green"
                ? "Optimal"
                : a.recoveryStatus === "amber"
                  ? "Building"
                  : "Recovery",
            hrvMs: a.hrv
          }))}
          onSendCheckIn={() => router.push("/coach/inbox")}
        />
      </div>
    );
  }

  return (
    <CoachOsDashboard
      coachId={coachId}
      coachName={coach?.name ?? "Coach"}
      coachTitle={coach?.headline ?? "Verified specialist"}
      coachAvatar={coach?.avatar}
      netPayout={metrics.revenueMtd}
      attentionCount={amberCount || 1}
      demoSection={demoSection}
    />
  );
}
