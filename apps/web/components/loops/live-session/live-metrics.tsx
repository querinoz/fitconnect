import { GlassCard } from "@/components/ui-glass/glass-card";
import { HRRibbon } from "@/components/ui-glass/hr-ribbon";

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function LiveMetrics({
  hr,
  pace,
  cadence,
  elapsedSec,
  ticks
}: {
  hr: number | null;
  pace: number | null;
  cadence: number | null;
  elapsedSec: number;
  ticks: number[];
}) {
  const missing = ticks.length === 0;
  return (
    <GlassCard tone="live" className="space-y-4">
      {missing ? (
        <p className="text-sm text-ink-400">
          Waiting for device telemetry. Heart rate, pace and cadence stay blank until a wearable
          sends them — we never invent those numbers.
        </p>
      ) : null}
      <div className="flex items-end gap-6 flex-wrap">
        <Stat label="HR" value={hr == null ? "—" : String(hr)} unit="bpm" big />
        <Stat label="Pace" value={pace == null ? "—" : pace.toFixed(1)} unit="min/km" />
        <Stat label="Cadence" value={cadence == null ? "—" : String(cadence)} unit="spm" />
        <div className="ml-auto text-right">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-400">
            Elapsed
          </p>
          <p className="text-2xl font-bold tabular-nums">{fmt(elapsedSec)}</p>
        </div>
      </div>
      <HRRibbon data={ticks.slice(-30)} />
    </GlassCard>
  );
}

function Stat({
  label,
  value,
  unit,
  big
}: {
  label: string;
  value: string;
  unit: string;
  big?: boolean;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-ink-400">{label}</p>
      <p
        data-testid={big ? "live-hr" : undefined}
        className={
          big
            ? "text-5xl font-black bg-grad-text bg-clip-text text-transparent tabular-nums"
            : "text-2xl font-bold tabular-nums"
        }
      >
        {value}
      </p>
      <p className="text-xs text-ink-400">{unit}</p>
    </div>
  );
}
