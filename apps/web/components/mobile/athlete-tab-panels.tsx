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
import { AiInsightCard, BentoCard, EliteButton } from "@/components/elite-os";
import { BodyText, Headline, LabelCaps } from "@/components/elite-os/typography";
import { EliteStatTile } from "@/components/dashboard/elite";
import { ChartShell, RealtimeBadge } from "@/components/ui-glass/premium-system";
import { cn } from "@/lib/utils";

const loadBars = [54, 28, 78, 36, 88, 42, 68];

function TabMotion({ children }: { children: React.ReactNode }) {
  return <div className="fc-mobile-page-enter">{children}</div>;
}

function PanelHeader({
  eyebrow,
  title,
  body,
  action
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow ? <LabelCaps className="text-eos-iris-soft">{eyebrow}</LabelCaps> : null}
        <Headline className="mt-2 text-2xl">{title}</Headline>
        {body ? <BodyText className="mt-2 text-sm">{body}</BodyText> : null}
      </div>
      {action}
    </header>
  );
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
        <PanelHeader
          eyebrow={live ? "Live now" : "Next up"}
          title="Sessions"
          body="Calendar, live strain and coach context in one place."
          action={<RealtimeBadge>{loading ? "Syncing" : "Up to date"}</RealtimeBadge>}
        />

        <BentoCard
          elevation={live ? "2" : "glass"}
          className={cn(live && "border-eos-iris/25")}
        >
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
                <span className="rounded-full border border-eos-voltline/30 bg-eos-voltline-dim px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-eos-voltline">
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
                  <EliteButton asChild variant="primary">
                    <Link href={`/sessions/${upcoming.id}/room`}>
                      <Video className="h-4 w-4" />
                      Join room
                    </Link>
                  </EliteButton>
                )}
                <EliteButton asChild variant="secondary">
                  <Link href="/dashboard">Start from today</Link>
                </EliteButton>
              </div>
            </>
          ) : (
            <>
              <p className="font-display text-lg font-bold text-ink-50">Lower body strength</p>
              <p className="mt-1 text-xs text-ink-400">45 min · coach {coachName} · RPE target 7</p>
              <ChartShell title="Weekly load" subtitle="Demo session preview">
                <LoadBars live={false} />
              </ChartShell>
              <EliteButton asChild variant="primary" className="mt-4 w-full">
                <Link href="/dashboard">Book from dashboard</Link>
              </EliteButton>
            </>
          )}
        </BentoCard>

        {!loading && sessions.length > 1 && (
          <div className="space-y-2">
            <LabelCaps className="opacity-50">Also scheduled</LabelCaps>
            {sessions.slice(1, 4).map((s) => (
              <BentoCard key={s.id} elevation="1" className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink-50">{s.type}</p>
                  <p className="text-xs text-ink-400">{s.when}</p>
                </div>
                <Calendar className="h-4 w-4 text-eos-voltline" />
              </BentoCard>
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
        <PanelHeader
          eyebrow="Online now"
          title="Coach"
          body="Your specialist sees recovery, load and session notes in real time."
        />
        <BentoCard elevation="2" className="border-eos-iris/20">
          <div className="flex items-center gap-4">
            {coachAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coachAvatar}
                alt=""
                className="h-16 w-16 rounded-[var(--eos-radius-nested)] object-cover ring-1 ring-eos-iris/30"
              />
            ) : (
              <span className="grid h-16 w-16 place-items-center rounded-[var(--eos-radius-nested)] bg-eos-voltline text-eos-floor">
                <UserRound className="h-8 w-8" />
              </span>
            )}
            <div>
              <p className="font-display text-xl font-bold text-ink-50">{coachName}</p>
              <p className="text-sm text-ink-400">{coachHeadline ?? "Verified specialist"}</p>
              <p className="mt-2 text-xs text-eos-voltline">Your HRV today · {hrvMs} ms</p>
            </div>
          </div>
        </BentoCard>

        <div className="grid grid-cols-2 gap-3">
          <EliteStatTile icon={MessageCircle} label="Response" value="< 2h" />
          <EliteStatTile icon={Activity} label="Plan sync" value="Live" tone="volt" />
        </div>

        <AiInsightCard
          title="Coach check-in ready"
          body="Send a quick note after your last set — your coach sees it in Inbox instantly."
          action={
            <EliteButton asChild variant="secondary" size="sm">
              <Link href="/inbox">
                <Send className="h-4 w-4" />
                Open inbox
              </Link>
            </EliteButton>
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
        <PanelHeader eyebrow="Athlete profile" title="Profile" />
        <BentoCard elevation="2" className="border-eos-voltline/20 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-[var(--eos-radius-card)] bg-eos-voltline text-eos-floor ring-2 ring-eos-voltline/30">
            <UserRound className="h-8 w-8" />
          </span>
          <p className="mt-3 font-display text-xl font-bold text-ink-50">{name}</p>
          <p className="text-xs text-ink-400">{subtitle ?? "Hybrid athlete · Lisbon"}</p>
        </BentoCard>
        <div className="grid grid-cols-2 gap-3">
          <EliteStatTile icon={Zap} label="Streak" value={`${streakDays}d`} tone="volt" />
          <EliteStatTile icon={Activity} label="Readiness" value={`${readinessScore}`} tone="telemetry" />
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
          className="flex-1 rounded-md bg-gradient-to-t from-eos-iris to-eos-voltline transition-all duration-300"
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
    <div className="rounded-[var(--eos-radius-nested)] border border-eos-outline bg-eos-floor/60 p-2.5">
      <Icon className="h-4 w-4 text-eos-telemetry" />
      <p className="mt-2 text-[10px] uppercase tracking-widest text-ink-500">{label}</p>
      <p className="mt-0.5 truncate font-display text-sm font-bold tabular-nums text-ink-50">
        {value}
      </p>
    </div>
  );
}
