"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  Brain,
  Calendar,
  HeartPulse,
  LayoutDashboard,
  MessageSquare,
  Users,
  Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n-provider";
import { cn } from "@/lib/utils";
import { MetricTile, PremiumCard, RealtimeBadge, SectionHeader } from "@/components/ui-glass/premium-system";

const NAV = [
  { icon: LayoutDashboard, label: "Command", active: true },
  { icon: Users, label: "Athletes" },
  { icon: Calendar, label: "Sessions" },
  { icon: Brain, label: "AI Coach" },
  { icon: Wallet, label: "Earnings" }
];

const INSIGHTS = [
  { label: "Team HRV", value: "68 ms", delta: "+4 vs 7d" },
  { label: "At-risk", value: "3", delta: "Needs check-in" },
  { label: "Sessions today", value: "12", delta: "2 live now" }
];

export function CoachCockpitPreview() {
  const cl = useLocale().coachLanding;

  return (
    <main id="main">
      <section className="fc-marketing-hero fc-marketing-container pb-8">
        <SectionHeader
          as="h1"
          eyebrow="Coach OS"
          title={
            <>
              {cl.title}{" "}
              <span className="gradient-text">{cl.titleAccent}</span>
            </>
          }
          body={cl.subtitle}
          action={<RealtimeBadge>Live cockpit</RealtimeBadge>}
        />

        <div className="mt-8 grid min-h-[520px] gap-4 lg:grid-cols-[220px_1fr_280px]">
          {/* Left rail */}
          <PremiumCard className="hidden flex-col gap-1 p-3 lg:flex">
            {NAV.map(({ icon: Icon, label, active }) => (
              <button
                key={label}
                type="button"
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition",
                  active
                    ? "bg-volt-500/12 text-volt-300 ring-1 ring-volt-500/25"
                    : "text-ink-400 hover:bg-glass-md hover:text-ink-200"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            ))}
          </PremiumCard>

          {/* Center workspace */}
          <PremiumCard tone="neutral" className="flex flex-col gap-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-display text-lg font-bold">Performance telemetry</p>
              <span className="text-xs text-ink-500">Apr 18 · Live</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <MetricTile label="Active athletes" value="47" tone="brand" icon={Users} />
              <MetricTile label="Retention" value="91%" tone="volt" icon={Activity} />
              <MetricTile label="Revenue MTD" value="€4.2k" icon={BarChart3} />
            </div>
            <div className="fc-radius-card flex-1 border border-glass-border bg-ink-950/40 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-500">
                Session load · 7 days
              </p>
              <div className="mt-4 flex h-32 items-end gap-2">
                {[42, 58, 51, 72, 65, 80, 74].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-lg bg-gradient-to-t from-volt-600 to-volt-400 opacity-80"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {["Sarah M. — readiness 82", "Tomás R. — HRV dip", "Inês K. — streak 14d"].map(
                (row) => (
                  <div
                    key={row}
                    className="flex items-center justify-between rounded-2xl border border-glass-border bg-glass-md px-4 py-3 text-sm"
                  >
                    <span className="text-ink-200">{row}</span>
                    <MessageSquare className="h-4 w-4 text-ink-500" />
                  </div>
                )
              )}
            </div>
          </PremiumCard>

          {/* Right intelligence sidebar */}
          <PremiumCard tone="brand" className="flex flex-col gap-4 p-5">
            <p className="font-display text-sm font-bold">Intelligence</p>
            {INSIGHTS.map((item) => (
              <div key={item.label} className="rounded-2xl border border-glass-border bg-ink-950/30 p-3">
                <p className="text-[10px] uppercase tracking-widest text-ink-500">{item.label}</p>
                <p className="mt-1 font-display text-xl font-bold text-ink-50">{item.value}</p>
                <p className="text-xs text-volt-400">{item.delta}</p>
              </div>
            ))}
            <div className="rounded-2xl border border-connect-500/25 bg-connect-500/8 p-4">
              <div className="flex items-center gap-2 text-connect-500">
                <HeartPulse className="h-4 w-4" />
                <p className="text-xs font-bold uppercase tracking-widest">AI recovery alert</p>
              </div>
              <p className="mt-2 text-sm text-ink-300">
                3 athletes show strain spikes — suggest deload or mobility session.
              </p>
            </div>
            <div className="mt-auto space-y-2">
              <p className="flex items-center gap-2 text-xs text-ink-500">
                <Bell className="h-3.5 w-3.5" /> 2 unread notifications
              </p>
            </div>
          </PremiumCard>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/dashboard?as=trainer">
              {cl.applyCta} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="#earnings">{cl.seeEarnings}</Link>
          </Button>
        </div>
      </section>

      <section id="earnings" className="fc-marketing-container fc-marketing-section">
        <CoachLandingSections />
      </section>
    </main>
  );
}

/** Condensed perks + earnings from coach landing */
function CoachLandingSections() {
  const cl = useLocale().coachLanding;
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {cl.perks.slice(0, 3).map((p) => (
        <PremiumCard key={p.title} className="p-6">
          <h3 className="font-display font-semibold text-lg">{p.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-400">{p.body}</p>
        </PremiumCard>
      ))}
    </div>
  );
}
