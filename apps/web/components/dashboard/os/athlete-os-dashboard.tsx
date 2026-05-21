"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  Bell,
  BookOpen,
  Home,
  PlayCircle,
  Settings,
  Users,
  Watch
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoltButton } from "@/components/ui-glass/volt-button";
import { DesktopSidebar } from "./desktop-sidebar";
import { ReadinessCardWithExplain } from "@/components/dashboard/readiness-explain-modal";
import { HrvChartFull } from "./hrv-chart-full";
import { SessionsPanel } from "./sessions-panel";
import { AiInsightsPanel } from "./ai-insights-panel";
import { IntegrationsHub } from "@/components/dashboard/integrations-hub";
import { GamificationPanel } from "@/components/gamification/gamification-panel";
import { ReadinessRingWidget } from "./readiness-ring-widget";
import { MapWidget } from "./map-widget";
import { ActivityFeedLive } from "./activity-feed-live";
import { formatMsg, useLocale } from "@/lib/i18n-provider";
import type { SessionSummary } from "@fitconnect/types";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { NivisPanel } from "@/components/ui-glass/nivis-panel";

type TodayPlanBlock = {
  day: string;
  title: string;
  detail: string;
  intensity?: string;
};

type AthleteOsDashboardProps = {
  name: string;
  sports: string[];
  readiness: number;
  hrv: number;
  baselineHrv: number;
  sleepHours: string;
  hrvSeed?: number;
  sessions: SessionSummary[];
  sessionsLoading?: boolean;
  coachName: string;
  goalTitle?: string;
  tier?: string;
  athleteId: string;
  liveSection?: ReactNode;
  todayPlan?: TodayPlanBlock;
  streakWeeks?: number;
};

function greetingKey(h = new Date().getHours()) {
  if (h < 5) return "greetingLateNight" as const;
  if (h < 12) return "greetingMorning" as const;
  if (h < 18) return "greetingAfternoon" as const;
  return "greetingEvening" as const;
}

