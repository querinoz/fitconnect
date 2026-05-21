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
import { formatMsg, useT } from "@/lib/i18n-provider";

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
    <div className="fc-dashboard-os flex min-h-0 min-w-0 w-full">
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
                  <p className="truncate text-sm font-semibold text-ink-100">{coachName}</p>
                  <Shield className="h-3 w-3 shrink-0 text-brand-400" />
                </div>
                <p className="text-[10px] text-ink-500">{resolvedTitle}</p>
              </div>
            </div>
            <NivisPanel className="mt-3 p-3">
              <p className="text-[10px] font-semibold text-lime-400">
                {t("coachDashboard", "thisMonth")}
              </p>
              <p className="font-display text-base font-bold text-lime-400">
                {netPayout}{" "}
                <span className="text-xs text-lime-400/60">
                  {t("coachDashboard", "takeHome")}
                </span>
              </p>
            </NivisPanel>
          </>
        }
      />

      <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
        <div className="fc-dashboard-inner mx-auto max-w-6xl p-4 sm:p-5 md:p-8">
          <header className="mb-6 flex flex-col items-start justify-between gap-4 sm:mb-8 sm:flex-row sm:items-center">
            <div>
              <p className="mb-1.5 text-xs text-ink-500">{t("coachDashboard", "welcomeBack")}</p>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-ink-50 md:text-3xl">
                  {t("coachDashboard", "commandCenterTitle")}
                </h1>
                <Shield className="h-5 w-5 text-brand-400" />
              </div>
              <p className="mt-1 text-sm text-ink-500">
                {formatMsg(t("coachDashboard", "attentionToday"), { count: attentionCount })}
              </p>
            </div>
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-500/20 bg-lime-500/10 px-3 py-1.5 text-xs font-semibold text-lime-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-400" />{" "}
                {t("coachDashboard", "live")}
              </span>
              <VoltButton asChild className="h-9 gap-1.5 text-xs">
                <Link href="/coach/roster">{t("coachDashboard", "viewRoster")}</Link>
              </VoltButton>
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="gap-1.5 border-ink-700 text-xs text-ink-400 hover:text-ink-200"
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
              change="+6.4%"
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
              change="+2%"
              color="text-brand-400"
            />
          </div>

          {demoSection}

          <div className="mb-5 grid gap-5 xl:grid-cols-2">
            <CoachRosterMap athleteCount={34} />
            <ProgramBuilderPanel />
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            <div className="space-y-5 xl:col-span-2">
              <CoachStravaFeed coachId={coachId} />
              <EarningsChart />
              <PlanBuilderPreview
                athleteName={formatMsg(t("coachDashboard", "athletePlanLabel"), {
                  name: firstName
                })}
              />
            </div>
            <div className="space-y-5">
              <GamificationPanel variant="coach" />
              <AthletesListPanel coachId={coachId} />
              <PayoutSummary />
              <Button asChild variant="outline" size="sm" className="w-full border-ink-700">
                <Link href="/coach/earnings">{t("coachDashboard", "earningsStripeConnect")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
