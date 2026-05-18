"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import { useAuthStore } from "@/lib/auth-store";
import {
  useDashboardStore,
  selectAthlete,
  selectPlanForAthlete
} from "@/lib/dashboard-store";
import { DEMO_ATHLETE_ID, getTrainerById } from "@/lib/dashboard/seed";
import type { LiveSessionIntent } from "@/lib/dashboard/types";
import type { PlanBlock } from "@/lib/dashboard/types";
import { ReadinessCard } from "@/components/loops/morning-handshake/readiness-card";
import { PlanUpdateBanner } from "@/components/loops/morning-handshake/plan-update-banner";
import { SessionCard } from "@/components/loops/live-session/session-card";
import { LiveMetrics } from "@/components/loops/live-session/live-metrics";
import { NudgeToast } from "@/components/loops/live-session/nudge-toast";
import { SessionSummary } from "@/components/loops/live-session/session-summary";
import { CelebrationOverlay } from "@/components/loops/celebrations/celebration-overlay";
import { StreakCard } from "@/components/loops/celebrations/streak-card";
import { InstallPrompt } from "@/components/shell/install-prompt";
import { useAthleteListener } from "@/components/loops/morning-handshake/use-athlete-listener";
import { useLiveSession } from "@/components/loops/live-session/use-live-session";
import { useCelebrations } from "@/components/loops/celebrations/use-celebrations";
import { useChannel } from "@/lib/realtime/use-channel";
import { detectPRs } from "@/lib/ai/pr-detection";
import { tap, success } from "@/lib/pwa/haptics";
import type { Nudge } from "@/lib/realtime/types";
import { VoltButton } from "@/components/ui-glass/volt-button";
import { GlassCard } from "@/components/ui-glass/glass-card";
import { useRouter } from "next/navigation";

function intentFromPlan(blocks: PlanBlock[]): LiveSessionIntent {
  const next = blocks.find((b) => !b.completed) ?? blocks[0]!;
  const hay = `${next.title} ${next.intensity} ${next.detail}`.toLowerCase();
  if (hay.includes("recovery") || hay.includes("mobility")) return "recovery";
  if (
    hay.includes("interval") ||
    hay.includes("threshold") ||
    hay.includes("zone 4")
  ) {
    return "intervals";
  }
  return "z2";
}

function coachFirstName(coachId: string | undefined): string {
  if (!coachId) return "Coach";
  const t = getTrainerById(coachId);
  if (!t?.name) return "Coach";
  return t.name.split(" ")[0] ?? "Coach";
}

