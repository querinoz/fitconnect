"use client";

import Link from "next/link";
import type { ReactElement } from "react";
import { getTrainerById } from "@/lib/dashboard/seed";
import {
  ArrowUpRight,
  Calendar,
  ChevronRight,
  Flame,
  Goal,
  HeartPulse,
  Moon,
  PlayCircle,
  Timer,
  TrendingUp
} from "lucide-react";
import { DashboardShell } from "./dashboard-shell";
import { ReadinessCard } from "./readiness-card";
import { CoachPlanPanel } from "./coach-plan-panel";
import { AiInsightCard, BentoCard, EliteButton, EliteChip } from "@/components/elite-os";
import { EliteAppPageHeader } from "@/components/shell/elite";
import { AIAssistant } from "@/components/ai-assistant";
import { useT } from "@/lib/i18n-provider";
import { useAthleteContext } from "@/lib/use-dashboard-context";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { rechartsTheme } from "@/lib/charts/recharts-theme";

const tooltipStyle = {
  background: rechartsTheme.tooltipBg,
  border: `1px solid ${rechartsTheme.tooltipBorder}`,
  borderRadius: "12px"
};

export function AthleteDashboardView({ wrapShell = true }: { wrapShell?: boolean }) {
  const t = useT();
  const ctx = useAthleteContext();

  if (!ctx.athlete) {
    const fallback = (
      <p className="text-ink-400">No athlete profile linked to this account.</p>
    );
    return wrapShell ? <DashboardShell>{fallback}</DashboardShell> : fallback;
  }

  const { athlete, plan, coach, sessions, messages, habits } = ctx;

  const body = (
    <>
      <EliteAppPageHeader
        eyebrow={t("dashboard", "eyebrow")}
        title={t("dashboard", "welcome")}
        subtitle={t("dashboard", "streak")}
        action={
          <div className="flex w-full flex-col gap-2 xs:flex-row sm:w-auto">
            <EliteButton variant="secondary" className="w-full min-h-[44px] sm:w-auto">
              <Calendar className="h-4 w-4" /> {t("dashboard", "schedule")}
            </EliteButton>
            <EliteButton variant="primary" className="w-full min-h-[44px] sm:w-auto">
              <PlayCircle className="h-4 w-4" /> {t("dashboard", "startSession")}
            </EliteButton>
          </div>
        }
      />

      {coach && (
        <Link
          href={`/discover`}
          className="flex items-center gap-3 rounded-2xl border border-ink-800 bg-ink-950/50 p-3 hover:border-brand-400/40 transition-colors"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coach.avatar}
            alt=""
            className="h-11 w-11 rounded-full ring-2 ring-ink-800 object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-ink-500">{t("hub", "yourCoach")}</p>
            <p className="font-semibold text-ink-100 truncate">{coach.name}</p>
            <p className="text-xs text-ink-400 truncate">{coach.headline}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-ink-500 shrink-0" />
        </Link>
      )}

      <AiInsightCard
        title={t("dashboard", "aiSuggestion")}
        body={plan?.aiSuggestion ?? t("dashboard", "wearableSyncHint")}
        action={
          <EliteButton size="sm" variant="secondary" className="min-h-[44px]" asChild>
            <a href="#coach-plan">{t("dashboard", "applyPlan")}</a>
          </EliteButton>
        }
      />

      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <BentoCard elevation="1">
          <ReadinessCard score={athlete.readiness} />
        </BentoCard>
        <MetricCard
          icon={HeartPulse}
          tone="text-signal-400 ring-signal-500/30 bg-signal-500/10"
          value={`${athlete.hrv} ms`}
          label={t("dashboard", "hrvLabel")}
          delta="+4"
          chart={
            <LineChart data={ctx.sleepWeek}>
              <Line type="monotone" dataKey="hrv" stroke={rechartsTheme.hrv} strokeWidth={2} dot={false} />
            </LineChart>
          }
        />
        <MetricCard
          icon={Moon}
          tone="text-brand-300 ring-brand-500/30 bg-brand-500/10"
          value={athlete.sleepHours}
          label={t("dashboard", "sleepRecovery")}
          delta={`${athlete.sleepEfficiency}%`}
          chart={
            <BarChart data={ctx.sleepWeek}>
              <Bar dataKey="sleep" fill={rechartsTheme.sleep} radius={[2, 2, 0, 0]} />
            </BarChart>
          }
        />
        <MetricCard
          icon={TrendingUp}
          tone="text-accent-400 ring-accent-500/30 bg-accent-500/10"
          value={String(athlete.vo2max)}
          label={t("dashboard", "monthlyTrend")}
          delta="+1.2"
          chart={
            <AreaChart data={ctx.monthlyTrend}>
              <Area
                type="monotone"
                dataKey="kpi"
                stroke={rechartsTheme.trend}
                fill={rechartsTheme.trend}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          }
        />
      </section>

      <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Flame, label: t("hub", "sessionsMonth"), value: "18", trend: "+3" },
          { icon: Timer, label: t("hub", "hoursTrained"), value: "23.4h", trend: "+5h" },
          {
            icon: Goal,
            label: t("hub", "prStreak"),
            value: `${athlete.streakWeeks} wks`,
            trend: t("hub", "personalBest")
          },
          {
            icon: TrendingUp,
            label: t("hub", "goalCompletion"),
            value: `${athlete.goalProgress}%`,
            trend: athlete.goalTitle
          }
        ].map((s) => (
          <BentoCard key={s.label} elevation="1">
            <div className="flex items-center justify-between">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-eos-surface-container ring-1 ring-eos-outline text-eos-iris-soft sm:h-10 sm:w-10">
                <s.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <span className="text-[10px] font-semibold text-eos-performance sm:text-xs">
                {s.trend}
              </span>
            </div>
            <p className="mt-3 font-display text-2xl font-bold tabular-nums sm:text-3xl">
              {s.value}
            </p>
            <p className="line-clamp-2 text-[10px] text-eos-on-surface-muted sm:text-xs">
              {s.label}
            </p>
          </BentoCard>
        ))}
      </section>

      {plan && (
        <CoachPlanPanel
          plan={plan}
          onToggleBlock={(blockId) => ctx.togglePlanBlock(plan.id, blockId)}
        />
      )}

      <section className="grid gap-6 lg:grid-cols-3">
        <BentoCard
          elevation="1"
          className="lg:col-span-2"
          label={t("dashboard", "weeklyVolume")}
          headerAction={<EliteChip as="span" tone="telemetry">{t("hub", "wearableSync")}</EliteChip>}
        >
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ctx.weeklyVolume}>
                <CartesianGrid stroke={rechartsTheme.gridBorder} vertical={false} />
                <XAxis dataKey="d" stroke={rechartsTheme.axis} fontSize={12} />
                <YAxis stroke={rechartsTheme.axis} fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="load" radius={[8, 8, 0, 0]} fill={rechartsTheme.load} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </BentoCard>

        <BentoCard elevation="1" label={t("dashboard", "habits")}>
          <div className="space-y-2">
            {habits.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => ctx.toggleHabit(h.id)}
                className="flex min-h-[48px] w-full items-center justify-between rounded-xl border border-eos-outline px-3 py-3 text-left hover:border-eos-iris/30"
              >
                <span
                  className={`text-sm ${h.done ? "text-eos-on-surface-muted line-through" : "text-ink-100"}`}
                >
                  {h.name}
                </span>
                <span className="text-xs tabular-nums text-eos-performance">{h.streak}d</span>
              </button>
            ))}
          </div>
        </BentoCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-2" id="messages">
        <BentoCard elevation="1" label={t("dashboard", "upcoming")}>
          <div className="space-y-3">
            {sessions.map((s) => {
              const c = getTrainerById(s.coachId);
              return (
                <div
                  key={s.id}
                  className="flex flex-col gap-3 rounded-2xl border border-eos-outline p-4 sm:flex-row sm:items-center"
                >
                  {c && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.avatar}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-eos-outline"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink-100">{s.type}</p>
                    <p className="text-xs text-eos-on-surface-muted">
                      {s.when} · {s.mode} · {s.intensity}
                    </p>
                  </div>
                  <EliteChip as="span" tone="neutral" className="w-fit">
                    {s.mode}
                  </EliteChip>
                </div>
              );
            })}
          </div>
        </BentoCard>

        <BentoCard elevation="1" label={t("dashboard", "messages")}>
          <div className="space-y-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`rounded-xl border p-3 ${
                  m.unread
                    ? "border-eos-iris/40 bg-eos-iris-glow/10"
                    : "border-eos-outline"
                }`}
              >
                <p className="mb-1 text-xs text-eos-on-surface-muted">
                  {m.from === "coach" ? coach?.name : athlete.name} · {m.when}
                </p>
                <p className="line-clamp-2 text-sm text-ink-200">{m.preview}</p>
              </div>
            ))}
          </div>
        </BentoCard>
      </section>
    </>
  );

  return wrapShell ? (
    <DashboardShell assistant={<AIAssistant />}>{body}</DashboardShell>
  ) : (
    <>
      {body}
      <AIAssistant />
    </>
  );
}

function MetricCard({
  icon: Icon,
  tone,
  value,
  label,
  delta,
  chart
}: {
  icon: typeof HeartPulse;
  tone: string;
  value: string;
  label: string;
  delta: string;
  chart: ReactElement;
}) {
  return (
    <BentoCard elevation="1">
      <div className="flex items-center justify-between">
        <div className={`grid h-10 w-10 place-items-center rounded-xl ring-1 ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="flex items-center gap-0.5 text-xs font-semibold text-eos-performance">
          <ArrowUpRight className="h-3 w-3" /> {delta}
        </span>
      </div>
      <p className="mt-4 font-display text-2xl font-bold tabular-nums sm:text-3xl">{value}</p>
      <p className="text-xs text-eos-on-surface-muted">{label}</p>
      <div className="mt-3 h-6">
        <ResponsiveContainer width="100%" height="100%">
          {chart}
        </ResponsiveContainer>
      </div>
    </BentoCard>
  );
}
