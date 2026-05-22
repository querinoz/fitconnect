import type { LucideIcon } from "lucide-react";
import { EliteStatTile } from "@/components/dashboard/elite/elite-stat-tile";

const COLOR_TONE: Record<string, "telemetry" | "volt" | "performance" | "iris"> = {
  "text-brand-400": "iris",
  "text-lime-400": "performance",
  "text-plasma-500": "telemetry",
  "text-volt-400": "volt"
};

/** KPI tile — Elite OS bento cell (Stitch command center metrics). */
export function StatCard({
  icon,
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
    <EliteStatTile
      icon={icon}
      label={label}
      value={value}
      change={change}
      tone={COLOR_TONE[color] ?? "telemetry"}
    />
  );
}
