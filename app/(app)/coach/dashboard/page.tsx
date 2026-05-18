"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthGate } from "@/components/auth-gate";
import { useAuthStore } from "@/lib/auth-store";
import {
  useDashboardStore,
  selectAthletesForCoach,
  selectCoachMetrics
} from "@/lib/dashboard-store";
import { DEMO_COACH_TOMAS_ID } from "@/lib/dashboard/seed";
import { RosterHeatmap } from "@/components/loops/morning-handshake/roster-heatmap";
import { AlertFeed } from "@/components/loops/ai-copilot/alert-feed";
import { GlassCard } from "@/components/ui-glass/glass-card";
import { Pill } from "@/components/ui-glass/pill";
import { useCoPilot } from "@/components/loops/ai-copilot/use-co-pilot";
import { evaluateRoster } from "@/lib/ai/rules";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-ink-400">{label}</p>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

export default function CoachDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const coachId = user?.coachId ?? DEMO_COACH_TOMAS_ID;
  const router = useRouter();

  const rosterKey = useDashboardStore((s) => {
    const xs = selectAthletesForCoach(s, coachId);
    return xs
      .map((a) => `${a.id}:${a.readiness}:${a.recoveryStatus}:${a.hrv}`)
      .join("|");
  });
  const athletes = useDashboardStore((s) => selectAthletesForCoach(s, coachId));

  const metrics = useDashboardStore((s) => selectCoachMetrics(s, coachId));
  const aiAlerts = useDashboardStore((s) => s.aiAlerts);
  const pushAlert = useDashboardStore((s) => s.pushAIAlert);

  const { approve } = useCoPilot(coachId);

  useEffect(() => {
    const xs = selectAthletesForCoach(useDashboardStore.getState(), coachId);
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
    evaluateRoster(snaps, coachId).forEach(pushAlert);
  }, [coachId, pushAlert, rosterKey]);

  return (
    <AuthGate roles={["coach", "admin"]}>
      <div className="space-y-5 pb-6">
        <GlassCard tone="default" className="grid grid-cols-3 gap-3">
          <Stat label="Active" value={String(metrics.activeAthletes)} />
          <Stat label="MTD" value={metrics.revenueMtd} />
          <Stat label="Sessions/wk" value={String(metrics.sessionsWeek)} />
        </GlassCard>

        <section>
          <header className="flex items-center justify-between mb-3">
            <h2 className="text-sm uppercase tracking-[0.18em] text-ink-400">
              Roster readiness
            </h2>
            <Pill>Today</Pill>
          </header>
          <RosterHeatmap
            athletes={athletes.map((a) => ({
              id: a.id,
              name: a.name,
              readiness: a.readiness,
              hrvDelta: 0
            }))}
            onSelect={(id) => router.push(`/coach/athletes/${id}`)}
          />
        </section>

        <section>
          <h2 className="text-sm uppercase tracking-[0.18em] text-ink-400 mb-3">
            Co-pilot
          </h2>
          <AlertFeed
            alerts={aiAlerts.filter((a) => a.coachId === coachId)}
            athleteNameFor={(id) =>
              athletes.find((a) => a.id === id)?.name ?? id
            }
            onApprove={approve}
            onOpenAthlete={(id) => router.push(`/coach/athletes/${id}`)}
          />
        </section>
      </div>
    </AuthGate>
  );
}
