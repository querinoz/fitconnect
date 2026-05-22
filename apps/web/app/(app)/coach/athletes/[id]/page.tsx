"use client";

export const dynamic = "force-dynamic";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AuthGate } from "@/components/auth-gate";
import { useAuthStore } from "@/lib/auth-store";
import {
  useDashboardStore,
  selectAthlete,
  selectPlanForAthlete
} from "@/lib/dashboard-store";
import { DEMO_COACH_TOMAS_ID, getTrainerById } from "@/lib/dashboard/seed";
import { ReadinessCard } from "@/components/loops/morning-handshake/readiness-card";
import { QuickDiffChips } from "@/components/loops/morning-handshake/quick-diff-chips";
import { LiveMetrics } from "@/components/loops/live-session/live-metrics";
import { NudgeBar } from "@/components/loops/live-session/nudge-bar";
import { ReactionRow } from "@/components/loops/celebrations/reaction-row";
import { useCoachBroadcaster } from "@/components/loops/morning-handshake/use-coach-broadcaster";
import { useRelayAthleteRealtime } from "@/components/loops/live-session/use-relay-athlete-messages";
import { useChannel } from "@/lib/realtime/use-channel";
import { useCelebrations } from "@/components/loops/celebrations/use-celebrations";
import type { LiveSessionIntent } from "@/lib/dashboard/types";
import type { PlanBlock } from "@/lib/dashboard/types";
import type { Nudge } from "@/lib/realtime/types";
import {
  AiInsightCard,
  BentoCard,
  BentoGrid,
  EliteButton,
  EliteChip,
  TelemetryShell
} from "@/components/elite-os";
import { EliteStatTile } from "@/components/dashboard/elite";
import { EliteAppPage } from "@/components/shell/elite";
import { useT } from "@/lib/i18n-provider";
import { ArrowLeft, HeartPulse, Moon, PencilLine, Target, Zap } from "lucide-react";

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

