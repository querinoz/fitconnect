"use client";

import Link from "next/link";
import {
  Activity,
  Check,
  HeartPulse,
  MessageCircle,
  Send,
  UserRound,
  UsersRound,
  Zap
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SessionSummary, ThreadMessage } from "@fitconnect/types";
import { ProfileSettingsPanel } from "@/components/mobile/profile-settings-panel";
import { cn } from "@/lib/utils";
import {
  ChartShell,
  MetricTile,
  PremiumCard,
  SectionHeader
} from "@/components/ui-glass/premium-system";
import {
  StitchAiDirectiveCard,
  StitchAiFab,
  StitchHrvCard,
  StitchPrimeRing,
  StitchSleepCard,
  StitchStrainCard
} from "@/components/mobile/stitch-native-primitives";
import { useLocale } from "@/lib/i18n-provider";
import { expandMessageBody, messageSubject } from "@/lib/inbox/expand-message";

export const STITCH_LOAD_BARS = [54, 28, 78, 36, 88, 42, 68];

/** SSR-safe load display — matches Stitch mock (e.g. 6.4k), no locale drift. */
export function stitchLoadLabel(readinessScore: number): string {
  return `${(readinessScore * 78 / 1000).toFixed(1)}k`;
}

function stitchPrimeLabel(score: number): string {
  if (score >= 80) return "Primed";
  if (score >= 65) return "Ready";
  if (score >= 50) return "Moderate";
  return "Recover";
}

function stitchDayStrain(readinessScore: number): number {
  return Math.round((100 - readinessScore) * 0.12 + 8);
}

export function StitchScreenMotion({ children }: { children: React.ReactNode }) {
  return <div className="fc-stitch-screen-enter pb-2">{children}</div>;
}

export function StitchSectionHeader({
  title,
  kicker
}: {
  title: string;
  kicker: string;
}) {
  return <SectionHeader eyebrow={kicker} title={title} className="mb-1" />;
}

export function StitchLoadBars({ live }: { live: boolean }) {
  return (
    <div className="flex h-24 items-end gap-1.5">
      {STITCH_LOAD_BARS.map((h, i) => (
        <span
          key={i}
          className="flex-1 rounded-md bg-gradient-to-t from-volt-500 to-volt-400 transition-all duration-300"
          style={{ height: `${live ? h + 6 : h}%`, opacity: 0.55 + i * 0.05 }}
        />
      ))}
    </div>
  );
}

function StitchMetric({
  label,
  value,
  icon: Icon,
  compact = false
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-ink-800 bg-ink-950/60",
        compact ? "p-2.5" : "p-3"
      )}
    >
      <Icon className="h-4 w-4 text-brand-300" />
      <p className="mt-2 text-[10px] uppercase tracking-widest text-ink-500">{label}</p>
      <p className="mt-0.5 font-display text-lg font-bold tabular-nums text-ink-50">{value}</p>
    </div>
  );
}

function StitchMessageCard({
  title,
  body,
  action,
  onAction,
  href
}: {
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
  href?: string;
}) {
  return (
    <PremiumCard className="p-4">
      <div className="flex gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
          <MessageCircle className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink-50">{title}</p>
          <p className="mt-1 text-xs leading-5 text-ink-400">{body}</p>
          {action && onAction ? (
            <button
              type="button"
              onClick={onAction}
              className="mt-3 h-8 rounded-xl bg-grad-pulse px-3 text-xs font-semibold text-ink-950 transition hover:scale-[1.01]"
            >
              {action}
            </button>
          ) : null}
          {action && href ? (
            <Link
              href={href}
              className="mt-3 inline-flex h-8 items-center rounded-xl bg-grad-pulse px-3 text-xs font-semibold text-ink-950 transition hover:scale-[1.01]"
            >
              {action}
            </Link>
          ) : null}
        </div>
      </div>
    </PremiumCard>
  );
}

