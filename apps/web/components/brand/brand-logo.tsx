"use client";

import { useId } from "react";
import { LOGO_VIEWBOX, PLATE, SPINE, SPINE_SHADOW, WINGS } from "./logo-mark";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  size?: number;
  title?: string;
  variant?: "carbon3d" | "mono";
};

/**
 * Option 01 — swept wing-F with chrome depth + Volt rim light.
 * Optimised for 24–48px UI; SVG stays crisp at any scale.
 */
export function BrandLogo({
  className,
  size = 36,
  title = "FitConnect",
  variant = "carbon3d"
}: BrandLogoProps) {
  const uid = useId().replace(/:/g, "");
  const isPremium = variant === "carbon3d";
  const isMono = variant === "mono";
  const compact = size <= 30;

  const wingLayers = [
    WINGS.top,
    WINGS.mid,
    WINGS.low
  ] as const;

  return (
    <svg
      viewBox={LOGO_VIEWBOX}
      width={size}
      height={size}
      role="img"
      aria-label={title}
      className={cn("shrink-0", isPremium && "fc-logo-mark", className)}
    >
      <defs>
        <linearGradient id={`${uid}-plate`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#23262e" />
          <stop offset="55%" stopColor="#12141a" />
          <stop offset="100%" stopColor="#08090c" />
        </linearGradient>

        <linearGradient id={`${uid}-chrome`} x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0%" stopColor="#f4f5f7" />
          <stop offset="22%" stopColor="#b8beca" />
          <stop offset="55%" stopColor="#4a505c" />
          <stop offset="100%" stopColor="#181a20" />
        </linearGradient>

        <linearGradient id={`${uid}-chrome-shadow`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a2d35" />
          <stop offset="100%" stopColor="#060708" />
        </linearGradient>

        <linearGradient id={`${uid}-volt-rim`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c8ff00" stopOpacity="0.35" />
          <stop offset="40%" stopColor="#d6ff33" />
          <stop offset="100%" stopColor="#c8ff00" stopOpacity="0.65" />
        </linearGradient>

        <radialGradient id={`${uid}-volt-bloom`} cx="50%" cy="42%" r="48%">
          <stop offset="0%" stopColor="#c8ff00" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#c8ff00" stopOpacity="0" />
        </radialGradient>

        <filter id={`${uid}-lift`} x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#000" floodOpacity="0.55" />
          {!compact && (
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#c8ff00" floodOpacity="0.12" />
          )}
        </filter>
      </defs>

      {isPremium && (
        <>
          <rect
            x={PLATE.x}
            y={PLATE.y}
            width={PLATE.size}
            height={PLATE.size}
            rx={PLATE.rx}
            fill={`url(#${uid}-plate)`}
          />
          <rect
            x={PLATE.x}
            y={PLATE.y}
            width={PLATE.size}
            height={PLATE.size}
            rx={PLATE.rx}
            fill={`url(#${uid}-volt-bloom)`}
          />
          <rect
            x={PLATE.x + 0.5}
            y={PLATE.y + 0.5}
            width={PLATE.size - 1}
            height={PLATE.size - 1}
            rx={PLATE.rx - 0.5}
            fill="none"
            stroke="rgba(255,255,255,0.09)"
            strokeWidth="0.8"
          />
        </>
      )}

      <g filter={isPremium ? `url(#${uid}-lift)` : undefined}>
        {/* Spine */}
        <path
          d={SPINE_SHADOW}
          fill={isMono ? "currentColor" : `url(#${uid}-chrome-shadow)`}
          fillOpacity={isMono ? 0.35 : 1}
        />
        <path
          d={SPINE}
          fill={isMono ? "currentColor" : `url(#${uid}-chrome)`}
          fillOpacity={isMono ? 0.9 : 1}
        />

        {wingLayers.map((wing, i) => (
          <g key={i}>
            <path
              d={wing.shadow}
              fill={isMono ? "currentColor" : `url(#${uid}-chrome-shadow)`}
              fillOpacity={isMono ? 0.28 : 0.95}
            />
            <path
              d={wing.face}
              fill={isMono ? "currentColor" : `url(#${uid}-chrome)`}
              fillOpacity={isMono ? 0.85 - i * 0.08 : 1}
            />
            <path
              d={wing.edge}
              fill="none"
              stroke={isMono ? "currentColor" : `url(#${uid}-volt-rim)`}
              strokeWidth={compact ? 1.1 : 1.35}
              strokeLinecap="round"
              strokeOpacity={isMono ? 0.45 : 0.95 - i * 0.08}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