export function AthleteOsDashboard({
  name,
  sports,
  readiness,
  hrv,
  baselineHrv,
  sleepHours,
  hrvSeed = 1,
  sessions,
  sessionsLoading,
  coachName,
  goalTitle,
  tier = "Free tier",
  athleteId,
  liveSection,
  todayPlan,
  streakWeeks = 5
}: AthleteOsDashboardProps) {
  const { dashboard, hub } = useLocale();
  const os = dashboard.os;
  const [collapsed, setCollapsed] = useState(false);
  const firstName = name.split(" ")[0] ?? name;
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const hrvDiff = hrv - baselineHrv;
  const greeting = os[greetingKey()];

  const athleteNav: { icon: LucideIcon; label: string; href: string }[] = [
    { icon: Home, label: os.navOverview, href: "/dashboard" },
    { icon: Activity, label: os.navMyCoach, href: "/my-coach" },
    { icon: BookOpen, label: os.navPrograms, href: "/programs" },
    { icon: Users, label: os.navCommunity, href: "/community" },
    { icon: Settings, label: os.navSettings, href: "/profile" }
  ];

  return (
    <div className="fc-dashboard-os flex min-h-0 min-w-0 w-full">
      <DesktopSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        nav={athleteNav}
        profileSlot={
          <>
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-ink-800 text-sm font-bold text-ink-400">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink-100">{name}</p>
                <p className="text-[10px] text-ink-500">
                  {formatMsg(os.athleteRole, { tier })}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {sports.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-brand-400/20 bg-brand-400/10 px-2 py-0.5 text-[9px] text-brand-400"
                >
                  {s.toLowerCase()}
                </span>
              ))}
            </div>
          </>
        }
        footerSlot={
          <NivisPanel className="p-3">
            <p className="mb-1 text-xs font-bold text-brand-400">{os.upgradeTitle}</p>
            <p className="mb-2.5 text-[10px] text-ink-500">{os.upgradeBody}</p>
            <VoltButton className="h-9 w-full rounded-lg text-xs">{os.upgradeCta}</VoltButton>
          </NivisPanel>
        }
      />

      <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
        <div className="fc-dashboard-inner mx-auto max-w-6xl p-4 sm:p-5 md:p-8">
          <header className="mb-6 flex flex-col items-start justify-between gap-4 sm:mb-8 sm:flex-row sm:items-center">
            <div>
              <p className="mb-1.5 text-xs text-ink-500">{greeting}</p>
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-50 md:text-3xl">
                {formatMsg(os.titleSuffix, { name: firstName })}
              </h1>
              <p className="mt-1 text-sm text-ink-400">
                {formatMsg(hrvDiff >= 0 ? os.hrvTrendUp : os.hrvTrendDown, {
                  delta: Math.abs(hrvDiff)
                })}{" "}
                <span className="font-medium text-volt-500">
                  {readiness >= 75 ? os.trainHard : os.trainSmart}
                </span>
              </p>
            </div>
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="gap-1.5 border-ink-700 text-xs text-ink-400 hover:text-ink-200"
              >
                <Link href="/settings/wearables">
                  <Watch className="h-3.5 w-3.5" /> {os.wearables}
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="border-ink-700 text-xs text-ink-400 hover:text-ink-200"
              >
                <Bell className="h-3.5 w-3.5" />
              </Button>
              <VoltButton asChild className="h-9 gap-1.5 text-xs">
                <Link href="/discover">{os.findCoach}</Link>
              </VoltButton>
            </div>
          </header>

          <div className="mb-5 grid gap-5 md:grid-cols-2">
            <ReadinessRingWidget readiness={readiness} />
            <NivisPanel id="today-plan" className="flex flex-col justify-between p-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-500">
                  {dashboard.todayPlan.title}
                </p>
                {todayPlan ? (
                  <>
                    <p className="mt-2 text-xs font-semibold text-volt-400">{todayPlan.day}</p>
                    <h3 className="mt-1 font-display text-lg font-bold text-ink-50">
                      {todayPlan.title}
                    </h3>
                    <p className="mt-2 text-sm text-ink-400">{todayPlan.detail}</p>
                    {todayPlan.intensity ? (
                      <p className="mt-2 text-xs text-ink-500">{todayPlan.intensity}</p>
                    ) : null}
                    <p className="mt-3 text-xs text-ink-500">
                      {formatMsg(dashboard.todayPlan.approvedBy, { coach: coachName })}
                    </p>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-ink-500">{dashboard.todayPlan.noPlan}</p>
                )}
              </div>
              <VoltButton asChild className="mt-5 w-full rounded-xl text-sm">
                <Link href="/sessions">
                  <PlayCircle className="mr-2 h-4 w-4" />
                  {dashboard.todayPlan.startSession}
                </Link>
              </VoltButton>
            </NivisPanel>
          </div>

          <div id="map-widget" className="mb-5 grid gap-5 lg:grid-cols-2">
            <MapWidget />
            <ActivityFeedLive />
          </div>

          <div className="mb-5 grid gap-3 sm:grid-cols-2">
            <NivisPanel className="px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-500">
                {dashboard.strava_sync.title}
              </p>
              <p className="mt-1 text-sm font-medium text-ink-100">
                {dashboard.strava_sync.synced} · {hub.strava_sync.label}
              </p>
            </NivisPanel>
            <NivisPanel className="px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-500">
                {dashboard.pr_tracker.title}
              </p>
              <p className="mt-1 text-sm font-medium text-volt-400">
                {formatMsg(dashboard.pr_tracker.streak, { weeks: streakWeeks })}
              </p>
            </NivisPanel>
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            <div className="space-y-5 xl:col-span-2">
              <ReadinessCardWithExplain
                readiness={readiness}
                hrv={hrv}
                baselineHrv={baselineHrv}
                sleepHours={sleepHours}
              />
              <HrvChartFull baselineHrv={baselineHrv} seed={hrvSeed} />
              <SessionsPanel
                sessions={sessions}
                loading={sessionsLoading}
                coachName={coachName}
              />
              {liveSection}
            </div>

            <div className="space-y-5">
              <GamificationPanel />
              <AiInsightsPanel />
              <NivisPanel className="p-5">
                <h3 className="mb-4 font-display text-sm font-bold text-ink-100">
                  {os.quickActions}
                </h3>
                <div className="space-y-2.5">
                  <VoltButton asChild className="w-full rounded-xl text-sm">
                    <Link href="/discover">{os.findSpecialist}</Link>
                  </VoltButton>
                  <VoltButton asChild variant="subtle" className="w-full rounded-xl text-sm">
                    <Link href="/programs">{os.browsePrograms}</Link>
                  </VoltButton>
                </div>
              </NivisPanel>
              <NivisPanel className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-display text-sm font-bold text-ink-100">{os.profile}</h3>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-ink-500 hover:text-ink-300"
                  >
                    <Link href="/profile">{os.edit}</Link>
                  </Button>
                </div>
                <div className="space-y-2.5 text-sm">
                  {[
                    { k: os.sports, v: sports.join(", ") },
                    { k: os.goal90, v: goalTitle ?? "—" },
                    { k: os.wearable, v: hub.wearableSync },
                    { k: os.plan, v: tier }
                  ].map((item) => (
                    <div key={item.k} className="flex items-center justify-between">
                      <span className="text-xs text-ink-500">{item.k}</span>
                      <span className="text-xs font-medium text-ink-200">{item.v}</span>
                    </div>
                  ))}
                </div>
              </NivisPanel>
              <IntegrationsHub athleteId={athleteId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
