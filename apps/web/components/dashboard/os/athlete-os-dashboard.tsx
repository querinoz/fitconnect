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
import { DesktopSidebar } from "./desktop-sidebar";
import { ReadinessCardFull } from "./readiness-card-full";
import { HrvChartFull } from "./hrv-chart-full";
import { SessionsPanel } from "./sessions-panel";
import { AiInsightsPanel } from "./ai-insights-panel";
import { IntegrationsHub } from "@/components/dashboard/integrations-hub";
import type { SessionSummary } from "@fitconnect/types";
import type { ReactNode } from "react";

const ATHLETE_NAV = [
  { icon: Home, label: "Overview", href: "/dashboard" },
  { icon: Activity, label: "My Coach", href: "/my-coach" },
  { icon: BookOpen, label: "Programs", href: "/programs" },
  { icon: Users, label: "Community", href: "/community" },
  { icon: Settings, label: "Settings", href: "/profile" }
];

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
};

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
  liveSection
}: AthleteOsDashboardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const firstName = name.split(" ")[0] ?? name;
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const hrvDiff = hrv - baselineHrv;

  return (
    <div className="flex min-h-0 lg:-mx-5">
      <DesktopSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        nav={ATHLETE_NAV}
        profileSlot={
          <>
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-ink-800 text-sm font-bold text-ink-400">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink-100">{name}</p>
                <p className="text-[10px] text-ink-500">Athlete · {tier}</p>
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
          <div className="rounded-xl border border-brand-400/25 bg-brand-400/6 p-3">
            <p className="mb-1 text-xs font-bold text-brand-400">Upgrade to Athlete</p>
            <p className="mb-2.5 text-[10px] text-ink-500">
              HRV tracking, AI insights, full dashboard.
            </p>
            <Button
              size="sm"
              className="w-full rounded-lg bg-gradient-to-r from-brand-500 to-lime-500 text-xs font-semibold text-ink-950"
            >
              Start — €12/mo
            </Button>
          </div>
        }
      />

      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl p-5 md:p-8">
          <header className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="mb-1.5 text-xs text-ink-500">Good morning 👋</p>
              <h1 className="font-display text-2xl font-bold text-ink-50 md:text-3xl">
                {firstName}&apos;s Athlete OS
              </h1>
              <p className="mt-1 text-sm text-ink-500">
                HRV is {hrvDiff >= 0 ? "up" : "down"} {Math.abs(hrvDiff)}ms vs baseline.{" "}
                <span className="font-medium text-lime-400">
                  {readiness >= 75 ? "Train hard today." : "Train smart today."}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="gap-1.5 border-ink-700 text-xs text-ink-400 hover:text-ink-200"
              >
                <Link href="/settings/wearables">
                  <Watch className="h-3.5 w-3.5" /> Wearables
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
              <Button
                asChild
                size="sm"
                className="gap-1.5 bg-gradient-to-r from-brand-500 to-lime-500 text-xs font-semibold text-ink-950"
              >
                <Link href="/discover">Find a coach</Link>
              </Button>
            </div>
          </header>

          <div className="grid gap-5 xl:grid-cols-3">
            <div className="space-y-5 xl:col-span-2">
              <ReadinessCardFull
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
              <AiInsightsPanel />
              <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-5">
                <h3 className="mb-4 font-display text-sm font-bold text-ink-100">Quick actions</h3>
                <div className="space-y-2.5">
                  <Button
                    asChild
                    className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-lime-500 text-sm font-semibold text-ink-950 hover:opacity-90"
                  >
                    <Link href="/discover">Find a specialist</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full rounded-xl border-ink-700 text-sm text-ink-300 hover:text-ink-100"
                  >
                    <Link href="/programs">Browse programs</Link>
                  </Button>
                </div>
              </div>
              <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-display text-sm font-bold text-ink-100">Profile</h3>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-ink-500 hover:text-ink-300"
                  >
                    <Link href="/profile">Edit</Link>
                  </Button>
                </div>
                <div className="space-y-2.5 text-sm">
                  {[
                    { k: "Sports", v: sports.join(", ") },
                    { k: "90-day goal", v: goalTitle ?? "—" },
                    { k: "Wearable", v: "Apple Watch Ultra" },
                    { k: "Plan", v: tier }
                  ].map((item) => (
                    <div key={item.k} className="flex items-center justify-between">
                      <span className="text-xs text-ink-500">{item.k}</span>
                      <span className="text-xs font-medium text-ink-200">{item.v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <IntegrationsHub athleteId={athleteId} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
