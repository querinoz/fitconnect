"use client";

import Link from "next/link";
import { ChevronRight, Moon, PlayCircle, TrendingUp, Zap } from "lucide-react";
import { ReadinessRing } from "@/components/ui-glass/readiness-ring";
import { BentoCard } from "@/components/elite-os/bento-card";
import { LabelCaps } from "@/components/elite-os/typography";
import { VoltButton } from "@/components/ui-glass/volt-button";
import { formatMsg, useLocale } from "@/lib/i18n-provider";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type TodayPlanBlock = {
  day: string;
  title: string;
  detail: string;
  intensity?: string;
};

type ReadinessHeroSectionProps = {
  name: string;
  greeting: string;
  readiness: number;
  hrv: number;
  baselineHrv: number;
  sleepHours: string;
  sports: string[];
  coachName: string;
  streakWeeks?: number;
  todayPlan?: TodayPlanBlock;
  actions?: ReactNode;
  className?: string;
};

export function ReadinessHeroSection({
  name,
  greeting,
  readiness,
  hrv,
  baselineHrv,
  sleepHours,
  sports,
  coachName,
  streakWeeks = 5,
  todayPlan,
  actions,
  className
}: ReadinessHeroSectionProps) {
  const { dashboard } = useLocale();
  const os = dashboard.os;
  const copy = dashboard.readiness_ring;
  const firstName = name.split(" ")[0] ?? name;
  const hrvDiff = hrv - baselineHrv;
  const band =
    readiness >= 75
      ? dashboard.readinessGreen
      : readiness >= 50
        ? os.trainSmart
        : dashboard.sleepRecovery;

  return (
    <BentoCard
      elevation="glass"
      padding="lg"
      className={cn(
        "fc-readiness-hero relative mb-6 overflow-hidden lg:min-h-[min(42dvh,420px)]",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,rgba(200,255,0,0.12),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(57,255,20,0.08),transparent_70%)]"
      />

      <div className="relative flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(240px,2fr)_3fr] lg:items-center lg:gap-10">
        {/* Ring column — ~40% on desktop */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <p className="text-xs text-ink-500">{greeting}</p>
          <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-ink-50 sm:text-3xl">
            {formatMsg(os.titleSuffix, { name: firstName })}
          </h1>
          <p className="mt-2 max-w-sm text-sm text-ink-400">
            {formatMsg(hrvDiff >= 0 ? os.hrvTrendUp : os.hrvTrendDown, {
              delta: Math.abs(hrvDiff)
            })}
          </p>

          <div className="relative mt-6 flex justify-center lg:justify-start">
            <div
              aria-hidden
              className="absolute inset-0 m-auto h-[min(40vw,200px)] w-[min(40vw,200px)] max-h-[200px] max-w-[200px] rounded-full bg-[conic-gradient(from_0deg,var(--volt-500),var(--lime-500),var(--volt-500))] opacity-25 motion-safe:animate-spin [animation-duration:12s]"
            />
            <ReadinessRing
              percent={readiness}
              label={copy.title}
              size={168}
              hero
              className="relative motion-safe:animate-[pulse_4s_ease-in-out_infinite] shadow-[0_0_60px_rgba(200,255,0,0.15)]"
              data-testid="readiness-hero-ring"
            />
          </div>

          <p className="mt-4 font-display text-lg font-bold text-volt-400">{band}</p>
          {sports.length > 0 ? (
            <div className="mt-3 flex flex-wrap justify-center gap-1.5 lg:justify-start">
              {sports.slice(0, 4).map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-brand-400/20 bg-brand-400/10 px-2.5 py-0.5 text-[10px] font-medium text-brand-300"
                >
                  {s.toLowerCase()}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {/* Metrics + today plan — ~60% */}
        <div className="flex min-w-0 flex-col gap-5">
          {actions ? (
            <div className="flex flex-wrap items-center justify-end gap-2">{actions}</div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-3">
            <MetricTile
              icon={TrendingUp}
              label={dashboard.hrvLabel}
              value={`${hrv} ms`}
              delta={hrvDiff >= 0 ? `+${hrvDiff}` : `${hrvDiff}`}
              positive={hrvDiff >= 0}
            />
            <MetricTile icon={Moon} label={dashboard.sleepRecovery} value={sleepHours} />
            <MetricTile
              icon={Zap}
              label={dashboard.pr_tracker.title}
              value={formatMsg(dashboard.pr_tracker.streak, { weeks: streakWeeks })}
            />
          </div>

          <div className="rounded-2xl border border-ink-800/80 bg-ink-950/50 p-4 sm:p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-500">
              {dashboard.todayPlan.title}
            </p>
            {todayPlan ? (
              <>
                <p className="mt-2 text-xs font-semibold text-volt-400">{todayPlan.day}</p>
                <h2 className="mt-1 font-display text-xl font-bold text-ink-50 sm:text-2xl">
                  {todayPlan.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-400">{todayPlan.detail}</p>
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
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <VoltButton asChild className="flex-1 rounded-xl text-sm">
                <Link href="/sessions">
                  <PlayCircle className="mr-2 h-4 w-4" />
                  {dashboard.todayPlan.startSession}
                </Link>
              </VoltButton>
              <Link
                href="/settings/wearables"
                className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-ink-700 px-4 py-2.5 text-sm font-medium text-ink-300 transition hover:border-volt-500/40 hover:text-volt-400"
              >
                {copy.viewDetails}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </BentoCard>
  );
}

function MetricTile({
  icon: Icon,
  label,
  value,
  delta,
  positive
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-[var(--eos-radius-nested)] border border-eos-outline bg-eos-floor/40 px-3 py-3 sm:px-4">
      <div className="flex items-center gap-2 text-eos-on-surface-subtle">
        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <LabelCaps className="opacity-80">{label}</LabelCaps>
      </div>
      <p className="eos-data-metric mt-2 text-xl sm:text-2xl">{value}</p>
      {delta ? (
        <p
          className={cn(
            "mt-1 text-xs font-medium tabular-nums",
            positive ? "text-eos-voltline" : "text-eos-alert"
          )}
        >
          {delta} ms
        </p>
      ) : null}
    </div>
  );
}