function AthleteDashboardBody() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const resetDemo = useDashboardStore((s) => s.resetDemo);
  const athleteId = user?.athleteId ?? DEMO_ATHLETE_ID;
  const athlete = useDashboardStore((s) => selectAthlete(s, athleteId));
  const plan = useDashboardStore((s) => selectPlanForAthlete(s, athleteId));
  const apply = useDashboardStore((s) => s.applyPlanDiff);

  const [demoPanel, setDemoPanel] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    setDemoPanel(window.location.search.includes("demo=1"));
  }, []);

  const intent = plan ? intentFromPlan(plan.blocks) : "z2";
  const listener = useAthleteListener(athleteId);
  const session = useLiveSession({ athleteId, intent });
  const celebrations = useCelebrations(athleteId);

  const nudges = useChannel(`athlete:${athleteId}`);
  const [activeNudge, setActiveNudge] = useState<Nudge | null>(null);
  const lastSeenRef = useRef<unknown>(null);

  useEffect(() => {
    const last = nudges.messages.at(-1);
    if (!last || last.kind !== "nudge" || last === lastSeenRef.current) return;
    lastSeenRef.current = last;
    setActiveNudge(last);
    tap();
    const id = window.setTimeout(() => setActiveNudge(null), 3500);
    return () => clearTimeout(id);
  }, [nudges.messages]);

  if (!athlete || !plan) {
    return (
      <GlassCard tone="default">
        <p className="text-sm text-ink-300">
          No athlete profile is linked to this account.
        </p>
      </GlassCard>
    );
  }

  const coachName = coachFirstName(athlete.coachId);
  const nextBlock = plan.blocks.find((b) => !b.completed) ?? plan.blocks[0]!;

  const onEnd = () => {
    session.end();
    success();
    const ticks = session.ticks;
    const last = ticks.at(-1);
    if (last) {
      const avgHr = ticks.length
        ? Math.round(ticks.reduce((s, t) => s + t.hr, 0) / ticks.length)
        : 0;
      const maxHr = ticks.reduce((m, t) => Math.max(m, t.hr), 0);
      const prs = detectPRs(
        {
          athleteId,
          at: new Date().toISOString(),
          distanceKm: Number(
            (((last.elapsedSec ?? 0) / 60) * (60 / 4.5) / 10).toFixed(1)
          ),
          durationSec: last.elapsedSec ?? 0,
          avgHr,
          maxHr
        },
        []
      );
      const pr = prs[0];
      if (pr) {
        celebrations.publishAchievement({
          title: "New PR",
          metric: pr.metric,
          value: pr.value
        });
      }
    }
  };

  const pending = listener.pendingDiff;
  const planBannerCoach =
    pending != null ? coachFirstName(pending.coachId) : coachName;

  return (
    <div className="space-y-4 pb-6">
      {demoPanel && (
        <GlassCard tone="live" className="space-y-3">
          <p className="text-xs uppercase tracking-[0.18em] text-volt-500">
            Voltline demo
          </p>
          <p className="text-sm text-ink-300">
            Open a second tab with the coach account to test BroadcastChannel
            loops (plan updates, live session, nudges).
          </p>
          <div className="flex flex-wrap gap-2">
            <VoltButton type="button" variant="subtle" onClick={() => resetDemo()}>
              Reset demo data
            </VoltButton>
            <VoltButton
              type="button"
              variant="ghost"
              onClick={() => router.push("/signin?demo=coach")}
            >
              Coach sign-in shortcut
            </VoltButton>
          </div>
        </GlassCard>
      )}

      <ReadinessCard
        percent={athlete.readiness}
        hrv={athlete.hrv}
        hrvDelta={4}
        sleepHours={athlete.sleepHours}
        coachName={coachName}
        intent={nextBlock.title}
      />

      {listener.pendingDiff && listener.pendingDiff.diff !== "custom" && (
        <PlanUpdateBanner
          coachName={planBannerCoach}
          diff={listener.pendingDiff.diff}
          onApply={() => {
            const d = listener.pendingDiff?.diff;
            if (
              d === "lighter-day" ||
              d === "swap-z2" ||
              d === "add-recovery"
            ) {
              apply(plan.id, d);
              listener.dismiss();
            }
          }}
          onDismiss={listener.dismiss}
        />
      )}

      {!session.isActive && (
        <SessionCard
          title={nextBlock.title}
          durationMin={45}
          intent={intent}
          morphId={`session-${plan.id}`}
          onStart={session.start}
        />
      )}

      {session.isActive && (
        <>
          <LiveMetrics
            hr={session.hr}
            pace={session.pace}
            cadence={session.cadence}
            elapsedSec={session.elapsedSec}
            ticks={session.ticks.map((t) => t.hr)}
          />
          <VoltButton type="button" onClick={onEnd}>
            End session
          </VoltButton>
        </>
      )}

      {!session.isActive && session.ticks.length > 0 && (
        <SessionSummary
          distanceKm={
            session.ticks.length
              ? Number(
                  (
                    ((session.ticks.at(-1)!.elapsedSec ?? 0) / 60) *
                    (60 / 4.5) /
                    10
                  ).toFixed(1)
                )
              : 0
          }
          avgHr={
            session.ticks.length
              ? Math.round(
                  session.ticks.reduce((s, t) => s + t.hr, 0) /
                    session.ticks.length
                )
              : 0
          }
          maxHr={session.ticks.reduce((m, t) => Math.max(m, t.hr), 0)}
          durationSec={session.ticks.at(-1)?.elapsedSec ?? 0}
        />
      )}

      <StreakCard days={athlete.streakWeeks * 7} coName={coachName} />

      <InstallPrompt />

      {activeNudge && <NudgeToast variant={activeNudge.variant} coachName={coachName} />}
      {celebrations.lastAchievement && (
        <CelebrationOverlay
          title={celebrations.lastAchievement.title}
          value={`${celebrations.lastAchievement.value} ${celebrations.lastAchievement.metric}`}
          onClose={celebrations.clearAchievement}
        />
      )}
    </div>
  );
}

export default function AthleteDashboardPage() {
  return (
    <AuthGate roles={["athlete", "admin"]}>
      <AthleteDashboardBody />
    </AuthGate>
  );
}
