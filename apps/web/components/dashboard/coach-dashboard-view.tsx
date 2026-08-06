"use client";

import Link from "next/link";
import {
  Calendar,
  ChevronRight,
  TrendingUp,
  Users,
  Wallet
} from "lucide-react";
import { DashboardShell } from "./dashboard-shell";
import { AiInsightCard, BentoCard, BentoGrid, EliteButton, EliteChip } from "@/components/elite-os";
import { EliteStatTile } from "@/components/dashboard/elite";
import { EliteAppPageHeader } from "@/components/shell/elite";
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
import { rechartsTheme } from "@/lib/charts/recharts-theme";

const tooltipStyle = {
  background: rechartsTheme.tooltipBg,
  border: `1px solid ${rechartsTheme.tooltipBorder}`,
  borderRadius: "12px"
};

export function CoachDashboardView({ wrapShell = true }: { wrapShell?: boolean }) {
  const t = useT();
  const ctx = useCoachContext();
  const { metrics, roster } = ctx;

  const body = (
    <>
      <EliteAppPageHeader
        eyebrow={t("coachDashboard", "eyebrow")}
        title={t("coachDashboard", "welcome")}
        subtitle={t("coachDashboard", "streak")}
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <EliteButton variant="secondary" className="min-h-[44px] w-full sm:w-auto">
              <Calendar className="h-4 w-4" /> {t("coachDashboard", "schedule")}
            </EliteButton>
            <EliteButton variant="primary" className="min-h-[44px] w-full sm:w-auto" asChild>
              <a href="#roster">{t("coachDashboard", "viewRoster")}</a>
            </EliteButton>
          </div>
        }
      />

      <AiInsightCard
        title={t("coachDashboard", "aiAlert")}
        body={t("coachDashboard", "aiAlertBody")}
        action={
          <EliteButton size="sm" variant="secondary" className="min-h-[44px]">
            {t("coachDashboard", "reviewPlans")} <ChevronRight className="h-4 w-4" />
          </EliteButton>
        }
      />

      <BentoGrid cols={4}>
        <EliteStatTile
          icon={Users}
          label={t("coachDashboard", "activeAthletes")}
          value={String(metrics.activeAthletes)}
          change="6"
          tone="iris"
        />
        <EliteStatTile
          icon={Wallet}
          label={t("coachDashboard", "revenueMtd")}
          value={metrics.revenueMtd}
          change="18"
          tone="volt"
        />
        <EliteStatTile
          icon={Calendar}
          label={t("coachDashboard", "sessionsWeek")}
          value={String(metrics.sessionsWeek)}
          change="9"
        />
        <EliteStatTile
          icon={TrendingUp}
          label={t("coachDashboard", "retention")}
          value={`${metrics.retention}%`}
          tone="performance"
        />
      </BentoGrid>

      <section className="grid gap-6 lg:grid-cols-3">
        <BentoCard
          elevation="1"
          className="lg:col-span-2"
          label={t("coachDashboard", "weeklyRevenue")}
          headerAction={
            <EliteChip as="span" tone="iris">
              Stripe · live
            </EliteChip>
          }
        >
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ctx.revenueWeekly}>
                <CartesianGrid stroke={rechartsTheme.gridBorder} vertical={false} />
                <XAxis dataKey="d" stroke={rechartsTheme.axis} fontSize={12} />
                <YAxis stroke={rechartsTheme.axis} fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="rev" radius={[8, 8, 0, 0]} fill={rechartsTheme.revenue} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </BentoCard>
        <BentoCard elevation="1" label={t("coachDashboard", "retention")}>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ctx.retentionTrend}>
                <defs>
                  <linearGradient id="coachRet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={rechartsTheme.retention} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={rechartsTheme.retention} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={rechartsTheme.gridBorder} vertical={false} />
                <XAxis dataKey="m" stroke={rechartsTheme.axis} fontSize={12} />
                <YAxis stroke={rechartsTheme.axis} domain={[85, 100]} fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke={rechartsTheme.retention}
                  fill="url(#coachRet)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </BentoCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-3" id="roster">
        <BentoCard elevation="1" label={t("coachDashboard", "athleteRoster")}>
          <div className="space-y-2">
            {roster.map((a) => (
              <Link
                key={a.id}
                href={`/coach/athletes/${a.id}`}
                className="flex min-h-[52px] items-center justify-between rounded-xl border border-eos-outline p-3 transition-colors hover:border-eos-iris/40"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.avatar}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-eos-outline"
                  />
                  <span className="truncate text-sm font-medium text-ink-100">
                    {a.name}
                  </span>
                </div>
                <span className="flex shrink-0 items-center gap-2 text-xs tabular-nums text-eos-on-surface-muted">
                  {a.hrv} ms
                  <span
                    className={`h-2 w-2 rounded-full ${
                      a.recoveryStatus === "green"
                        ? "bg-eos-performance"
                        : a.recoveryStatus === "amber"
                          ? "bg-amber-400"
                          : "bg-eos-alert"
                    }`}
                  />
                </span>
              </Link>
            ))}
          </div>
        </BentoCard>

        <BentoCard elevation="1" className="lg:col-span-2" label={t("coachDashboard", "upcomingSessions")}>
          <div className="space-y-3">
            {ctx.sessions.map((s) => {
              const athlete = roster.find((r) => r.id === s.athleteId);
              return (
                <div
                  key={s.id}
                  className="flex flex-col gap-3 rounded-2xl border border-eos-outline p-4 sm:flex-row sm:items-center"
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-eos-iris-glow/20 text-sm font-semibold text-eos-iris-soft">
                    {athlete?.name.slice(0, 2) ?? "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink-100">{s.type}</p>
                    <p className="text-xs text-eos-on-surface-muted">
                      {athlete?.name} · {s.when} · {s.mode}
                    </p>
                  </div>
                  <EliteButton size="sm" className="min-h-[44px] w-full sm:w-auto" asChild>
                    <Link href={`/coach/athletes/${s.athleteId}`}>
                      {t("hub", "monitor")}
                    </Link>
                  </EliteButton>
                </div>
              );
            })}
          </div>
        </BentoCard>
      </section>

      <BentoCard elevation="1" label={t("coachDashboard", "clientMessages")}>
        <div className="space-y-2">
          {ctx.messages.map((m) => {
            const athlete = roster.find((r) => r.id === m.athleteId);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => ctx.markMessageRead(m.id)}
                className={`min-h-[52px] w-full rounded-xl border p-3 text-left ${
                  m.unread
                    ? "border-eos-iris/40 bg-eos-iris-glow/10"
                    : "border-eos-outline"
                }`}
              >
                <p className="text-xs text-eos-on-surface-muted">
                  {athlete?.name} · {m.when}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-ink-200">{m.preview}</p>
              </button>
            );
          })}
        </div>
      </BentoCard>
    </>
  );

  return wrapShell ? <DashboardShell>{body}</DashboardShell> : body;
}
