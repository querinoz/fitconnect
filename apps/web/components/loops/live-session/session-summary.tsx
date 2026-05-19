import { GlassCard } from "@/components/ui-glass/glass-card";

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function SessionSummary({
  distanceKm,
  avgHr,
  maxHr,
  durationSec
}: {
  distanceKm: number;
  avgHr: number;
  maxHr: number;
  durationSec: number;
}) {
  return (
    <GlassCard tone="active" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <Stat label="Distance" value={distanceKm.toFixed(1)} unit="km" />
      <Stat label="Avg HR" value={String(avgHr)} unit="bpm" />
      <Stat label="Max HR" value={String(maxHr)} unit="bpm" />
      <Stat label="Time" value={fmt(durationSec)} unit="" />
    </GlassCard>
  );
}

function Stat({
  label,
  value,
  unit
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-ink-400">{label}</p>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      {unit !== "" ? <p className="text-xs text-ink-400">{unit}</p> : null}
    </div>
  );
}
