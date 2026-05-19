"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion
} from "framer-motion";
import {
  Activity,
  Bell,
  Calendar,
  Check,
  Dumbbell,
  HeartPulse,
  Home,
  MessageCircle,
  Send,
  UserRound,
  UsersRound,
  Zap
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { MobileAppHeader } from "@/components/brand/mobile-app-header";
import { ProfileSettingsPanel } from "@/components/mobile/profile-settings-panel";
import { cn } from "@/lib/utils";
import {
  ChartShell,
  MetricTile,
  PremiumCard,
  RealtimeBadge,
  SectionHeader
} from "@/components/ui-glass/premium-system";
import { RiftBento, RiftLabel, RiftScore } from "@/components/ui-glass/rift-bento";
import type { DashboardPreviewRole } from "./role-dashboard-preview";
import { useLocale } from "@/lib/i18n-provider";
import type { Dict } from "@/lib/i18n/types";

type MobileScreen = "today" | "sessions" | "coach" | "inbox" | "profile";

type MobileAppPreviewProps = {
  initialRole?: DashboardPreviewRole;
};

const athleteLoad = [54, 28, 78, 36, 88, 42, 68];
export function MobileAppPreview({
  initialRole = "athlete"
}: MobileAppPreviewProps) {
  const [screen, setScreen] = useState<MobileScreen>("today");
  const [sessionLive, setSessionLive] = useState(false);
  const [planApproved, setPlanApproved] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [streak, setStreak] = useState(35);
  const isCoach = initialRole === "coach";
  const reduce = useReducedMotion();
  const m = useLocale().mobileApp;

  const nav = useMemo(
    () => [
      { id: "today" as const, label: m.nav.today, icon: Home },
      { id: "sessions" as const, label: m.nav.sessions, icon: Calendar },
      {
        id: "coach" as const,
        label: isCoach ? m.nav.roster : m.nav.coach,
        icon: isCoach ? UsersRound : UserRound
      },
      { id: "inbox" as const, label: m.nav.inbox, icon: Bell },
      { id: "profile" as const, label: m.nav.profile, icon: UserRound }
    ],
    [isCoach, m.nav]
  );

  return (
    <div className="relative flex min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden bg-ink-950 text-ink-100 premium-grid">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-volt-500/12 via-brand-500/5 to-transparent"
      />
      <div className="relative shrink-0 px-3 pb-2 pt-1 sm:px-4">
        <MobileAppHeader
          trailing={
            <span className="rounded-full border border-volt-500/30 bg-volt-500/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-volt-300">
              {m.voltline}
            </span>
          }
          eyebrow={isCoach ? m.header.coachEyebrow : m.header.athleteEyebrow}
          title={isCoach ? m.header.coachGreeting : m.header.athleteGreeting}
          action={
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-grad-pulse text-ink-950 shadow-volt-glow ring-1 ring-volt-500/30 sm:h-10 sm:w-10 sm:rounded-2xl">
              {isCoach ? (
                <UsersRound className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </span>
          }
        />
        <div className="mt-2.5 flex items-center justify-between gap-2 rounded-full border border-volt-500/20 bg-glass-md px-3 py-1.5 backdrop-blur-glass shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <RealtimeBadge>{m.header.syncBadge}</RealtimeBadge>
          <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-500">
            {m.header.syncAgo}
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 pb-2 hide-scrollbar sm:px-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={screen}
            initial={{ opacity: 0, y: reduce ? 0 : 12, scale: reduce ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduce ? 0 : -8, scale: reduce ? 1 : 0.985 }}
            transition={{ duration: reduce ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            {screen === "today" && (
              <TodayScreen
                m={m}
                isCoach={isCoach}
                sessionLive={sessionLive}
                planApproved={planApproved}
                streak={streak}
                onStart={() => {
                  setScreen("sessions");
                  setSessionLive(true);
                }}
                onApprove={() => setPlanApproved(true)}
              />
            )}
            {screen === "sessions" && (
              <SessionsScreen
                m={m}
                sessionLive={sessionLive}
                onStart={() => setSessionLive(true)}
                onEnd={() => {
                  setSessionLive(false);
                  setStreak((value) => value + 1);
                }}
              />
            )}
            {screen === "coach" && (
              <CoachScreen
                m={m}
                isCoach={isCoach}
                messageSent={messageSent}
                onSend={() => {
                  setMessageSent(true);
                  setScreen("inbox");
                }}
              />
            )}
            {screen === "inbox" && (
              <InboxScreen
                m={m}
                planApproved={planApproved}
                messageSent={messageSent}
                onApprove={() => setPlanApproved(true)}
              />
            )}
            {screen === "profile" && (
              <ProfileScreen m={m} streak={streak} isCoach={isCoach} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <nav
        aria-label={m.nav.ariaLabel}
        className="mx-2 mb-2 mt-auto shrink-0 rounded-glass-lg border border-glass-border bg-glass-md px-1 py-1.5 backdrop-blur-glass-lg shadow-volt-glow safe-area-pb sm:mx-3 sm:mb-2 sm:px-1.5 sm:py-2"
      >
        <ul className="flex items-center justify-between">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = screen === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  aria-current={active ? "page" : undefined}
                  onClick={() => setScreen(item.id)}
                  className={cn(
                    "grid h-11 min-w-11 place-items-center rounded-full transition-all",
                    active
                      ? "bg-grad-pulse text-ink-950"
                      : "text-ink-500 hover:text-ink-100"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  <span className="sr-only">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

function TodayScreen({
  m,
  isCoach,
  sessionLive,
  planApproved,
  streak,
  onStart,
  onApprove
}: {
  m: Dict["mobileApp"];
  isCoach: boolean;
  sessionLive: boolean;
  planApproved: boolean;
  streak: number;
  onStart: () => void;
  onApprove: () => void;
}) {
  const t = m.today;
  const readiness = isCoach ? 84 : 82;

  return (
    <div className="grid grid-cols-2 auto-rows-[minmax(72px,auto)] gap-2.5">
      <RiftBento tone="volt" span="md" className="min-h-[148px] !p-3.5">
        <RiftLabel>{t.readiness}</RiftLabel>
        <div className="mt-1 flex items-end justify-between gap-2">
          <div>
            <RiftScore value={readiness} className="text-[2.75rem]" />
            <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-volt-400">
              <Zap className="h-3 w-3" aria-hidden />
              {isCoach ? t.rosterGreen : t.trainHard}
            </p>
          </div>
          <svg viewBox="0 0 80 80" className="h-16 w-16 shrink-0 -rotate-90" aria-hidden>
            <circle cx="40" cy="40" r="32" fill="transparent" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
            <circle
              cx="40"
              cy="40"
              r="32"
              fill="transparent"
              stroke="#C8FF00"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 32}
              strokeDashoffset={2 * Math.PI * 32 * (1 - readiness / 100)}
            />
          </svg>
        </div>
        <button
          type="button"
          onClick={onStart}
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-grad-pulse text-xs font-semibold text-ink-950 shadow-volt-glow transition hover:scale-[1.01]"
        >
          <Dumbbell className="h-3.5 w-3.5" />
          {sessionLive ? t.returnToLive : t.startSession}
        </button>
      </RiftBento>

      <RiftBento tone="neutral" className="!p-3">
        <RiftLabel>{t.hrv}</RiftLabel>
        <p className="mt-1 font-display text-xl font-extrabold text-ink-50">
          {isCoach ? "3" : "68"}
        </p>
        <p className="text-[9px] font-semibold text-emerald-500">
          {isCoach ? t.amberAlerts : t.msDelta}
        </p>
      </RiftBento>

      <RiftBento tone="neutral" className="!p-3">
        <RiftLabel>{t.streak}</RiftLabel>
        <p className="mt-1 font-display text-xl font-extrabold text-brand-400">{streak}d</p>
        <p className="text-[9px] text-ink-400">{t.personalBest}</p>
      </RiftBento>

      <RiftBento tone="connect" className="!p-3">
        <RiftLabel>{t.sleep}</RiftLabel>
        <p className="mt-1 font-display text-xl font-extrabold text-ink-50">7h42</p>
        <p className="text-[9px] font-semibold text-brand-400">{t.sleepQuality}</p>
      </RiftBento>

      <RiftBento tone="cyan" className="!p-3">
        <RiftLabel>{t.load}</RiftLabel>
        <p className="mt-1 font-display text-xl font-extrabold text-cyan-500">6.4k</p>
        <p className="text-[9px] text-ink-400">{t.sevenDay}</p>
      </RiftBento>

      <RiftBento tone="neutral" span="full" className="!p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold text-ink-100">{t.weeklyLoad}</p>
          <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-volt-500">
            {t.onTarget}
          </span>
        </div>
        <div className="flex h-14 items-end gap-1.5" role="img" aria-label={t.weeklyLoad}>
          {athleteLoad.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-md bg-gradient-to-t from-volt-600 to-volt-400"
              style={{ height: `${h}%`, opacity: 0.45 + i * 0.06 }}
            />
          ))}
        </div>
      </RiftBento>

      <RiftBento tone="cyan" span="full" className="!p-3">
        <div className="flex items-start gap-2.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cyan-dim text-cyan-500 ring-1 ring-cyan-500/20">
            <Activity className="h-3.5 w-3.5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold leading-snug text-ink-100">
              {isCoach ? t.coachAiFlag : t.athleteAiSuggest}
            </p>
            <p className="mt-1 text-[10px] text-ink-400">
              {planApproved ? t.planApproved : t.basedOnSignals}
            </p>
            {!planApproved ? (
              <button
                type="button"
                onClick={onApprove}
                className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-lg border border-volt-500/30 bg-volt-500/10 px-2.5 text-[10px] font-semibold text-volt-300"
              >
                <Check className="h-3 w-3" />
                {t.approveUpdate}
              </button>
            ) : null}
          </div>
        </div>
      </RiftBento>
    </div>
  );
}

function SessionsScreen({
  m,
  sessionLive,
  onStart,
  onEnd
}: {
  m: Dict["mobileApp"];
  sessionLive: boolean;
  onStart: () => void;
  onEnd: () => void;
}) {
  const s = m.sessions;
  return (
    <div className="space-y-3">
      <Header title={s.title} kicker={sessionLive ? s.liveNow : s.nextUp} />
      <PremiumCard tone={sessionLive ? "brand" : "neutral"} className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-lg font-bold">{s.workoutTitle}</p>
            <p className="mt-1 text-xs text-ink-400">{s.workoutMeta}</p>
          </div>
          <span
            className={cn(
              "rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-widest",
              sessionLive
                ? "bg-accent-500/15 text-accent-300"
                : "bg-brand-500/15 text-brand-300"
            )}
          >
            {sessionLive ? s.liveNow : "07:30"}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <Metric label={s.hr} value={sessionLive ? "142" : " -- "} icon={HeartPulse} compact />
          <Metric label={s.pace} value={sessionLive ? "4:38" : " -- "} icon={Activity} compact />
          <Metric label={s.load} value={sessionLive ? "68%" : " -- "} icon={Zap} compact />
        </div>

        <ChartShell title={s.chartTitle} subtitle={s.chartSubtitle}>
          <LoadBars live={sessionLive} />
        </ChartShell>

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
      </PremiumCard>
    </div>
  );
}

function CoachScreen({
  m,
  isCoach,
  messageSent,
  onSend
}: {
  m: Dict["mobileApp"];
  isCoach: boolean;
  messageSent: boolean;
  onSend: () => void;
}) {
  const c = m.coach;
  const title = isCoach ? c.rosterTitle : c.coachTitle;
  return (
    <div className="space-y-3">
      <Header title={title} kicker={isCoach ? c.activeAthletes : c.onlineNow} />
      <PremiumCard className="p-4">
        {(isCoach ? ["Ines M.", "Joao R.", "Sara K."] : ["Coach Diego"]).map(
          (name, index) => (
            <div
              key={name}
              className="flex items-center justify-between border-b border-glass-border py-3 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 text-brand-200">
                  {isCoach ? <UserRound className="h-5 w-5" /> : <UsersRound className="h-5 w-5" />}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink-50">{name}</p>
                  <p className="text-xs text-ink-400">
                    {index === 1 ? c.amberReadiness : c.greenReadiness}
                  </p>
                </div>
              </div>
              <span className="text-xs tabular-nums text-accent-400">
                {index === 1 ? "49 ms" : "68 ms"}
              </span>
            </div>
          )
        )}
      </PremiumCard>
      <button
        type="button"
        onClick={onSend}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-brand-500/30 bg-brand-500/10 text-sm font-semibold text-brand-200"
      >
        <Send className="h-4 w-4" />
        {messageSent ? c.messageSent : c.sendCheckIn}
      </button>
    </div>
  );
}

function InboxScreen({
  m,
  planApproved,
  messageSent,
  onApprove
}: {
  m: Dict["mobileApp"];
  planApproved: boolean;
  messageSent: boolean;
  onApprove: () => void;
}) {
  const i = m.inbox;
  return (
    <div className="space-y-3">
      <Header title={i.title} kicker={i.kicker} />
      <MessageCard
        title={i.planApprovedTitle}
        body={planApproved ? i.planApprovedBody : i.planPendingBody}
        action={!planApproved ? i.approve : undefined}
        onAction={onApprove}
      />
      <MessageCard
        title={messageSent ? i.checkInTitle : i.checkInTitle}
        body={messageSent ? i.checkInSentBody : i.checkInPrompt}
      />
    </div>
  );
}

function ProfileScreen({
  m,
  streak,
  isCoach
}: {
  m: Dict["mobileApp"];
  streak: number;
  isCoach: boolean;
}) {
  const p = m.profile;
  return (
    <div className="space-y-3">
      <Header title={p.title} kicker={isCoach ? p.coachKicker : p.athleteKicker} />
      <PremiumCard tone="volt" className="p-4 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-grad-pulse text-ink-950 shadow-volt-glow ring-2 ring-volt-500/30">
          <UserRound className="h-8 w-8" />
        </span>
        <p className="mt-3 font-display text-xl font-bold">
          {isCoach ? p.coachName : p.athleteName}
        </p>
        <p className="text-xs text-ink-400">{isCoach ? p.coachRole : p.athleteRole}</p>
      </PremiumCard>
      <div className="grid grid-cols-2 gap-3">
        <MetricTile label={p.streak} value={`${streak}d`} icon={Zap} tone="volt" />
        <MetricTile label={p.score} value={isCoach ? "4.96" : "82"} icon={Activity} />
      </div>
      <ProfileSettingsPanel compact />
    </div>
  );
}

function Header({ title, kicker }: { title: string; kicker: string }) {
  return (
    <SectionHeader eyebrow={kicker} title={title} className="mb-1" />
  );
}

function LoadBars({ live }: { live: boolean }) {
  return (
    <div className="flex h-24 items-end gap-1.5">
      {athleteLoad.map((h, i) => (
        <span
          key={i}
          className="flex-1 rounded-md bg-gradient-to-t from-volt-500 to-volt-400 transition-all duration-300"
          style={{ height: `${live ? h + 6 : h}%`, opacity: 0.55 + i * 0.05 }}
        />
      ))}
    </div>
  );
}

function Metric({
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
      <p className="mt-2 text-[10px] uppercase tracking-widest text-ink-500">
        {label}
      </p>
      <p className="mt-0.5 font-display text-lg font-bold tabular-nums text-ink-50">
        {value}
      </p>
    </div>
  );
}

function MessageCard({
  title,
  body,
  action,
  onAction
}: {
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
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
          {action && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="mt-3 h-8 rounded-xl bg-grad-pulse px-3 text-xs font-semibold text-ink-950"
            >
              {action}
            </button>
          )}
        </div>
      </div>
    </PremiumCard>
  );
}
