"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  Bell,
  BookOpen,
  Home,
  Settings,
  Users,
  Watch
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BentoCard } from "@/components/elite-os";
import { EliteButton } from "@/components/elite-os/elite-button";
import { LabelCaps } from "@/components/elite-os/typography";
import { VoltButton } from "@/components/ui-glass/volt-button";
import { DesktopSidebar } from "./desktop-sidebar";
import { ReadinessCardWithExplain } from "@/components/dashboard/readiness-explain-modal";
import { HrvChartFull } from "./hrv-chart-full";
import { SessionsPanel } from "./sessions-panel";
import { AiInsightsPanel } from "./ai-insights-panel";
import { IntegrationsHub } from "@/components/dashboard/integrations-hub";
import { GamificationPanel } from "@/components/gamification/gamification-panel";
import { ReadinessHeroSection } from "./readiness-hero-section";
import { MapWidget } from "./map-widget";
import { ActivityFeedLive } from "./activity-feed-live";
import {
  EliteBentoMotion,
  EliteBentoMotionItem
} from "@/components/dashboard/elite";
import { formatMsg, useLocale } from "@/lib/i18n-provider";
import { useInEliteShell } from "@/lib/hooks/use-in-elite-shell";
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
  onBookSession?: () => void;
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
  streakWeeks = 5,
  onBookSession
}: AthleteOsDashboardProps) {
  const { dashboard, hub } = useLocale();
  const os = dashboard.os;
  const inAppShell = useInEliteShell();
  const [collapsed, setCollapsed] = useState(false);
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const greeting = os[greetingKey()];

  const athleteNav: { icon: LucideIcon; label: string; href: string }[] = [
    { icon: Home, label: os.navOverview, href: "/dashboard" },
    { icon: Activity, label: os.navMyCoach, href: "/my-coach" },
    { icon: BookOpen, label: os.navPrograms, href: "/programs" },
    { icon: Users, label: os.navCommunity, href: "/community" },
    { icon: Settings, label: os.navSettings, href: "/profile" }
  ];

  return (
    <div className="fc-dashboard-os eos-athlete-cockpit flex min-h-0 min-w-0 w-full">
      {!inAppShell ? (
        <DesktopSidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          nav={athleteNav}
          profileSlot={
            <>
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-eos-carbon text-sm font-bold text-eos-on-surface-muted">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-eos-on-surface">{name}</p>
                  <p className="text-[10px] text-eos-on-surface-subtle">
                    {formatMsg(os.athleteRole, { tier })}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {sports.slice(0, 3).map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-eos-telemetry/20 bg-eos-telemetry-dim px-2 py-0.5 text-[9px] text-eos-telemetry"
                  >
                    {s.toLowerCase()}
                  </span>
                ))}
              </div>
            </>
          }
          footerSlot={
            <NivisPanel className="p-3">
              <p className="mb-1 text-xs font-bold text-eos-iris-soft">{os.upgradeTitle}</p>
              <p className="mb-2.5 text-[10px] text-eos-on-surface-subtle">{os.upgradeBody}</p>
              <VoltButton className="h-9 w-full rounded-lg text-xs">{os.upgradeCta}</VoltButton>
            </NivisPanel>
          }
        />
      ) : null}

      <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
        <div className="fc-dashboard-inner mx-auto max-w-[88rem] p-4 sm:p-5 md:p-8">
          <EliteBentoMotion className="grid grid-cols-1 gap-eos-bento md:grid-cols-12">
            <EliteBentoMotionItem className="md:col-span-12 xl:col-span-8">
              <ReadinessHeroSection
                name={name}
                greeting={greeting}
                readiness={readiness}
                hrv={hrv}
                baselineHrv={baselineHrv}
                sleepHours={sleepHours}
                sports={sports}
                coachName={coachName}
                streakWeeks={streakWeeks}
                todayPlan={todayPlan}
                actions={
                  <>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="gap-1.5 border-eos-outline text-xs text-eos-on-surface-muted hover:text-eos-on-surface"
                    >
                      <Link href="/settings/wearables">
                        <Watch className="h-3.5 w-3.5" /> {os.wearables}
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      className="border-eos-outline text-xs text-eos-on-surface-muted hover:text-eos-on-surface"
                    >
                      <Bell className="h-3.5 w-3.5" />
                    </Button>
                    <EliteButton asChild size="sm">
                      <Link href="/discover">{os.findCoach}</Link>
                    </EliteButton>
                  </>
                }
              />
            </EliteBentoMotionItem>

            <EliteBentoMotionItem className="flex flex-col gap-eos-bento md:col-span-12 xl:col-span-4">
              <BentoCard padding="md" label={dashboard.strava_sync.title}>
                <p className="text-sm font-medium text-eos-on-surface">
                  {dashboard.strava_sync.synced} · {hub.strava_sync.label}
                </p>
              </BentoCard>
              <BentoCard padding="md" label={dashboard.pr_tracker.title}>
                <p className="eos-data-metric text-eos-voltline">
                  {formatMsg(dashboard.pr_tracker.streak, { weeks: streakWeeks })}
                </p>
              </BentoCard>
            </EliteBentoMotionItem>

            <EliteBentoMotionItem id="map-widget" className="md:col-span-12 lg:col-span-6">
              <MapWidget />
            </EliteBentoMotionItem>
            <EliteBentoMotionItem className="md:col-span-12 lg:col-span-6">
              <ActivityFeedLive />
            </EliteBentoMotionItem>

            <EliteBentoMotionItem className="space-y-eos-bento md:col-span-12 xl:col-span-8">
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
                onBookSession={onBookSession}
              />
              {liveSection}
            </EliteBentoMotionItem>

            <EliteBentoMotionItem className="space-y-eos-bento md:col-span-12 xl:col-span-4">
              <GamificationPanel />
              <AiInsightsPanel />
              <BentoCard padding="md" label={os.quickActions}>
                <div className="space-y-2.5">
                  <EliteButton asChild className="w-full" size="sm">
                    <Link href="/discover">{os.findSpecialist}</Link>
                  </EliteButton>
                  <EliteButton asChild variant="secondary" className="w-full" size="sm">
                    <Link href="/programs">{os.browsePrograms}</Link>
                  </EliteButton>
                </div>
              </BentoCard>
              <BentoCard
                padding="md"
                label={os.profile}
                headerAction={
                  <Link
                    href="/profile"
                    className="text-xs text-eos-on-surface-subtle hover:text-eos-on-surface"
                  >
                    {os.edit}
                  </Link>
                }
              >
                <div className="space-y-2.5 text-sm">
                  {[
                    { k: os.sports, v: sports.join(", ") },
                    { k: os.goal90, v: goalTitle ?? "—" },
                    { k: os.wearable, v: hub.wearableSync },
                    { k: os.plan, v: tier }
                  ].map((item) => (
                    <div key={item.k} className="flex items-center justify-between gap-3">
                      <LabelCaps className="opacity-60">{item.k}</LabelCaps>
                      <span className="text-xs font-medium text-eos-on-surface-muted">
                        {item.v}
                      </span>
                    </div>
                  ))}
                </div>
              </BentoCard>
              <IntegrationsHub athleteId={athleteId} />
            </EliteBentoMotionItem>
          </EliteBentoMotion>
        </div>
      </div>
    </div>
  );
}
