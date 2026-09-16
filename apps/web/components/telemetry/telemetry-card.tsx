"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { BentoCard } from "@/components/elite-os/bento-card";
import { TelemetryMetric } from "@/components/telemetry/telemetry-metric";
import { TelemetryStatus } from "@/components/telemetry/telemetry-status";
import { eliteFadeUp, muteEliteMotion } from "@/lib/motion/elite-motion";
import type { TelemetryDatum } from "@/lib/telemetry/states";
import { cn } from "@/lib/utils";

type TelemetryCardProps = {
  datum: TelemetryDatum;
  href?: string;
  className?: string;
  "data-testid"?: string;
};

/**
 * Honest telemetry card — value only when state === ready.
 * Structure inspired by 21st metric/dashboard cards; Zenith tokens + real data binding.
 */
export function TelemetryCard({
  datum,
  href,
  className,
  "data-testid": testId
}: TelemetryCardProps) {
  const reduced = useReducedMotion();
  const enter = muteEliteMotion(eliteFadeUp, reduced);

  const body = (
    <motion.div
      initial={enter.initial}
      animate={enter.animate}
      transition={enter.transition}
      className="space-y-3"
      data-testid={testId ?? "telemetry-card"}
      data-state={datum.state}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-eos-on-surface-subtle">
          {datum.label}
        </p>
        <TelemetryStatus state={datum.state} />
      </div>

      {datum.state === "ready" && datum.value != null ? (
        <div
          className="flex justify-start"
          aria-label={`${datum.label} ${datum.value}${datum.unit && datum.unit !== "score" ? ` ${datum.unit}` : ""}`}
        >
          <TelemetryMetric
            value={datum.value}
            unit={datum.unit === "score" ? undefined : datum.unit}
            label={undefined}
            className="items-start"
            data-testid={`${testId ?? "telemetry-card"}-value`}
          />
        </div>
      ) : datum.state === "loading" ? (
        <p className="font-display text-3xl text-eos-on-surface-muted" role="status" aria-live="polite">
          …
        </p>
      ) : (
        <div className="space-y-1">
          <p className="font-display text-3xl tracking-tight text-eos-on-surface-muted">—</p>
          {datum.detail ? (
            <p className="text-xs text-eos-on-surface-muted">{datum.detail}</p>
          ) : null}
          {href ? (
            <Link
              href={href}
              className="inline-block text-xs font-semibold text-eos-telemetry underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eos-voltline/60"
            >
              Connect devices
            </Link>
          ) : null}
        </div>
      )}

      {datum.source && datum.state === "ready" ? (
        <p className="text-[10px] uppercase tracking-wider text-eos-on-surface-subtle">
          Source: {datum.source}
        </p>
      ) : null}
    </motion.div>
  );

  return (
    <BentoCard elevation="1" className={cn("min-w-0", className)} label={undefined}>
      {body}
    </BentoCard>
  );
}
