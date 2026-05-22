import type { LucideIcon } from "lucide-react";
import { BentoCard } from "@/components/elite-os/bento-card";
import { LabelCaps, MetricDisplay } from "@/components/elite-os/typography";
import { cn } from "@/lib/utils";

export function EliteStatTile({
  icon: Icon,
  label,
  value,
  change,
  tone = "telemetry"
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  change?: string;
  tone?: "telemetry" | "volt" | "performance" | "iris";
}) {
  const delta = change ? Number.parseFloat(change) : null;
  const toneClass = {
    telemetry: "text-eos-telemetry",
    volt: "text-eos-voltline",
    performance: "text-eos-performance",
    iris: "text-eos-iris-soft"
  }[tone];

  return (
    <BentoCard padding="md" interactive className="fc-kpi-card">
      <div className="mb-2 flex items-center gap-2">
        <Icon className={cn("h-3.5 w-3.5", toneClass)} aria-hidden />
        <LabelCaps className="opacity-70">{label}</LabelCaps>
      </div>
      <div className="flex items-baseline gap-2">
        <MetricDisplay value={value} />
        {change ? (
          <span
            className={cn(
              "text-[10px] font-semibold tabular-nums",
              delta !== null && delta >= 0 ? "text-eos-performance" : "text-eos-alert"
            )}
          >
            {delta !== null && delta >= 0 ? "▲ " : delta !== null ? "▼ " : ""}
            {change}
          </span>
        ) : null}
      </div>
    </BentoCard>
  );
}
