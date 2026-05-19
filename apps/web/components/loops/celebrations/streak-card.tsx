import { GlassCard } from "@/components/ui-glass/glass-card";

export function StreakCard({ days, coName }: { days: number; coName: string }) {
  return (
    <GlassCard tone="active" className="flex items-center gap-4">
      <div className="h-14 w-14 rounded-full bg-grad-pulse grid place-items-center text-ink-950 font-black text-xl">
        {days}
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-ink-400">Shared streak</p>
        <p className="font-semibold">Training with {coName}</p>
        <p className="text-sm text-ink-300">{days} consecutive days</p>
      </div>
    </GlassCard>
  );
}
