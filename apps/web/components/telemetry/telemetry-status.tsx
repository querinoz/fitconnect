"use client";

import { cn } from "@/lib/utils";
import {
  surfaceLabel,
  type TelemetrySurfaceState
} from "@/lib/telemetry/states";

const TONE: Record<TelemetrySurfaceState, string> = {
  loading: "border-eos-outline text-eos-on-surface-subtle",
  ready: "border-eos-performance/40 text-eos-performance",
  empty: "border-eos-outline text-eos-on-surface-muted",
  missing: "border-eos-recovery/40 text-eos-recovery",
  unavailable: "border-eos-outline text-eos-on-surface-muted",
  not_connected: "border-eos-telemetry/40 text-eos-telemetry",
  error: "border-eos-alert/40 text-eos-alert"
};

type TelemetryStatusProps = {
  state: TelemetrySurfaceState;
  className?: string;
  "data-testid"?: string;
};

/**
 * Compact Zenith status chip for telemetry honesty.
 * Pattern reference: 21st status/badge catalogue — implemented natively (no runtime 21st dep).
 */
export function TelemetryStatus({
  state,
  className,
  "data-testid": testId
}: TelemetryStatusProps) {
  return (
    <span
      data-testid={testId ?? "telemetry-status"}
      data-state={state}
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em]",
        TONE[state],
        className
      )}
    >
      {surfaceLabel(state)}
    </span>
  );
}
