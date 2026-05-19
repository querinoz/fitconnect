import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type BentoTone = "neutral" | "volt" | "connect" | "cyan" | "live";

const toneClass: Record<BentoTone, string> = {
  neutral:
    "border-[var(--border-xs)] bg-carbon-2/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
  volt: "border-volt-500/20 bg-[linear-gradient(145deg,rgba(200,255,0,0.12),rgba(12,13,17,0.95))] shadow-[0_20px_60px_-40px_var(--volt-glow)]",
  connect:
    "border-brand-400/20 bg-[linear-gradient(145deg,rgba(0,221,180,0.1),rgba(12,13,17,0.95))]",
  cyan: "border-cyan-500/20 bg-[linear-gradient(145deg,rgba(0,191,255,0.08),rgba(12,13,17,0.95))]",
  live: "border-signal-500/25 bg-[linear-gradient(145deg,rgba(255,58,92,0.1),rgba(12,13,17,0.95))]"
};

export function RiftBento({
  tone = "neutral",
  span,
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  tone?: BentoTone;
  span?: "sm" | "md" | "lg" | "full";
}) {
  const spanClass =
    span === "lg"
      ? "col-span-2 row-span-2"
      : span === "md"
        ? "col-span-2"
        : span === "full"
          ? "col-span-2 sm:col-span-4"
          : "";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.35rem] border p-4 backdrop-blur-xl",
        "before:pointer-events-none before:absolute before:inset-x-3 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent",
        toneClass[tone],
        spanClass,
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function RiftLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-ink-400">
      {children}
    </p>
  );
}

export function RiftScore({
  value,
  unit,
  className
}: {
  value: string | number | ReactNode;
  unit?: string;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-display text-[clamp(2rem,6vw,3.25rem)] font-extrabold leading-none tracking-[-0.05em] text-volt-500",
        className
      )}
      style={{ textShadow: "0 0 32px rgba(200,255,0,0.18)" }}
    >
      {value}
      {unit ? (
        <span className="ml-1 text-[0.35em] font-bold text-ink-400">{unit}</span>
      ) : null}
    </p>
  );
}
