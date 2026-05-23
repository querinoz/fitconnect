"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { PlanUpdateBanner } from "@/components/loops/morning-handshake/plan-update-banner";
import { SessionCard } from "@/components/loops/live-session/session-card";
import { LiveMetrics } from "@/components/loops/live-session/live-metrics";
import { NudgeToast } from "@/components/loops/live-session/nudge-toast";
import { SessionSummary } from "@/components/loops/live-session/session-summary";
import { StravaBrandedCard } from "@/components/sharing/strava-branded-card";
import { CelebrationOverlay } from "@/components/loops/celebrations/celebration-overlay";
import { InstallPrompt } from "@/components/shell/install-prompt";
import { useAthleteListener } from "@/components/loops/morning-handshake/use-athlete-listener";
import { useLiveSession } from "@/components/loops/live-session/use-live-session";
import { useCelebrations } from "@/components/loops/celebrations/use-celebrations";
import { useChannel } from "@/lib/realtime/use-channel";
import { detectPRs } from "@/lib/ai/pr-detection";
import { tap, success } from "@/lib/pwa/haptics";
import type { Nudge } from "@/lib/realtime/types";
import { BentoCard, EliteButton } from "@/components/elite-os";
import { RecoveryBookingModal } from "@/components/booking/recovery-booking-modal";
import { AthleteOsDashboard } from "@/components/dashboard/os/athlete-os-dashboard";
import { StitchTodayScreen } from "@/components/mobile/stitch-screens";
import { useStitchMobile } from "@/lib/hooks/use-media-query";
import { useAthleteSessions } from "@/lib/api/hooks/use-athlete-sessions";
import { computeReadiness } from "@/lib/readiness/compute";
import { RpeFeedbackModal } from "@/components/loops/live-session/rpe-feedback-modal";
import { recommendationFromRpe } from "@/lib/ai/rules";
import { useLiveHrvSync } from "@/lib/hooks/use-live-hrv-sync";

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
  const user = useAuthStore((s) => s.user);
  const resetDemo = useDashboardStore((s) => s.resetDemo);
  const athleteId = user?.athleteId ?? DEMO_ATHLETE_ID;
  const athlete = useDashboardStore((s) => selectAthlete(s, athleteId));
  const plan = useDashboardStore((s) => selectPlanForAthlete(s, athleteId));
  const apply = useDashboardStore((s) => s.applyPlanDiff);
  const { sessions, loading: sessionsLoading } = useAthleteSessions(athleteId);

  const [demoPanel, setDemoPanel] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [rpeOpen, setRpeOpen] = useState(false);
  const showStitchToday = useStitchMobile();

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDemoPanel(window.location.search.includes("demo=1"));
  }, []);

  const baselineHrv = athlete ? Math.max(58, athlete.hrv - 4) : 58;
  const readiness = useMemo(
    () =>
      athlete
        ? computeReadiness({
            hrvMs: athlete.hrv,
            baselineHrvMs: baselineHrv,
            sleepHours: Number.parseFloat(athlete.sleepHours) || 7.5,
            sleepEfficiency: athlete.sleepEfficiency,
            strainScore:
              athlete.recoveryStatus === "red"
                ? 72
                : athlete.recoveryStatus === "amber"
                  ? 48
                  : 28
          })
        : null,
    [athlete, baselineHrv]
  );

  const intent = plan ? intentFromPlan(plan.blocks) : "z2";
  const listener = useAthleteListener(athleteId);
  const session = useLiveSession({ athleteId, intent });
  const celebrations = useCelebrations(athleteId);
  useLiveHrvSync(athleteId, Boolean(athlete && plan));

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

  if (!athlete || !plan || !readiness) {
    return (
      <BentoCard elevation="1">
        <p className="text-sm text-ink-300">
          No athlete profile is linked to this account.
        </p>
      </BentoCard>
    );
  }

  const coachName = coachFirstName(athlete.coachId);
  const nextBlock = plan.blocks.find((b) => !b.completed) ?? plan.blocks[0]!;
  const pending = listener.pendingDiff;
  const planBannerCoach =
    pending != null ? coachFirstName(pending.coachId) : coachName;
  const planApproved = !listener.pendingDiff;

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
    setRpeOpen(true);
  };

  const liveSection = (
    <>
      {demoPanel && (
        <BentoCard elevation="2" className="border-eos-voltline/20 space-y-3">
          <p className="eos-label-caps text-eos-voltline">Voltline demo</p>
          <p className="text-sm text-ink-300">
            Open a second tab with the coach account to test BroadcastChannel loops.
          </p>
          <div className="flex flex-wrap gap-2">
            <EliteButton type="button" variant="ghost" onClick={() => resetDemo()}>
              Reset demo data
            </EliteButton>
          </div>
        </BentoCard>
      )}

      {listener.pendingDiff && listener.pendingDiff.diff !== "custom" && (
        <PlanUpdateBanner
          coachName={planBannerCoach}
          diff={listener.pendingDiff.diff}
          onApply={() => {
            const d = listener.pendingDiff?.diff;
            if (d === "lighter-day" || d === "swap-z2" || d === "add-recovery") {
              apply(plan.id, d);
              listener.dismiss();
            }
          }}
          onDismiss={listener.dismiss}
        />
      )}

      {!showStitchToday && !session.isActive && (
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
          <EliteButton type="button" variant="primary" onClick={onEnd}>
            End session
          </EliteButton>
        </>
      )}

      {!session.isActive && session.ticks.length > 0 && (
        <div className="space-y-4">
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
                    session.ticks.reduce((s, t) => s + t.hr, 0) / session.ticks.length
                  )
                : 0
            }
            maxHr={session.ticks.reduce((m, t) => Math.max(m, t.hr), 0)}
            durationSec={session.ticks.at(-1)?.elapsedSec ?? 0}
          />
          <StravaBrandedCard
            athleteName={athlete.name}
            activityName={nextBlock.title ?? "Training session"}
            sportType={athlete.sports[0] ?? "Workout"}
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
            durationSec={session.ticks.at(-1)?.elapsedSec ?? 0}
            avgHr={
              session.ticks.length
                ? Math.round(
                    session.ticks.reduce((s, t) => s + t.hr, 0) / session.ticks.length
                  )
                : 0
            }
            maxHr={session.ticks.reduce((m, t) => Math.max(m, t.hr), 0)}
            elevationM={Math.round(80 + readiness.score * 1.4)}
            readinessScore={readiness.score}
            coachName={coachName}
            date={new Date()}
            showShare
          />
        </div>
      )}

      <InstallPrompt />
    </>
  );

  return (
    <>
      {showStitchToday ? (
        session.isActive ? (
          <div className="space-y-4">{liveSection}</div>
        ) : (
          <StitchTodayScreen
            readinessScore={readiness.score}
            hrvMs={athlete.hrv}
            baselineHrvMs={baselineHrv}
            streakDays={athlete.streakWeeks * 7}
            sleepHours={athlete.sleepHours}
            sleepEfficiency={athlete.sleepEfficiency}
            sessionLive={session.isActive}
            planApproved={planApproved}
            aiHint={plan.aiSuggestion}
            onStartSession={() => {
              if (session.isActive) return;
              session.start();
            }}
            onApprovePlan={
              listener.pendingDiff && listener.pendingDiff.diff !== "custom"
                ? () => {
                    const d = listener.pendingDiff?.diff;
                    if (d === "lighter-day" || d === "swap-z2" || d === "add-recovery") {
                      apply(plan.id, d);
                      listener.dismiss();
                    }
                  }
                : undefined
            }
          />
        )
      ) : (
        <AthleteOsDashboard
          name={athlete.name}
          sports={athlete.sports}
          readiness={readiness.score}
          hrv={athlete.hrv}
          baselineHrv={baselineHrv}
          sleepHours={athlete.sleepHours}
          hrvSeed={athlete.id.length}
          sessions={sessions}
          sessionsLoading={sessionsLoading}
          coachName={coachName}
          goalTitle={athlete.goalTitle}
          athleteId={athleteId}
          liveSection={liveSection}
          todayPlan={{
            day: nextBlock.day,
            title: nextBlock.title,
            detail: nextBlock.detail,
            intensity: nextBlock.intensity
          }}
          streakWeeks={athlete.streakWeeks}
          onBookSession={() => setBookingOpen(true)}
        />
      )}

      {activeNudge && (
        <NudgeToast variant={activeNudge.variant} coachName={coachName} />
      )}
      {celebrations.lastAchievement && (
        <CelebrationOverlay
          title={celebrations.lastAchievement.title}
          value={`${celebrations.lastAchievement.value} ${celebrations.lastAchievement.metric}`}
          onClose={celebrations.clearAchievement}
        />
      )}

      <RecoveryBookingModal
        readinessScore={readiness.score}
        coachName={coachName}
        coachId={athlete.coachId}
        athleteId={athleteId}
        athleteName={athlete.name}
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
      />

      <RpeFeedbackModal
        open={rpeOpen}
        sessionTitle={nextBlock.title}
        onClose={() => setRpeOpen(false)}
        onSubmit={(rpe, notes) => {
          void fetch(`/api/v1/sessions/${plan.id}/feedback`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ athleteExternalId: athleteId, rpe, notes })
          });
          const diff = recommendationFromRpe(rpe);
          if (rpe >= 8) apply(plan.id, diff === "recovery-day" ? "add-recovery" : diff);
        }}
      />
    </>
  );
}

export default function AthleteDashboardPage() {
  return (
    <AuthGate roles={["athlete", "admin"]}>
      <AthleteDashboardBody />
    </AuthGate>
  );
}