export type StitchTodayScreenProps = {
  isCoach?: boolean;
  readinessScore: number;
  hrvMs: number;
  baselineHrvMs?: number;
  amberAlerts?: number;
  streakDays: number;
  sleepHours: string;
  sleepEfficiency?: number;
  loadLabel?: string;
  sessionLive: boolean;
  planApproved: boolean;
  aiHint?: string;
  onStartSession: () => void;
  onApprovePlan?: () => void;
};

export function StitchTodayScreen({
  isCoach = false,
  readinessScore,
  hrvMs,
  baselineHrvMs = 64,
  amberAlerts = 0,
  streakDays: _streakDays,
  sleepHours,
  sleepEfficiency = 88,
  loadLabel: _loadLabel,
  sessionLive,
  planApproved,
  aiHint,
  onStartSession,
  onApprovePlan
}: StitchTodayScreenProps) {
  void _streakDays;
  void _loadLabel;
  const t = useLocale().mobileApp.today;
  const hrvDelta = hrvMs - baselineHrvMs;
  const hrvSub = `${hrvDelta >= 0 ? "+" : ""}${hrvDelta}ms base`;
  const primeLabel = stitchPrimeLabel(readinessScore);
  const peakTitle =
    readinessScore >= 75
      ? "Peak Readiness"
      : readinessScore >= 50
        ? "Train Smart"
        : "Recovery Focus";
  const peakCopy =
    aiHint ??
    (isCoach
      ? t.coachAiFlag
      : readinessScore >= 75
        ? "Optimal state for high-strain training today."
        : t.basedOnSignals);

  return (
    <StitchScreenMotion>
      <div className="flex flex-col gap-5 pb-24">
        <StitchPrimeRing score={readinessScore} label={primeLabel} sublabel={peakTitle} />
        <p className="-mt-2 text-center text-sm text-ink-400">{peakCopy}</p>

        <div className="grid grid-cols-2 gap-1">
          <StitchHrvCard label={t.hrv} value={isCoach ? amberAlerts || hrvMs : hrvMs} delta={hrvSub} />
          <StitchStrainCard label="Day Strain" value={stitchDayStrain(readinessScore)} />
          <StitchSleepCard
            label={t.sleep}
            duration={sleepHours.replace("h", "h ").replace("m", "m")}
            efficiency={sleepEfficiency}
          />
        </div>

        <StitchAiDirectiveCard
          title="AI Coach Directive"
          body={
            planApproved
              ? t.planApproved
              : (aiHint ?? (isCoach ? t.coachAiFlag : t.athleteAiSuggest))
          }
          action={sessionLive ? t.returnToLive : t.startSession}
          onAction={onStartSession}
        />

        {!planApproved && onApprovePlan ? (
          <button
            type="button"
            onClick={onApprovePlan}
            className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-[#c0f500]/30 bg-[#c0f500]/10 text-xs font-semibold text-[#c0f500] transition hover:scale-[1.01]"
          >
            <Check className="h-3 w-3" />
            {t.approveUpdate}
          </button>
        ) : null}
      </div>
      <StitchAiFab onClick={onStartSession} />
    </StitchScreenMotion>
  );
}

export type StitchSessionsScreenProps = {
  sessionLive: boolean;
  title?: string;
  meta?: string;
  timeLabel?: string;
  hr?: string;
  pace?: string;
  load?: string;
  loading?: boolean;
  joinHref?: string;
  onStart: () => void;
  onEnd: () => void;
};

export function StitchSessionsScreen({
  sessionLive,
  title,
  meta,
  timeLabel,
  hr,
  pace,
  load,
  loading,
  joinHref,
  onStart,
  onEnd
}: StitchSessionsScreenProps) {
  const s = useLocale().mobileApp.sessions;
  const workoutTitle = title ?? s.workoutTitle;
  const workoutMeta = meta ?? s.workoutMeta;

  return (
    <StitchScreenMotion>
      <div className="space-y-3">
        <StitchSectionHeader title={s.title} kicker={sessionLive ? s.liveNow : s.nextUp} />
        <PremiumCard tone={sessionLive ? "brand" : "neutral"} className="p-4">
          {loading ? (
            <p className="text-sm text-ink-400">Loading sessions…</p>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-bold">{workoutTitle}</p>
                  <p className="mt-1 text-xs text-ink-400">{workoutMeta}</p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-widest",
                    sessionLive
                      ? "bg-accent-500/15 text-accent-300"
                      : "bg-brand-500/15 text-brand-300"
                  )}
                >
                  {sessionLive ? s.liveNow : (timeLabel ?? "07:30")}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <StitchMetric
                  label={s.hr}
                  value={sessionLive ? (hr ?? "142") : " -- "}
                  icon={HeartPulse}
                  compact
                />
                <StitchMetric
                  label={s.pace}
                  value={sessionLive ? (pace ?? "4:38") : " -- "}
                  icon={Activity}
                  compact
                />
                <StitchMetric
                  label={s.load}
                  value={sessionLive ? (load ?? "68%") : " -- "}
                  icon={Zap}
                  compact
                />
              </div>

              <ChartShell title={s.chartTitle} subtitle={s.chartSubtitle}>
                <StitchLoadBars live={sessionLive} />
              </ChartShell>

              {joinHref && sessionLive ? (
                <Link
                  href={joinHref}
                  className="mt-4 flex h-10 w-full items-center justify-center rounded-2xl border border-brand-500/30 bg-brand-500/10 text-sm font-semibold text-brand-200"
                >
                  Join room
                </Link>
              ) : null}

              <button
                type="button"
                onClick={sessionLive ? onEnd : onStart}
                className={cn(
                  "mt-5 flex h-11 w-full items-center justify-center rounded-2xl font-semibold transition hover:scale-[1.01]",
                  sessionLive
                    ? "border border-coral-500/40 bg-coral-500/10 text-coral-500"
                    : "bg-grad-pulse text-ink-950 shadow-volt-glow"
                )}
              >
                {sessionLive ? s.endSession : s.startLive}
              </button>
            </>
          )}
        </PremiumCard>
      </div>
    </StitchScreenMotion>
  );
}

