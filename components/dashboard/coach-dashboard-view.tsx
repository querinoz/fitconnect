"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Calendar,
  ChevronRight,
  HeartHandshake,
  HeartPulse,
  Sparkles,
  TrendingUp,
  Users,
  Wallet
} from "lucide-react";
import { DashboardShell } from "./dashboard-shell";
import { DashboardHeader } from "./dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n-provider";
import { useCoachContext } from "@/lib/use-dashboard-context";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
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

export function CoachDashboardView({ wrapShell = true }: { wrapShell?: boolean }) {
  const t = useT();
  const ctx = useCoachContext();
  const { metrics, roster } = ctx;

  const body = (
    <>
      <DashboardHeader
        icon={HeartHandshake}
        eyebrow={t("coachDashboard", "eyebrow")}
        title={t("coachDashboard", "welcome")}
        subtitle={t("coachDashboard", "streak")}
        actions={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline" className="min-h-[44px] w-full sm:w-auto">
              <Calendar className="h-4 w-4" /> {t("coachDashboard", "schedule")}
            </Button>
            <Button className="min-h-[44px] w-full sm:w-auto" asChild>
              <a href="#roster">{t("coachDashboard", "viewRoster")}</a>
            </Button>
          </div>
        }
      />

      <section className="rounded-3xl border border-brand-500/30 bg-gradient-to-r from-brand-500/10 via-transparent to-plasma-500/10 p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-4">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/30 shrink-0">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-ink-100">{t("coachDashboard", "aiAlert")}</p>
          <p className="mt-1 text-sm text-ink-300 leading-relaxed">
            {t("coachDashboard", "aiAlertBody")}
          </p>
        </div>
        <Button size="sm" variant="outline" className="shrink-0 min-h-[44px] w-full sm:w-auto">
          {t("coachDashboard", "reviewPlans")}{" "}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </section>

      <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <CoachKpi
          icon={Users}
          tone="text-plasma-400 ring-plasma-500/30 bg-plasma-500/10"
          value={String(metrics.activeAthletes)}
          label={t("coachDashboard", "activeAthletes")}
          delta="+6"
        />
        <CoachKpi
          icon={Wallet}
          tone="text-accent-400 ring-accent-500/30 bg-accent-500/10"
          value={metrics.revenueMtd}
          label={t("coachDashboard", "revenueMtd")}
          delta="+18%"
        />
        <CoachKpi
          icon={Calendar}
          tone="text-brand-300 ring-brand-500/30 bg-brand-500/10"
          value={String(metrics.sessionsWeek)}
          label={t("coachDashboard", "sessionsWeek")}
          delta="+9"
        />
        <CoachKpi
          icon={TrendingUp}
          tone="text-signal-400 ring-signal-500/30 bg-signal-500/10"
          value={`${metrics.retention}%`}
          label={t("coachDashboard", "retention")}
          delta="90-day"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex justify-between flex-wrap gap-2">
              {t("coachDashboard", "weeklyRevenue")}
              <Badge className="bg-brand-500/10 text-brand-300 ring-brand-500/30">
                Stripe · live
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ctx.revenueWeekly}>
                  <CartesianGrid stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="d" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="rev" radius={[8, 8, 0, 0]} fill="#a855f7" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("coachDashboard", "retention")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ctx.retentionTrend}>
                  <defs>
                    <linearGradient id="coachRet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="m" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" domain={[85, 100]} fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#22d3ee"
                    fill="url(#coachRet)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3" id="roster">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HeartPulse className="h-4 w-4 text-signal-400" />
              {t("coachDashboard", "athleteRoster")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {roster.map((a) => (
              <Link
                key={a.id}
                href={`/coach/athletes/${a.id}`}
                className="flex items-center justify-between rounded-xl border border-ink-800 bg-ink-950/40 p-3 min-h-[52px] hover:border-brand-400/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.avatar}
                    alt=""
                    className="h-9 w-9 rounded-full ring-2 ring-ink-800 object-cover"
                  />
                  <span className="text-sm font-medium text-ink-100 truncate">
                    {a.name}
                  </span>
                </div>
                <span className="flex items-center gap-2 text-xs tabular-nums text-ink-400 shrink-0">
                  {a.hrv} ms
                  <span
                    className={`h-2 w-2 rounded-full ${
                      a.recoveryStatus === "green"
                        ? "bg-accent-400"
                        : a.recoveryStatus === "amber"
                          ? "bg-amber-400"
                          : "bg-signal-500"
                    }`}
                  />
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t("coachDashboard", "upcomingSessions")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ctx.sessions.map((s) => {
              const athlete = roster.find((r) => r.id === s.athleteId);
              return (
                <div
                  key={s.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-ink-800 bg-ink-950/40 p-4"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-500/10 text-brand-300 font-semibold text-sm shrink-0">
                    {athlete?.name.slice(0, 2) ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink-100">{s.type}</p>
                    <p className="text-xs text-ink-400">
                      {athlete?.name} · {s.when} · {s.mode}
                    </p>
                  </div>
                  <Button size="sm" className="w-full sm:w-auto min-h-[44px]" asChild>
                    <Link href={`/coach/athletes/${s.athleteId}`}>
                      {t("hub", "monitor")}
                    </Link>
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("coachDashboard", "clientMessages")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {ctx.messages.map((m) => {
            const athlete = roster.find((r) => r.id === m.athleteId);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => ctx.markMessageRead(m.id)}
                className={`w-full text-left rounded-xl border p-3 min-h-[52px] ${
                  m.unread
                    ? "border-brand-400/40 bg-brand-500/5"
                    : "border-ink-800 bg-ink-950/40"
                }`}
              >
                <p className="text-xs text-ink-500">
                  {athlete?.name} · {m.when}
                </p>
                <p className="text-sm text-ink-200 line-clamp-2 mt-1">{m.preview}</p>
              </button>
            );
          })}
        </CardContent>
      </Card>
    </>
  );

  return wrapShell ? <DashboardShell>{body}</DashboardShell> : body;
}

function CoachKpi({
  icon: Icon,
  tone,
  value,
  label,
  delta
}: {
  icon: typeof Users;
  tone: string;
  value: string;
  label: string;
  delta: string;
}) {
  return (
    <Card>
      <CardContent className="pt-4 sm:pt-6">
        <div className="flex items-center justify-between">
          <div className={`grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl ring-1 ${tone}`}>
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <span className="text-[10px] sm:text-xs text-accent-400 flex items-center gap-0.5 font-semibold">
            <ArrowUpRight className="h-3 w-3" /> {delta}
          </span>
        </div>
        <p className="mt-3 sm:mt-4 text-2xl sm:text-3xl font-bold font-display tabular-nums">
          {value}
        </p>
        <p className="text-[10px] sm:text-xs text-ink-400">{label}</p>
      </CardContent>
    </Card>
  );
}
