import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  change,
  color
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  change?: string;
  color: string;
}) {
  const delta = change ? Number.parseFloat(change) : null;

  return (
    <div className="fc-kpi-card rounded-[10px] border border-[var(--border-xs)] bg-carbon-2 p-4">
      <div className="mb-1.5 flex items-center gap-1.5">
        <Icon className={`h-3.5 w-3.5 ${color}`} />
        <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-ink-400">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-[26px] font-extrabold leading-none tracking-[-0.04em] text-ink-50">
          {value}
        </span>
        {change ? (
          <span
            className={`text-[10px] font-semibold ${
              delta !== null && delta >= 0 ? "text-emerald-500" : "text-signal-500"
            }`}
          >
            {delta !== null && delta >= 0 ? "▲ " : delta !== null ? "▼ " : ""}
            {change}
          </span>
        ) : null}
      </div>
    </div>
  );
}
