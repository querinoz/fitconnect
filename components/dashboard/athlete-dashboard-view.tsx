"use client";

import Link from "next/link";
import type { ReactElement } from "react";
import { getTrainerById } from "@/lib/dashboard/seed";
import {
  Activity,
  ArrowUpRight,
  Calendar,
  ChevronRight,
  Flame,
  Goal,
  HeartPulse,
  MessageSquare,
  Moon,
  PlayCircle,
  Sparkles,
  Timer,
  TrendingUp
} from "lucide-react";
import { DashboardShell } from "./dashboard-shell";
import { ReadinessCard } from "./readiness-card";
import { CoachPlanPanel } from "./coach-plan-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const tooltipStyle = {
  background: "#0f172a",
  border: "1px solid #1e293b",
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
      <header className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end justify-between gap-4">
        <div>
          <p className="eyebrow inline-flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5" aria-hidden />
            {t("dashboard", "eyebrow")}
          </p>
          <h1 className="fc-vt-hero mt-2 font-display text-2xl sm:text-3xl md:text-4xl font-bold">
            {t("dashboard", "welcome")}
          </h1>
          <p className="text-ink-400 text-sm sm:text-base">{t("dashboard", "streak")}</p>
        </div>
        <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto min-h-[44px]">
            <Calendar className="h-4 w-4" /> {t("dashboard", "schedule")}
          </Button>
          <Button className="w-full sm:w-auto min-h-[44px]">
            <PlayCircle className="h-4 w-4" /> {t("dashboard", "startSession")}
          </Button>
        </div>
      </header>

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

      <section className="rounded-3xl border border-plasma-500/30 bg-gradient-to-r from-plasma-500/10 via-transparent to-brand-500/10 p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-4">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-plasma-500/15 text-plasma-400 ring-1 ring-plasma-500/30 shrink-0">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-ink-100">{t("dashboard", "aiSuggestion")}</p>
            {plan && (
              <span className="rounded-full bg-plasma-500/15 text-plasma-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                {plan.approvedLabel}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-ink-300 leading-relaxed">
            {plan?.aiSuggestion ?? t("dashboard", "wearableSyncHint")}
          </p>
        </div>
        <Button size="sm" variant="outline" className="shrink-0 w-full sm:w-auto min-h-[44px]" asChild>
          <a href="#coach-plan">{t("dashboard", "applyPlan")}</a>
        </Button>
      </section>

      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <ReadinessCard score={athlete.readiness} />
          </CardContent>
        </Card>
        <MetricCard
          icon={HeartPulse}
          tone="text-signal-400 ring-signal-500/30 bg-signal-500/10"
          value={`${athlete.hrv} ms`}
          label={t("dashboard", "hrvLabel")}
          delta="+4"
          chart={
            <LineChart data={ctx.sleepWeek}>
              <Line type="monotone" dataKey="hrv" stroke="#f43f5e" strokeWidth={2} dot={false} />
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
              <Bar dataKey="sleep" fill="#22d3ee" radius={[2, 2, 0, 0]} />
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
                stroke="#84cc16"
                fill="#84cc16"
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
          <Card key={s.label}>
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl bg-ink-950 ring-1 ring-ink-800 text-brand-300">
                  <s.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <span className="text-[10px] sm:text-xs text-accent-400 font-semibold">
                  {s.trend}
                </span>
              </div>
              <p className="mt-3 text-2xl sm:text-3xl font-bold font-display tabular-nums">
                {s.value}
              </p>
              <p className="text-[10px] sm:text-xs text-ink-400 line-clamp-2">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {plan && (
        <CoachPlanPanel
          plan={plan}
          onToggleBlock={(blockId) => ctx.togglePlanBlock(plan.id, blockId)}
        />
      )}

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex flex-wrap gap-2 justify-between">
              {t("dashboard", "weeklyVolume")}
              <Badge>{t("hub", "wearableSync")}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ctx.weeklyVolume}>
                  <CartesianGrid stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="d" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="load" radius={[8, 8, 0, 0]} fill="#22d3ee" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("dashboard", "habits")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {habits.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => ctx.toggleHabit(h.id)}
                className="w-full flex items-center justify-between rounded-xl border border-ink-800 bg-ink-950/40 px-3 py-3 min-h-[48px] hover:border-brand-400/30 text-left"
              >
                <span
                  className={`text-sm ${h.done ? "text-ink-400 line-through" : "text-ink-100"}`}
                >
                  {h.name}
                </span>
                <span className="text-xs text-accent-400 tabular-nums">{h.streak}d</span>
              </button>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2" id="messages">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4 text-brand-300" />
              {t("dashboard", "upcoming")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessions.map((s) => {
              const c = getTrainerById(s.coachId);
              return (
                <div
                  key={s.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-ink-800 bg-ink-950/40 p-4"
                >
                  {c && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.avatar}
                      alt=""
                      className="h-10 w-10 rounded-full ring-2 ring-ink-950 object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink-100">{s.type}</p>
                    <p className="text-xs text-ink-400">
                      {s.when} · {s.mode} · {s.intensity}
                    </p>
                  </div>
                  <Badge className="w-fit">{s.mode}</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4 text-plasma-400" />
              {t("dashboard", "messages")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`rounded-xl border p-3 ${
                  m.unread
                    ? "border-brand-400/40 bg-brand-500/5"
                    : "border-ink-800 bg-ink-950/40"
                }`}
              >
                <p className="text-xs text-ink-500 mb-1">
                  {m.from === "coach" ? coach?.name : athlete.name} · {m.when}
                </p>
                <p className="text-sm text-ink-200 line-clamp-2">{m.preview}</p>
              </div>
            ))}
          </CardContent>
        </Card>
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
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className={`grid h-10 w-10 place-items-center rounded-xl ring-1 ${tone}`}>
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-xs text-accent-400 flex items-center gap-0.5 font-semibold">
            <ArrowUpRight className="h-3 w-3" /> {delta}
          </span>
        </div>
        <p className="mt-4 text-2xl sm:text-3xl font-bold font-display tabular-nums">{value}</p>
        <p className="text-xs text-ink-400">{label}</p>
        <div className="mt-3 h-6">
          <ResponsiveContainer width="100%" height="100%">
            {chart}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
