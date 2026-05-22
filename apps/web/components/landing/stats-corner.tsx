import { cn } from "@/lib/utils";

type StatCornerProps = {
  value: string;
  label: string;
  className?: string;
};

export function StatsCorner({ value, label, className }: StatCornerProps) {
  return (
    <div className={cn("hero-stat pointer-events-none select-none", className)}>
      <p className="font-display text-2xl font-bold leading-none text-ink-50 sm:text-3xl md:text-4xl">
        {value}
      </p>
      <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.28em] text-ink-400 sm:text-[10px]">
        {label}
      </p>
    </div>
  );
}
