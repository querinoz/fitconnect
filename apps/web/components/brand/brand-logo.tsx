"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  size?: number;
  title?: string;
  variant?: "carbon3d" | "mono";
};

/** Option 01 — aerodynamic wing-F with carbon metal + Volt edge highlights. */
export function BrandLogo({
  className,
  size = 36,
  title = "FitConnect",
  variant = "carbon3d"
}: BrandLogoProps) {
  const uid = useId().replace(/:/g, "");
  const isPremium = variant === "carbon3d";
  const isMono = variant === "mono";

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label={title}
      className={cn("shrink-0", isPremium && "fc-logo-premium", className)}
    >
      <defs>
        <linearGradient id={`${uid}-plate`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2a2e38" />
          <stop offset="50%" stopColor="#12141a" />
          <stop offset="100%" stopColor="#08090c" />
        </linearGradient>

        <linearGradient id={`${uid}-metal`} x1="0" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#eef0f4" />
          <stop offset="18%" stopColor="#9aa3b2" />
          <stop offset="48%" stopColor="#3a404c" />
          <stop offset="78%" stopColor="#1a1d24" />
          <stop offset="100%" stopColor="#0c0d11" />
        </linearGradient>

        <linearGradient id={`${uid}-metal-shadow`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1d24" />
          <stop offset="100%" stopColor="#050608" />
        </linearGradient>

        <linearGradient id={`${uid}-volt-edge`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c8ff00" stopOpacity="0.15" />
          <stop offset="45%" stopColor="#d6ff33" />
          <stop offset="100%" stopColor="#c8ff00" stopOpacity="0.55" />
        </linearGradient>

        <linearGradient id={`${uid}-shine`} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="40%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        <filter id={`${uid}-depth`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#000" floodOpacity="0.65" />
          <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#c8ff00" floodOpacity="0.18" />
        </filter>
      </defs>

      {isPremium && (
        <>
          <rect x="4" y="4" width="56" height="56" rx="15" fill={`url(#${uid}-plate)`} />
          <rect x="4" y="4" width="56" height="56" rx="15" fill={`url(#${uid}-shine)`} />
          <rect
            x="4.5"
            y="4.5"
            width="55"
            height="55"
            rx="14.5"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.75"
          />
          <ellipse cx="32" cy="32" rx="22" ry="18" fill="#c8ff00" opacity="0.06" />
        </>
      )}

      <g filter={isPremium ? `url(#${uid}-depth)` : undefined}>
        {/* Spine */}
        <path
          d="M18 14 L24 14 L24 50 L18 50 Z"
          fill={isMono ? "currentColor" : `url(#${uid}-metal-shadow)`}
          fillOpacity={isMono ? 0.85 : 1}
        />
        <path
          d="M17 13 L23 13 L23 49 L17 49 Z"
          fill={isMono ? "currentColor" : `url(#${uid}-metal)`}
        />

        {/* Top wing — longest, most motion */}
        <path
          d="M23 15 L48 12 L46 21 L23 22 Z"
          fill={isMono ? "currentColor" : `url(#${uid}-metal-shadow)`}
          fillOpacity={isMono ? 0.7 : 1}
        />
        <path
          d="M22 14 L47 11 L45 20 L22 21 Z"
          fill={isMono ? "currentColor" : `url(#${uid}-metal)`}
        />
        <path
          d="M22 14 L47 11"
          stroke={isMono ? "currentColor" : `url(#${uid}-volt-edge)`}
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeOpacity={isMono ? 0.5 : 1}
        />

        {/* Middle wing */}
        <path
          d="M23 27 L42 25 L40 32 L23 33 Z"
          fill={isMono ? "currentColor" : `url(#${uid}-metal-shadow)`}
          fillOpacity={isMono ? 0.7 : 1}
        />
        <path
          d="M22 26 L41 24 L39 31 L22 32 Z"
          fill={isMono ? "currentColor" : `url(#${uid}-metal)`}
        />
        <path
          d="M22 26 L41 24"
          stroke={isMono ? "currentColor" : `url(#${uid}-volt-edge)`}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity={isMono ? 0.45 : 0.9}
        />

        {/* Bottom wing — short accent */}
        <path
          d="M23 37 L34 36 L32 42 L23 43 Z"
          fill={isMono ? "currentColor" : `url(#${uid}-metal-shadow)`}
          fillOpacity={isMono ? 0.65 : 1}
        />
        <path
          d="M22 36 L33 35 L31 41 L22 42 Z"
          fill={isMono ? "currentColor" : `url(#${uid}-metal)`}
        />
        <path
          d="M22 36 L33 35"
          stroke={isMono ? "currentColor" : "#c8ff00"}
          strokeWidth="1"
          strokeLinecap="round"
          strokeOpacity={isMono ? 0.4 : 0.75}
        />
      </g>

      {isPremium && (
        <path
          d="M22 14 L47 11"
          stroke="#ffffff"
          strokeWidth="0.5"
          strokeLinecap="round"
          opacity="0.25"
        />
      )}
    </svg>
  );
}