export type StitchRosterRow = {
  name: string;
  readinessLabel: string;
  hrvMs: number;
};

export type StitchCoachScreenProps = {
  isCoach?: boolean;
  coachName?: string;
  coachHeadline?: string;
  coachAvatar?: string;
  hrvMs?: number;
  roster?: StitchRosterRow[];
  messageSent?: boolean;
  onSendCheckIn?: () => void;
};

export function StitchCoachScreen({
  isCoach = false,
  coachName = "Coach Diego",
  coachHeadline,
  coachAvatar,
  hrvMs = 68,
  roster,
  messageSent,
  onSendCheckIn
}: StitchCoachScreenProps) {
  const c = useLocale().mobileApp.coach;
  const title = isCoach ? c.rosterTitle : c.coachTitle;
  const rows: StitchRosterRow[] =
    roster ??
    (isCoach
      ? [
          { name: "Ines M.", readinessLabel: c.greenReadiness, hrvMs: 68 },
          { name: "Joao R.", readinessLabel: c.amberReadiness, hrvMs: 49 },
          { name: "Sara K.", readinessLabel: c.greenReadiness, hrvMs: 72 }
        ]
      : [{ name: coachName, readinessLabel: coachHeadline ?? c.greenReadiness, hrvMs }]);

  return (
    <StitchScreenMotion>
      <div className="space-y-3">
        <StitchSectionHeader
          title={title}
          kicker={isCoach ? c.activeAthletes : c.onlineNow}
        />
        <PremiumCard className="p-4">
          {rows.map((row) => (
            <div
              key={row.name}
              className="flex items-center justify-between border-b border-glass-border py-3 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                {!isCoach && coachAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coachAvatar}
                    alt=""
                    className="h-10 w-10 rounded-2xl object-cover ring-1 ring-brand-500/20"
                  />
                ) : (
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 text-brand-200">
                    {isCoach ? (
                      <UserRound className="h-5 w-5" />
                    ) : (
                      <UsersRound className="h-5 w-5" />
                    )}
                  </span>
                )}
                <div>
                  <p className="text-sm font-semibold text-ink-50">{row.name}</p>
                  <p className="text-xs text-ink-400">{row.readinessLabel}</p>
                </div>
              </div>
              <span className="text-xs tabular-nums text-accent-400">{row.hrvMs} ms</span>
            </div>
          ))}
        </PremiumCard>
        <button
          type="button"
          onClick={onSendCheckIn}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-brand-500/30 bg-brand-500/10 text-sm font-semibold text-brand-200 transition hover:scale-[1.01]"
        >
          <Send className="h-4 w-4" />
          {messageSent ? c.messageSent : c.sendCheckIn}
        </button>
      </div>
    </StitchScreenMotion>
  );
}

