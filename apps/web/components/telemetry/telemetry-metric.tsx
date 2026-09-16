"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "motion/react";
import { MOTION_TOKENS } from "@fitconnect/design-tokens";
import { cn } from "@/lib/utils";
import { muteEliteMotion, eliteMetricLand } from "@/lib/motion/elite-motion";

type TelemetryMetricProps = {
  value: number;
  label?: string;
  unit?: string;
  /** When true, shows DEMO badge — never invent production telemetry. */
  demo?: boolean;
  className?: string;
  valueClassName?: string;
  decimals?: number;
  "data-testid"?: string;
};

function formatMetric(n: number, decimals: number): string {
  if (!Number.isFinite(n)) return "—";
  return decimals > 0 ? n.toFixed(decimals) : String(Math.round(n));
}

/**
 * Zenith telemetry metric — `metric.land` pattern.
 * Communicates: value arrival. Opacity/transform only on the wrapper;
 * number tween uses a high-damping spring (no snap overshoot curve on chrome).
 * Reduced motion / SSR / first paint: snap to final value.
 */
export function TelemetryMetric({
  value,
  label,
  unit,
  demo = false,
  className,
  valueClassName,
  decimals = 0,
  "data-testid": testId
}: TelemetryMetricProps) {
  const reduced = useReducedMotion();
  const land = muteEliteMotion(eliteMetricLand, reduced);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const animateNumber = mounted && !reduced;
  const spring = useSpring(value, {
    stiffness: MOTION_TOKENS.spring.telemetry.stiffness,
    damping: MOTION_TOKENS.spring.telemetry.damping,
    mass: MOTION_TOKENS.spring.telemetry.mass
  });

  useEffect(() => {
    if (animateNumber) spring.set(value);
  }, [animateNumber, spring, value]);

  const display = useTransform(spring, (latest) => formatMetric(Number(latest), decimals));

  const a11y = [label, formatMetric(value, decimals), unit, demo ? "demo data" : null]
    .filter(Boolean)
    .join(" ");

  const valueClasses = cn(
    "font-display tabular-nums font-extrabold leading-none tracking-[-0.06em] text-eos-voltline",
    valueClassName
  );

  return (
    <motion.div
      className={cn("inline-flex flex-col items-center", className)}
      initial={land.initial}
      animate={land.animate}
      transition={land.transition}
      aria-label={a11y}
    >
      {demo ? (
        <span className="mb-1 rounded border border-eos-outline px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-eos-on-surface-subtle">
          DEMO
        </span>
      ) : null}
      <div className="flex items-baseline gap-1">
        {animateNumber ? (
          <motion.span className={valueClasses} data-testid={testId ?? "telemetry-metric"}>
            {display}
          </motion.span>
        ) : (
          <span className={valueClasses} data-testid={testId ?? "telemetry-metric"}>
            {formatMetric(value, decimals)}
          </span>
        )}
        {unit ? (
          <span className="text-sm font-semibold text-eos-on-surface-subtle">{unit}</span>
        ) : null}
      </div>
      {label ? (
        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-eos-on-surface-subtle">
          {label}
        </p>
      ) : null}
    </motion.div>
  );
}
