import type { Nudge } from "@/lib/realtime/types";
import { GlassCard } from "@/components/ui-glass/glass-card";

const COPY: Record<Nudge["variant"], string> = {
  "slow-down": "Slow down",
  push: "Push it!",
  "great-work": "Great work"
};

export function NudgeToast({
  variant,
  coachName
}: {
  variant: Nudge["variant"];
  coachName: string;
}) {
  return (
    <GlassCard tone="live" className="flex items-center gap-3">
      <span className="h-2.5 w-2.5 rounded-full bg-volt-500 animate-pulse" />
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-volt-500">
          {coachName}
        </p>
        <p className="font-semibold">{COPY[variant]}</p>
      </div>
    </GlassCard>
  );
}