function CoachAthleteBody({
  athleteId,
  coachId,
  coachSelf
}: {
  athleteId: string;
  coachId: string;
  coachSelf: string;
}) {
  const t = useT();
  const athlete = useDashboardStore((s) => selectAthlete(s, athleteId));
  const plan = useDashboardStore((s) => selectPlanForAthlete(s, athleteId));
  const live = useDashboardStore((s) => s.liveSessions[athleteId]);

  useRelayAthleteRealtime(athleteId);

  const broadcaster = useCoachBroadcaster(coachId);
  const ch = useChannel(`athlete:${athleteId}`);
  const celebrations = useCelebrations(athleteId);
  const [lastReaction, setLastReaction] = useState<string | null>(null);

  const coachDisplayName = useMemo(() => {
    const tr = coachId ? getTrainerById(coachId) : undefined;
    return tr?.name?.split(" ")[0] ?? coachSelf;
  }, [coachId, coachSelf]);

  if (!athlete || !plan) {
    return (
      <EliteAppPage eyebrow="Coach OS" title={t("hub", "athleteNotFound")}>
        <BentoCard elevation="1">
          <p className="text-sm text-eos-on-surface-muted">{t("hub", "athleteNotFound")}</p>
          <EliteButton asChild variant="secondary" className="mt-4">
            <Link href="/coach/dashboard">{t("hub", "backToRoster")}</Link>
          </EliteButton>
        </BentoCard>
      </EliteAppPage>
    );
  }

  if (athlete.coachId !== coachId) {
    return (
      <EliteAppPage eyebrow="Coach OS" title={t("hub", "athleteNotFound")}>
        <BentoCard elevation="1">
          <p className="text-sm text-eos-on-surface-muted">{t("hub", "athleteNotFound")}</p>
          <EliteButton asChild variant="secondary" className="mt-4">
            <Link href="/coach/dashboard">{t("hub", "backToRoster")}</Link>
          </EliteButton>
        </BentoCard>
      </EliteAppPage>
    );
  }

  const intent = intentFromPlan(plan.blocks);
  const nextBlock = plan.blocks.find((b) => !b.completed) ?? plan.blocks[0]!;

  return (
    <EliteAppPage
      eyebrow="Athlete detail"
      title={`${athlete.name} performance cockpit`}
      subtitle="Adjust plan load with live recovery, session and celebration signals visible in one place."
      action={
        <div className="flex flex-wrap items-center gap-2">
          <EliteButton asChild size="sm" variant="primary">
            <Link href={`/coach/athletes/${athleteId}/plan`}>
              <PencilLine className="h-3.5 w-3.5" aria-hidden />
              Plan builder
            </Link>
          </EliteButton>
          {live && !live.endedAt ? (
            <EliteChip as="span" tone="telemetry">
              Live now
            </EliteChip>
          ) : null}
        </div>
      }
    >
      <EliteButton asChild variant="ghost" size="sm" className="-ml-2 w-fit min-h-[44px]">
        <Link href="/coach/dashboard" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("hub", "backToRoster")}
        </Link>
      </EliteButton>

      <BentoGrid cols={2}>
        <EliteStatTile
          label="Readiness"
          value={String(athlete.readiness)}
          icon={Zap}
          tone={athlete.recoveryStatus === "green" ? "volt" : "performance"}
        />
        <EliteStatTile label="HRV" value={`${athlete.hrv} ms`} icon={HeartPulse} tone="iris" />
        <EliteStatTile label="Sleep" value={`${athlete.sleepHours}h`} icon={Moon} />
        <EliteStatTile
          label="Next"
          value={nextBlock.intensity}
          change={nextBlock.title}
          icon={Target}
        />
      </BentoGrid>

      <ReadinessCard
        percent={athlete.readiness}
        hrv={athlete.hrv}
        hrvDelta={0}
        sleepHours={athlete.sleepHours}
        coachName={coachDisplayName}
        intent={`${intent} · ${nextBlock.title}`}
      />

      <BentoCard elevation="1" label="Plan adjustments">
        <QuickDiffChips
          onPick={(diff) =>
            broadcaster.publishDiff({ planId: plan.id, athleteId, diff })
          }
        />
      </BentoCard>

      <TelemetryShell label="Signal trend · Recovery, sleep and training load">
        <div className="flex h-28 items-end gap-2">
          {[
            athlete.hrv - 9,
            athlete.hrv - 3,
            athlete.hrv + 2,
            athlete.hrv - 1,
            athlete.hrv + 4,
            athlete.hrv - 5,
            athlete.hrv
          ].map((value, i) => (
            <span
              key={i}
              className="flex-1 rounded-t-xl bg-gradient-to-t from-eos-iris/70 via-eos-voltline/70 to-eos-voltline"
              style={{
                height: `${Math.max(30, Math.min(95, value))}%`,
                opacity: 0.48 + i * 0.07
              }}
            />
          ))}
        </div>
      </TelemetryShell>

      <AiInsightCard
        title="Coach action"
        body={`Keep ${nextBlock.title.toLowerCase()} adaptive. If live HR drift rises, send a recovery nudge before the final block.`}
      />

      {live && !live.endedAt && (
        <>
          <LiveMetrics
            hr={live.ticks.at(-1)?.hr ?? 0}
            pace={live.ticks.at(-1)?.pace ?? 0}
            cadence={live.ticks.at(-1)?.cadence ?? 0}
            elapsedSec={live.ticks.at(-1)?.elapsedSec ?? 0}
            ticks={live.ticks.slice(-30).map((tk) => tk.hr)}
          />
          <NudgeBar
            onNudge={(variant: Nudge["variant"]) =>
              ch.send({
                kind: "nudge",
                athleteId,
                coachId,
                variant,
                at: new Date().toISOString()
              })
            }
          />
        </>
      )}

      {celebrations.lastAchievement && (
        <BentoCard elevation="2" className="space-y-3 border-eos-voltline/20">
          <p className="text-sm">
            <span className="font-bold text-eos-voltline">
              {celebrations.lastAchievement.title}
            </span>{" "}
            · {celebrations.lastAchievement.value}{" "}
            {celebrations.lastAchievement.metric}
          </p>
          <ReactionRow
            onReact={(emoji) => {
              celebrations.publishReaction(
                `${celebrations.lastAchievement!.metric}-${celebrations.lastAchievement!.value}`,
                emoji,
                coachDisplayName
              );
              setLastReaction(emoji);
            }}
          />
          {lastReaction && (
            <p className="text-xs text-eos-on-surface-muted">Sent {lastReaction}</p>
          )}
        </BentoCard>
      )}
    </EliteAppPage>
  );
}

export default function CoachAthleteDetailPage() {
  const params = useParams<{ id: string }>();
  const athleteId = params.id;
  const user = useAuthStore((s) => s.user);
  const coachId = user?.coachId ?? DEMO_COACH_TOMAS_ID;
  const coachSelf = user?.name?.split(" ")[0] ?? "You";

  return (
    <AuthGate roles={["coach", "admin"]}>
      <CoachAthleteBody
        athleteId={athleteId}
        coachId={coachId}
        coachSelf={coachSelf}
      />
    </AuthGate>
  );
}
