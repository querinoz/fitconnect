import { GlassCard } from "@/components/ui-glass/glass-card";
import { Pill } from "@/components/ui-glass/pill";
import { ReadinessRing } from "@/components/ui-glass/readiness-ring";

export function ReadinessCard({
  percent,
  hrv,
  hrvDelta,
  sleepHours,
  coachName,
  intent
}: {
  percent: number;
  hrv: number;
  hrvDelta: number;
  sleepHours: string;
  coachName: string;
  intent: string;
}) {
  const sign = hrvDelta > 0 ? "+" : "";
  return (
    <GlassCard tone="active" className="flex items-center gap-5">
      <ReadinessRing percent={percent} label="Readiness" size={108} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <Pill>Today</Pill>
          <span className="text-xs text-ink-400">From {coachName}</span>
        </div>
        <p className="text-lg font-semibold leading-tight">{intent}</p>
        <div className="flex gap-4 mt-3 text-xs text-ink-300">
          <span>
            HRV{" "}
            <span className="text-ink-100 font-semibold">{hrv}</span>{" "}
            <span className="text-volt-500">
              {sign}
              {hrvDelta}
            </span>
          </span>
          <span>
            Sleep{" "}
            <span className="text-ink-100 font-semibold">{sleepHours}</span>
          </span>
        </div>
      </div>
    </GlassCard>
  );
}