export type StitchInboxScreenProps = {
  messages?: ThreadMessage[];
  loading?: boolean;
  planApproved?: boolean;
  messageSent?: boolean;
  onApprovePlan?: () => void;
};

export function StitchInboxScreen({
  messages = [],
  loading,
  planApproved = false,
  messageSent = false,
  onApprovePlan
}: StitchInboxScreenProps) {
  const i = useLocale().mobileApp.inbox;
  const hasMessages = messages.length > 0;

  return (
    <StitchScreenMotion>
      <div className="space-y-3">
        <StitchSectionHeader title={i.title} kicker={i.kicker} />
        {loading ? (
          <PremiumCard className="p-4">
            <p className="text-sm text-ink-400">Syncing inbox…</p>
          </PremiumCard>
        ) : hasMessages ? (
          messages.slice(0, 6).map((msg) => (
            <StitchMessageCard
              key={msg.id}
              title={messageSubject(msg)}
              body={expandMessageBody(msg)}
            />
          ))
        ) : (
          <>
            <StitchMessageCard
              title={i.planApprovedTitle}
              body={planApproved ? i.planApprovedBody : i.planPendingBody}
              action={!planApproved ? i.approve : undefined}
              onAction={onApprovePlan}
            />
            <StitchMessageCard
              title={i.checkInTitle}
              body={messageSent ? i.checkInSentBody : i.checkInPrompt}
            />
          </>
        )}
      </div>
    </StitchScreenMotion>
  );
}

export type StitchProfileScreenProps = {
  name: string;
  subtitle?: string;
  streakDays: number;
  readinessScore: number;
  isCoach?: boolean;
  showSettings?: boolean;
};

export function StitchProfileScreen({
  name,
  subtitle,
  streakDays,
  readinessScore,
  isCoach = false,
  showSettings = true
}: StitchProfileScreenProps) {
  const p = useLocale().mobileApp.profile;

  return (
    <StitchScreenMotion>
      <div className="space-y-3">
        <StitchSectionHeader
          title={p.title}
          kicker={isCoach ? p.coachKicker : p.athleteKicker}
        />
        <PremiumCard tone="volt" className="p-4 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-grad-pulse text-ink-950 shadow-volt-glow ring-2 ring-volt-500/30">
            <UserRound className="h-8 w-8" />
          </span>
          <p className="mt-3 font-display text-xl font-bold">{name}</p>
          <p className="text-xs text-ink-400">
            {subtitle ?? (isCoach ? p.coachRole : p.athleteRole)}
          </p>
        </PremiumCard>
        <div className="grid grid-cols-2 gap-3">
          <MetricTile label={p.streak} value={`${streakDays}d`} icon={Zap} tone="volt" />
          <MetricTile
            label={p.score}
            value={isCoach ? "4.96" : String(readinessScore)}
            icon={Activity}
          />
        </div>
        {showSettings ? <ProfileSettingsPanel compact /> : null}
      </div>
    </StitchScreenMotion>
  );
}

/** Map API sessions to stitch session screen props. */
export function stitchSessionFromSummary(
  session: SessionSummary | undefined,
  coachName: string
) {
  if (!session) return undefined;
  return {
    title: session.type,
    meta: `45 min · coach ${coachName} · ${session.intensity}`,
    timeLabel: session.when,
    joinHref: session.mode === "Online" ? `/sessions/${session.id}/room` : undefined
  };
}
