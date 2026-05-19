"use client";

import { cn } from "@/lib/utils";

type LiquidLoaderProps = {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
  fullscreen?: boolean;
};

const sizes = {
  sm: 0.55,
  md: 0.75,
  lg: 1
};

/** FitConnect liquid orb loader — inspired by uiverse young-walrus-64, brand palette. */
export function LiquidLoader({
  size = "md",
  label = "Loading",
  className,
  fullscreen = false
}: LiquidLoaderProps) {
  const scale = sizes[size];

  const loader = (
    <div
      className={cn("fc-liquid-loader-wrap", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      <div style={{ transform: `scale(${scale})` }}>
        <div className="fc-liquid-loader">
          <div className="fc-liquid-loader-box" />
        </div>
      </div>
      {label ? (
        <p className="mt-4 text-center text-xs font-semibold uppercase tracking-[0.22em] text-ink-400">
          {label}
        </p>
      ) : null}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fc-liquid-loader-screen premium-grid">
        {loader}
      </div>
    );
  }

  return loader;
}
