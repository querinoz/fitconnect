"use client";

import Link from "next/link";
import {
  Activity,
  Calendar,
  HeartPulse,
  MessageCircle,
  Send,
  UserRound,
  Video,
  Zap
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SessionSummary, ThreadMessage } from "@fitconnect/types";
import { ProfileSettingsPanel } from "@/components/mobile/profile-settings-panel";
import { MessageInbox } from "@/components/inbox/message-inbox";
import {
  AIInsight,
  ChartShell,
  MetricTile,
  PremiumCard,
  RealtimeBadge,
  SectionHeader
} from "@/components/ui-glass/premium-system";
import { cn } from "@/lib/utils";

const loadBars = [54, 28, 78, 36, 88, 42, 68];

function TabMotion({ children }: { children: React.ReactNode }) {
  return <div className="fc-mobile-page-enter">{children}</div>;
}

export function SessionsTabPanel({
  sessions,
  loading,
  coachName = "Diego"
}: {
  sessions: SessionSummary[];
  loading?: boolean;
  coachName?: string;
}) {
  const upcoming = sessions.find((s) => s.status === "scheduled") ?? sessions[0];
  const live = upcoming?.status === "scheduled" && upcoming?.when.toLowerCase().includes("now");

  return (
    <TabMotion>
    <div className="space-y-4 pb-2">
      <SectionHeader
        eyebrow={live ? "Live now" : "Next up"}
        title="Sessions"
        body="Calendar, live strain and coach context in one place."
        action={<RealtimeBadge>{loading ? "Syncing" : "Up to date"}</RealtimeBadge>}
      />

      <PremiumCard tone={live ? "brand" : "volt"} className="p-4">
        {loading ? (
          <p className="text-sm text-ink-400">Loading sessions…</p>
        ) : upcoming ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg font-bold text-ink-50">{upcoming.type}</p>
                <p className="mt-1 text-xs text-ink-400">
                  45 min · coach {coachName} · {upcoming.intensity}
                </p>
              </div>
              <span className="rounded-full bg-volt-500/15 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-volt-300">
                {upcoming.when}
              </span>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              <MiniMetric label="Mode" value={upcoming.mode} icon={Activity} />
              <MiniMetric label="Type" value={upcoming.type.split(" ")[0] ?? "—"} icon={HeartPulse} />
              <MiniMetric label="Load" value={upcoming.intensity} icon={Zap} />
            </div>
            <ChartShell title="Live strain curve" subtitle="HR, pace and load">
              <LoadBars live={Boolean(live)} />
            </ChartShell>
            <div className="mt-4 flex flex-wrap gap-2">
              {upcoming.mode === "Online" && (
                <Link
                  href={`/sessions/${upcoming.id}/room`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-volt-500 px-5 font-semibold text-ink-950 shadow-volt-glow"
                >
                  <Video className="h-4 w-4" />
                  Join room
                </Link>
              )}
              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-glass-border bg-glass-md px-5 text-sm font-semibold text-volt-400"
              >
                Start from today
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="font-display text-lg font-bold text-ink-50">Lower body strength</p>
            <p className="mt-1 text-xs text-ink-400">45 min · coach {coachName} · RPE target 7</p>
            <ChartShell title="Weekly load" subtitle="Demo session preview">
              <LoadBars live={false} />
            </ChartShell>
            <Link
              href="/dashboard"
              className="mt-4 flex h-11 w-full items-center justify-center rounded-full bg-volt-500 font-semibold text-ink-950 shadow-volt-glow"
            >
              Book from dashboard
            </Link>
          </>
        )}
      </PremiumCard>

      {!loading && sessions.length > 1 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-500">Also scheduled</p>
          {sessions.slice(1, 4).map((s) => (
            <PremiumCard key={s.id} className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-semibold text-ink-50">{s.type}</p>
                <p className="text-xs text-ink-400">{s.when}</p>
              </div>
              <Calendar className="h-4 w-4 text-volt-400" />
            </PremiumCard>
          ))}
        </div>
      )}
    </div>
    </TabMotion>
  );
}

