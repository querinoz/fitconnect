"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  BarChart3,
  Bell,
  DollarSign,
  FileText,
  Home,
  Settings,
  Shield,
  TrendingUp,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EliteButton } from "@/components/elite-os/elite-button";
import { EliteChip } from "@/components/elite-os/elite-chip";
import { Headline, LabelCaps } from "@/components/elite-os/typography";
import { VoltButton } from "@/components/ui-glass/volt-button";
import { DesktopSidebar } from "./desktop-sidebar";
import { StatCard } from "./stat-card";
import { NivisPanel } from "@/components/ui-glass/nivis-panel";
import { AlertCards, PayoutSummary } from "./coach-alerts";
import { EarningsChart } from "./earnings-chart";
import { PlanBuilderPreview } from "./plan-builder-preview";
import { AthletesListPanel } from "./athletes-list-panel";
import { CoachRosterMap } from "./coach-roster-map";
import { ProgramBuilderPanel } from "./program-builder-panel";
import { GamificationPanel } from "@/components/gamification/gamification-panel";
import { CoachStravaFeed } from "@/components/dashboard/coach-strava-feed";
import { AiInsightsPanel } from "./ai-insights-panel";
import {
  EliteBentoMotion,
  EliteBentoMotionItem
} from "@/components/dashboard/elite";
import { formatMsg, useT } from "@/lib/i18n-provider";
import { useInEliteShell } from "@/lib/hooks/use-in-elite-shell";

type CoachOsDashboardProps = {
  coachId: string;
  coachName: string;
  coachTitle?: string;
  coachAvatar?: string;
  netPayout?: string;
  attentionCount?: number;
  demoSection?: React.ReactNode;
};

export function CoachOsDashboard({
  coachId,
  coachName,
  coachTitle,
  coachAvatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  netPayout = "€4,089",
  attentionCount = 1,
  demoSection
}: CoachOsDashboardProps) {
  const t = useT();
  const inAppShell = useInEliteShell();
  const [collapsed, setCollapsed] = useState(false);
  const firstName = coachName.split(" ")[0] ?? coachName;
  const resolvedTitle = coachTitle ?? t("coachDashboard", "defaultCoachTitle");

  const coachNav = [
    { icon: Home, label: t("coachDashboard", "navOverview"), href: "/coach/dashboard" },
    { icon: Users, label: t("coachDashboard", "navAthletes"), href: "/coach/roster" },
    { icon: FileText, label: t("coachDashboard", "navSessions"), href: "/coach/sessions" },
    { icon: DollarSign, label: t("coachDashboard", "navEarnings"), href: "/coach/earnings" },
    { icon: Settings, label: t("coachDashboard", "navSettings"), href: "/coach/profile" }
  ];

  return (
    <div className="fc-dashboard-os eos-coach-command flex min-h-0 min-w-0 w-full">
      {!inAppShell ? (
        <DesktopSidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          nav={coachNav}
          accent="lime"
          profileSlot={
            <>
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coachAvatar} alt="" className="h-9 w-9 rounded-xl object-cover" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-semibold text-eos-on-surface">
                      {coachName}
                    </p>
                    <Shield className="h-3 w-3 shrink-0 text-eos-performance" />
                  </div>
                  <p className="text-[10px] text-eos-on-surface-subtle">{resolvedTitle}</p>
                </div>
              </div>
              <NivisPanel className="mt-3 p-3">
                <p className="text-[10px] font-semibold text-eos-performance">
                  {t("coachDashboard", "thisMonth")}
                </p>
                <p className="font-display text-base font-bold text-eos-voltline">
                  {netPayout}{" "}
                  <span className="text-xs text-eos-voltline/60">
                    {t("coachDashboard", "takeHome")}
                  </span>
                </p>
              </NivisPanel>
            </>
          }
        />
      ) : null}

      <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
        <div className="fc-dashboard-inner mx-auto max-w-[100rem] p-4 sm:p-5 md:p-8">
          <header className="mb-6 flex flex-col items-start justify-between gap-4 sm:mb-8 sm:flex-row sm:items-center">
            <div>
              <LabelCaps className="text-eos-on-surface-subtle">
                {t("coachDashboard", "welcomeBack")}
              </LabelCaps>
              <div className="mt-1 flex items-center gap-2">
                <Headline className="text-2xl md:text-3xl">
                  {t("coachDashboard", "commandCenterTitle")}
                </Headline>
                <Shield className="h-5 w-5 text-eos-performance" />
              </div>
              <p className="mt-1 text-sm text-eos-on-surface-muted">
                {formatMsg(t("coachDashboard", "attentionToday"), { count: attentionCount })}
              </p>
            </div>
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              <EliteChip tone="performance" as="span" className="gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-eos-performance" />
                {t("coachDashboard", "live")}
              </EliteChip>
              <EliteButton asChild size="sm">
                <Link href="/coach/roster">{t("coachDashboard", "viewRoster")}</Link>
              </EliteButton>
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="gap-1.5 border-eos-outline text-xs text-eos-on-surface-muted hover:text-eos-on-surface"
                aria-label={t("coachDashboard", "notifications")}
              >
                <Bell className="h-3.5 w-3.5" />
              </Button>
            </div>
          </header>

          <AlertCards />

          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              icon={Users}
              label={t("coachDashboard", "activeAthletes")}
              value="34"
              change="+3"
              color="text-brand-400"
            />
            <StatCard
              icon={DollarSign}
              label={t("coachDashboard", "mrr")}
              value="€4,810"
              change="+6.4"
              color="text-lime-400"
            />
            <StatCard
              icon={BarChart3}
              label={t("coachDashboard", "sessionsThisMonth")}
              value="69"
              change="+4"
              color="text-plasma-500"
            />
            <StatCard
              icon={TrendingUp}
              label={t("coachDashboard", "retentionRate")}
              value="94%"
              change="+2"
              color="text-brand-400"
            />
          </div>

          {demoSection}

          <EliteBentoMotion className="grid grid-cols-1 gap-eos-bento xl:grid-cols-12">
            <EliteBentoMotionItem className="space-y-eos-bento xl:col-span-3">
              <AthletesListPanel coachId={coachId} />
              <div className="hidden xl:block">
                <CoachRosterMap athleteCount={34} />
              </div>
            </EliteBentoMotionItem>

            <EliteBentoMotionItem className="space-y-eos-bento xl:col-span-6">
              <div className="xl:hidden">
                <CoachRosterMap athleteCount={34} />
              </div>
              <ProgramBuilderPanel />
              <CoachStravaFeed coachId={coachId} />
              <EarningsChart />
              <PlanBuilderPreview
                athleteName={formatMsg(t("coachDashboard", "athletePlanLabel"), {
                  name: firstName
                })}
              />
            </EliteBentoMotionItem>

            <EliteBentoMotionItem className="space-y-eos-bento xl:col-span-3">
              <GamificationPanel variant="coach" />
              <AiInsightsPanel />
              <PayoutSummary />
              <VoltButton asChild variant="subtle" className="w-full rounded-xl text-sm">
                <Link href="/coach/earnings">{t("coachDashboard", "earningsStripeConnect")}</Link>
              </VoltButton>
            </EliteBentoMotionItem>
          </EliteBentoMotion>
        </div>
      </div>
    </div>
  );
}
