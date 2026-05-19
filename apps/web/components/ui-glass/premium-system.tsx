import type { HTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Activity, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "brand" | "volt" | "plasma" | "signal";

const toneClass: Record<Tone, string> = {
  neutral: "border-glass-border bg-glass-md",
  brand: "border-brand-400/25 bg-brand-500/8 shadow-[0_18px_48px_-28px_rgba(34,211,238,.75)]",
  volt: "border-volt-500/25 bg-volt-500/8 shadow-[0_18px_48px_-28px_var(--volt-glow)]",
  plasma:
    "border-plasma-500/25 bg-plasma-500/8 shadow-[0_18px_48px_-28px_rgba(168,85,247,.75)]",
  signal:
    "border-signal-500/25 bg-signal-500/8 shadow-[0_18px_48px_-28px_rgba(244,63,94,.75)]"
};

export type PremiumCardProps = HTMLAttributes<HTMLDivElement> & {
  tone?: Tone;
  interactive?: boolean;
};

export function PremiumCard({
  tone = "neutral",
  interactive = false,
  className,
  ...rest
}: PremiumCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border p-5 backdrop-blur-glass fc-liquid-glass",
        "shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_24px_80px_-48px_rgba(0,0,0,.9)]",
        "before:pointer-events-none before:absolute before:inset-x-4 before:top-0 before:z-[1] before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
        toneClass[tone],
        interactive && "fc-liquid-interactive cursor-pointer",
        interactive &&
          "transition duration-300 ease-soft hover:-translate-y-0.5 hover:border-volt-500/35 hover:bg-glass-hi",
        className
      )}
      {...rest}
    />
  );
}

export function SectionHeader({
  eyebrow,
  title,
  body,
  action,
  className,
  titleId,
  as
}: {
  eyebrow?: string;
  title: ReactNode;
  body?: ReactNode;
  action?: ReactNode;
  className?: string;
  titleId?: string;
  as?: "h1" | "h2";
}) {
  const TitleTag = as ?? "h2";
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-volt-400">
            {eyebrow}
          </p>
        ) : null}
        <TitleTag
          id={titleId}
          className="mt-2 font-display text-2xl font-bold leading-tight text-ink-50 md:text-3xl lg:text-4xl"
        >
          {title}
        </TitleTag>
        {body ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-400">
            {body}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function MetricTile({
  label,
  value,
  delta,
  icon: Icon = Activity,
  tone = "neutral",
  className
}: {
  label: string;
  value: ReactNode;
  delta?: ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
  className?: string;
}) {
  return (
    <PremiumCard tone={tone} className={cn("p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-500">
            {label}
          </p>
          <p className="mt-2 font-display text-2xl font-bold tabular-nums text-ink-50">
            {value}
          </p>
        </div>
        <span className="grid h-9 w-9 place-items-center rounded-2xl border border-glass-border bg-ink-950/60 text-volt-400">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      </div>
      {delta ? (
        <p className="mt-3 text-xs font-semibold text-volt-400">{delta}</p>
      ) : null}
    </PremiumCard>
  );
}

export function RealtimeBadge({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-2 rounded-full border border-volt-500/30 bg-volt-500/10 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-volt-300",
        className
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inset-0 animate-ping rounded-full bg-volt-400 opacity-60" />
        <span className="relative h-1.5 w-1.5 rounded-full bg-volt-400" />
      </span>
      {children}
    </span>
  );
}

export function ChartShell({
  title,
  subtitle,
  children,
  className
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <PremiumCard className={cn("p-4", className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-base font-bold text-ink-50">{title}</p>
          {subtitle ? (
            <p className="mt-1 text-xs text-ink-500">{subtitle}</p>
          ) : null}
        </div>
        <RealtimeBadge className="hidden sm:inline-flex">Synced</RealtimeBadge>
      </div>
      {children}
    </PremiumCard>
  );
}

export function AIInsight({
  title,
  body,
  action,
  className
}: {
  title: ReactNode;
  body: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <PremiumCard tone="plasma" className={cn("p-4", className)}>
      <div className="flex gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-plasma-500/15 text-plasma-300 ring-1 ring-plasma-500/25">
          <Sparkles className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink-50">{title}</p>
          <p className="mt-1 text-xs leading-5 text-ink-400">{body}</p>
          {action ? <div className="mt-3">{action}</div> : null}
        </div>
      </div>
    </PremiumCard>
  );
}
