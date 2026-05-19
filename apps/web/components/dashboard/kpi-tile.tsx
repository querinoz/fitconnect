import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type KpiTileProps = {
  icon: LucideIcon;
  iconClassName?: string;
  label: string;
  value: string;
  delta: string;
  className?: string;
};

/** Compact KPI tile used in landing previews and inline dashboard rows. */
export function KpiTile({
  icon: Icon,
  iconClassName = "text-brand-300",
  label,
  value,
  delta,
  className
}: KpiTileProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-ink-800 bg-ink-950/60 p-3",
        className
      )}
    >
      <div
        className={cn(
          "grid h-8 w-8 place-items-center rounded-lg bg-ink-900",
          iconClassName
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <p className="mt-3 text-[10px] uppercase tracking-widest text-ink-500">
        {label}
      </p>
      <p className="font-display text-xl font-bold tabular-nums text-ink-50">
        {value}
      </p>
      <p className="text-[11px] text-accent-400">{delta}</p>
    </div>
  );
}
