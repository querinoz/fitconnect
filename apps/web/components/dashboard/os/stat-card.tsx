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
  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-5">
      <div className="mb-3 flex items-center gap-1.5">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-xs font-medium text-ink-500">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-2xl font-bold text-ink-100">{value}</span>
        {change ? (
          <span
            className={`text-xs font-semibold ${
              parseFloat(change) >= 0 ? "text-lime-400" : "text-signal-500"
            }`}
          >
            {parseFloat(change) >= 0 ? "+" : ""}
            {change}
          </span>
        ) : null}
      </div>
    </div>
  );
}