export function CoachTabPanel({
  coachName,
  coachHeadline,
  coachAvatar,
  hrvMs = 68
}: {
  coachName: string;
  coachHeadline?: string;
  coachAvatar?: string;
  hrvMs?: number;
}) {
  return (
    <TabMotion>
    <div className="space-y-4 pb-2">
      <SectionHeader
        eyebrow="Online now"
        title="Coach"
        body="Your specialist sees recovery, load and session notes in real time."
      />
      <PremiumCard tone="brand" className="p-4">
        <div className="flex items-center gap-4">
          {coachAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coachAvatar}
              alt=""
              className="h-16 w-16 rounded-2xl object-cover ring-1 ring-volt-500/30"
            />
          ) : (
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-grad-pulse text-ink-950 shadow-volt-glow">
              <UserRound className="h-8 w-8" />
            </span>
          )}
          <div>
            <p className="font-display text-xl font-bold text-ink-50">{coachName}</p>
            <p className="text-sm text-ink-400">{coachHeadline ?? "Verified specialist"}</p>
            <p className="mt-2 text-xs text-volt-300">Your HRV today · {hrvMs} ms</p>
          </div>
        </div>
      </PremiumCard>

      <div className="grid grid-cols-2 gap-3">
        <MetricTile label="Response" value="< 2h" delta="Priority support" icon={MessageCircle} tone="volt" />
        <MetricTile label="Plan sync" value="Live" delta="BroadcastChannel" icon={Activity} tone="brand" />
      </div>

      <AIInsight
        title="Coach check-in ready"
        body="Send a quick note after your last set — your coach sees it in Inbox instantly."
        action={
          <Link
            href="/inbox"
            className="mt-3 inline-flex h-9 items-center gap-2 rounded-full border border-volt-500/30 bg-volt-500/10 px-4 text-xs font-semibold text-volt-300"
          >
            <Send className="h-4 w-4" />
            Open inbox
          </Link>
        }
      />
    </div>
    </TabMotion>
  );
}

export function InboxTabPanel({
  messages,
  loading
}: {
  messages: ThreadMessage[];
  loading?: boolean;
}) {
  return (
    <TabMotion>
      <MessageInbox messages={messages} loading={loading} />
    </TabMotion>
  );
}

export function ProfileTabPanel({
  name,
  subtitle,
  streakDays = 35,
  readinessScore = 82
}: {
  name: string;
  subtitle?: string;
  streakDays?: number;
  readinessScore?: number;
}) {
  return (
    <TabMotion>
    <div className="space-y-4 pb-2">
      <SectionHeader eyebrow="Athlete profile" title="Profile" />
      <PremiumCard tone="volt" className="p-4 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-grad-pulse text-ink-950 shadow-volt-glow ring-2 ring-volt-500/30">
          <UserRound className="h-8 w-8" />
        </span>
        <p className="mt-3 font-display text-xl font-bold text-ink-50">{name}</p>
        <p className="text-xs text-ink-400">{subtitle ?? "Hybrid athlete · Lisbon"}</p>
      </PremiumCard>
      <div className="grid grid-cols-2 gap-3">
        <MetricTile label="Streak" value={`${streakDays}d`} icon={Zap} tone="volt" />
        <MetricTile label="Readiness" value={String(readinessScore)} icon={Activity} tone="brand" />
      </div>
      <ProfileSettingsPanel compact />
    </div>
    </TabMotion>
  );
}

function LoadBars({ live }: { live: boolean }) {
  return (
    <div className="flex h-24 items-end gap-1.5">
      {loadBars.map((h, i) => (
        <span
          key={i}
          className="flex-1 rounded-md bg-gradient-to-t from-brand-500 to-volt-400 transition-all duration-300"
          style={{ height: `${live ? h + 6 : h}%`, opacity: 0.55 + i * 0.05 }}
        />
      ))}
    </div>
  );
}

function MiniMetric({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-950/60 p-2.5">
      <Icon className="h-4 w-4 text-brand-300" />
      <p className="mt-2 text-[10px] uppercase tracking-widest text-ink-500">{label}</p>
      <p className="mt-0.5 truncate font-display text-sm font-bold tabular-nums text-ink-50">{value}</p>
    </div>
  );
}
