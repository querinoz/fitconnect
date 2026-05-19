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
import { DesktopSidebar } from "./desktop-sidebar";
import { StatCard } from "./stat-card";
import { AlertCards, PayoutSummary } from "./coach-alerts";
import { EarningsChart } from "./earnings-chart";
import { PlanBuilderPreview } from "./plan-builder-preview";
import { AthletesListPanel } from "./athletes-list-panel";

const COACH_NAV = [
  { icon: Home, label: "Overview", href: "/coach/dashboard" },
  { icon: Users, label: "Athletes", href: "/coach/roster" },
  { icon: FileText, label: "Sessions", href: "/coach/sessions" },
  { icon: DollarSign, label: "Earnings", href: "/coach/earnings" },
  { icon: Settings, label: "Settings", href: "/coach/profile" }
];

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
  coachTitle = "Cycling specialist",
  coachAvatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  netPayout = "€4,089",
  attentionCount = 1,
  demoSection
}: CoachOsDashboardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const firstName = coachName.split(" ")[0] ?? coachName;

  return (
    <div className="flex min-h-0 lg:-mx-5">
      <DesktopSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        nav={COACH_NAV}
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
                <p className="text-[10px] text-ink-500">{coachTitle}</p>
              </div>
            </div>
            <div className="mt-3 rounded-lg border border-lime-500/20 bg-lime-500/8 px-3 py-2">
              <p className="text-[10px] font-semibold text-lime-400">This month</p>
              <p className="font-display text-base font-bold text-lime-400">
                {netPayout}{" "}
                <span className="text-xs text-lime-400/60">take-home</span>
              </p>
            </div>
          </>
        }
      />

      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl p-5 md:p-8">
          <header className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="mb-1.5 text-xs text-ink-500">Welcome back 👋</p>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-ink-50 md:text-3xl">
                  Coach Command Center
                </h1>
                <Shield className="h-5 w-5 text-brand-400" />
              </div>
              <p className="mt-1 text-sm text-ink-500">
                <span className="font-medium text-signal-500">{attentionCount} athlete</span> needs
                your attention today.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-500/20 bg-lime-500/10 px-3 py-1.5 text-xs font-semibold text-lime-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-400" /> Live
              </span>
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="gap-1.5 border-ink-700 text-xs text-ink-400 hover:text-ink-200"
              >
                <Bell className="h-3.5 w-3.5" />
              </Button>
            </div>
          </header>

          <AlertCards />

          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={Users} label="Active Athletes" value="34" change="+3" color="text-brand-400" />
            <StatCard icon={DollarSign} label="MRR" value="€4,810" change="+6.4%" color="text-lime-400" />
            <StatCard icon={BarChart3} label="Sessions this month" value="69" change="+4" color="text-plasma-500" />
            <StatCard icon={TrendingUp} label="Retention rate" value="94%" change="+2%" color="text-brand-400" />
          </div>

          {demoSection}

          <div className="grid gap-5 xl:grid-cols-3">
            <div className="space-y-5 xl:col-span-2">
              <EarningsChart />
              <PlanBuilderPreview athleteName={`${firstName}'s athlete`} />
            </div>
            <div className="space-y-5">
              <AthletesListPanel coachId={coachId} />
              <PayoutSummary />
              <Button asChild variant="outline" size="sm" className="w-full border-ink-700">
                <Link href="/coach/earnings">Earnings & Stripe Connect</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
