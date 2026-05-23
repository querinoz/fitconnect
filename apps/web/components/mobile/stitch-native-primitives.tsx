"use client";

import { Activity, BedDouble, Heart, Radio, Sparkles, TrendingUp, Zap } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Carbon bento cell — matches Stitch `athlete_cockpit_mobile_native`. */
export function StitchBentoCard({
  className,
  span = 1,
  children
}: {
  className?: string;
  span?: 1 | 2;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "stitch-bento-card relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#111827] p-5",
        span === 2 && "col-span-2",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(200,255,0,0.03)_0%,transparent_50%),radial-gradient(circle_at_100%_100%,rgba(108,99,255,0.03)_0%,transparent_50%)]"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function StitchLabelCaps({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400/80">
      {children}
    </span>
  );
}

export function StitchPrimeRing({
  score,
  label,
  sublabel
}: {
  score: number;
  label: string;
  sublabel: string;
}) {
  const r = 46;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);

  return (
    <section className="relative flex flex-col items-center py-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(192,245,0,0.05),transparent_70%)] blur-2xl"
      />
      <div className="relative z-10 flex items-center justify-center">
        <div className="stitch-prime-ring-glow relative flex h-64 w-64 items-center justify-center rounded-full border border-white/[0.08] bg-[rgba(21,27,45,0.4)] backdrop-blur-xl">
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="transparent"
              stroke="rgba(53,52,62,1)"
              strokeWidth="4"
            />
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="transparent"
              stroke="#c0f500"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ filter: "drop-shadow(0 0 8px rgba(200, 255, 0, 0.6))" }}
            />
          </svg>
          <div className="flex flex-col items-center text-center">
            <span className="font-mono text-[3.5rem] font-bold leading-none tracking-tighter text-white">
              {score}
              <span className="text-2xl text-ink-400">%</span>
            </span>
            <span className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#c0f500]">
              {label}
            </span>
          </div>
        </div>
      </div>
      <div className="relative z-10 mt-6 text-center">
        <h2 className="font-display text-xl font-bold text-white">{sublabel}</h2>
      </div>
    </section>
  );
}

export function StitchNativeHeader({
  initials,
  avatarUrl,
  onSensorsClick
}: {
  initials: string;
  avatarUrl?: string;
  onSensorsClick?: () => void;
}) {
  return (
    <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-white/[0.05] bg-[#13121b]/60 px-6 py-4 backdrop-blur-xl">
      <div className="flex w-10 items-center justify-start">
        <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/10">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#2a2933] font-mono text-[10px] font-bold text-[#c0f500]">
              {initials}
            </div>
          )}
        </div>
      </div>
      <div className="font-display text-base font-bold tracking-tighter text-ink-50">FITCONNECT</div>
      <button
        type="button"
        aria-label="Wearable sync"
        onClick={onSensorsClick}
        className="flex h-10 w-10 items-center justify-center rounded-full text-ink-400 transition hover:bg-white/5"
      >
        <Radio className="h-5 w-5" aria-hidden />
      </button>
    </header>
  );
}

export function StitchAiFab({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      aria-label="AI Coach"
      onClick={onClick}
      className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-[#c0f500]/30 bg-[rgba(21,27,45,0.4)] shadow-2xl backdrop-blur-xl transition hover:bg-[#1f1f28]"
    >
      <span className="absolute inset-0 animate-ping rounded-full border border-[#c0f500]/50 opacity-20" />
      <Sparkles className="relative h-7 w-7 text-[#c0f500]" aria-hidden />
    </button>
  );
}

export function StitchHrvCard({
  label,
  value,
  delta
}: {
  label: string;
  value: number;
  delta: string;
}) {
  return (
    <StitchBentoCard>
      <div className="flex h-full flex-col justify-between">
        <div className="mb-4 flex items-start justify-between">
          <StitchLabelCaps>{label}</StitchLabelCaps>
          <Heart className="h-[18px] w-[18px] text-[#c0f500]" aria-hidden />
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-[2rem] font-bold text-white">{value}</span>
            <span className="font-mono text-[10px] text-ink-400">ms</span>
          </div>
          <div className="mt-2 inline-flex items-center rounded-full border border-[#c0f500]/20 bg-[#c0f500]/10 px-2 py-0.5">
            <TrendingUp className="mr-1 h-3 w-3 text-[#c0f500]" aria-hidden />
            <span className="font-mono text-[10px] text-[#c0f500]">{delta}</span>
          </div>
        </div>
      </div>
    </StitchBentoCard>
  );
}

export function StitchStrainCard({
  label,
  value,
  max = 21
}: {
  label: string;
  value: number;
  max?: number;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <StitchBentoCard>
      <div className="flex h-full flex-col justify-between">
        <div className="mb-4 flex items-start justify-between">
          <StitchLabelCaps>{label}</StitchLabelCaps>
          <Zap className="h-[18px] w-[18px] text-[#3cd7ff]" aria-hidden />
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-[2rem] font-bold text-white">{value.toFixed(1)}</span>
            <span className="font-mono text-[10px] text-ink-400">/ {max}</span>
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#1f1f28]">
            <div
              className="h-full rounded-full bg-[#3cd7ff] shadow-[0_0_8px_rgba(60,215,255,0.5)]"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </StitchBentoCard>
  );
}

export function StitchSleepCard({
  label,
  duration,
  efficiency
}: {
  label: string;
  duration: string;
  efficiency: number;
}) {
  return (
    <StitchBentoCard span={2}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <StitchLabelCaps>{label}</StitchLabelCaps>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-[1.75rem] font-bold text-white">{duration}</span>
            <span className="text-sm text-ink-400">{efficiency}% efficiency</span>
          </div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#c0f500]/30 bg-[#c0f500]/5">
          <BedDouble className="h-5 w-5 text-[#c0f500]" aria-hidden />
        </div>
      </div>
    </StitchBentoCard>
  );
}

export function StitchAiDirectiveCard({
  title,
  body,
  action,
  onAction
}: {
  title: string;
  body: string;
  action: string;
  onAction?: () => void;
}) {
  return (
    <StitchBentoCard span={2} className="border-l-4 border-l-[#c0f500]">
      <div className="flex items-center gap-2">
        <Activity className="h-3.5 w-3.5 text-[#c0f500]" aria-hidden />
        <StitchLabelCaps>{title}</StitchLabelCaps>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink-300">{body}</p>
      {onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-[#c0f500] font-mono text-xs font-bold uppercase tracking-wider text-[#161f00] transition hover:shadow-[0_0_20px_rgba(200,255,0,0.5)]"
        >
          {action}
        </button>
      ) : null}
    </StitchBentoCard>
  );
}
