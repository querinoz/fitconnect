"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  size?: number;
  title?: string;
  /** Premium metallic carbon (default) or flat mono for tiny UI */
  variant?: "carbon3d" | "mono";
};

/**
 * FitConnect connection-node mark — professional SVG.
 * Hub + three nodes (athlete · coach · platform) with carbon-metallic depth.
 * Vector-only: crisp at every size (nav, PWA, dashboard, mobile header).
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

  const hub = { cx: 32, cy: 32, r: 8.5 };
  const nodes = [
    { cx: 13, cy: 32, r: 5.5 },
    { cx: 49, cy: 15, r: 5.5 },
    { cx: 49, cy: 49, r: 5.5 }
  ];

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label={title}
      className={cn(
        "shrink-0",
        isPremium && "fc-logo-premium",
        className
      )}
    >
      <defs>
        <linearGradient id={`${uid}-plate`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2a2e38" />
          <stop offset="45%" stopColor="#14161c" />
          <stop offset="100%" stopColor="#0a0b0f" />
        </linearGradient>

        <linearGradient id={`${uid}-plate-shine`} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.14" />
          <stop offset="35%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        <pattern
          id={`${uid}-weave`}
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(35)"
        >
          <line x1="0" y1="0" x2="0" y2="6" stroke="#ffffff" strokeOpacity="0.04" strokeWidth="0.6" />
          <line x1="3" y1="0" x2="3" y2="6" stroke="#000000" strokeOpacity="0.18" strokeWidth="0.6" />
        </pattern>

        <radialGradient id={`${uid}-hub`} cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#f0ffb8" />
          <stop offset="28%" stopColor="#d6ff33" />
          <stop offset="62%" stopColor="#c8ff00" />
          <stop offset="100%" stopColor="#5a6600" />
        </radialGradient>

        <radialGradient id={`${uid}-hub-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c8ff00" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#c8ff00" stopOpacity="0" />
        </radialGradient>

        <linearGradient id={`${uid}-link`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00ddb4" stopOpacity="0.15" />
          <stop offset="50%" stopColor="#c8ff00" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#00ddb4" stopOpacity="0.35" />
        </linearGradient>

        <linearGradient id={`${uid}-ring`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8ebf2" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#c8ff00" />
          <stop offset="100%" stopColor="#00ddb4" stopOpacity="0.75" />
        </linearGradient>

        <filter id={`${uid}-soft`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.55" />
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#c8ff00" floodOpacity="0.22" />
        </filter>
      </defs>

      {isPremium && (
        <>
          <rect
            x="4"
            y="4"
            width="56"
            height="56"
            rx="15"
            fill={`url(#${uid}-plate)`}
            filter={`url(#${uid}-soft)`}
          />
          <rect
            x="4"
            y="4"
            width="56"
            height="56"
            rx="15"
            fill={`url(#${uid}-weave)`}
          />
          <rect
            x="4"
            y="4"
            width="56"
            height="56"
            rx="15"
            fill={`url(#${uid}-plate-shine)`}
          />
          <rect
            x="4.5"
            y="4.5"
            width="55"
            height="55"
            rx="14.5"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="0.75"
          />
        </>
      )}

      {isPremium && (
        <circle
          cx={hub.cx}
          cy={hub.cy}
          r="17"
          fill={`url(#${uid}-hub-glow)`}
          opacity="0.65"
        />
      )}

      <g
        fill="none"
        stroke={isMono ? "currentColor" : `url(#${uid}-link)`}
        strokeWidth={isMono ? 2 : 2.25}
        strokeLinecap="round"
        strokeOpacity={isMono ? 0.45 : 1}
      >
        <line x1="18.5" y1="32" x2="23.2" y2="32" />
        <line x1="39.5" y1="24.5" x2="44.2" y2="18.8" />
        <line x1="39.5" y1="39.5" x2="44.2" y2="45.2" />
      </g>

      {nodes.map((node) => (
        <circle
          key={`${node.cx}-${node.cy}`}
          cx={node.cx}
          cy={node.cy}
          r={node.r}
          fill="none"
          stroke={isMono ? "currentColor" : `url(#${uid}-ring)`}
          strokeWidth={isMono ? 2 : 2.25}
          strokeOpacity={isMono ? 0.55 : 1}
        />
      ))}

      <circle
        cx={hub.cx}
        cy={hub.cy}
        r={hub.r + 4.5}
        fill={isMono ? "currentColor" : `url(#${uid}-hub-glow)`}
        fillOpacity={isMono ? 0.12 : 0.35}
      />

      <circle
        cx={hub.cx}
        cy={hub.cy}
        r={hub.r}
        fill={isMono ? "currentColor" : `url(#${uid}-hub)`}
        filter={isPremium ? `url(#${uid}-soft)` : undefined}
      />

      {isPremium && (
        <ellipse
          cx={hub.cx - 2.5}
          cy={hub.cy - 3}
          rx="3.2"
          ry="2"
          fill="#ffffff"
          opacity="0.38"
        />
      )}

      {isPremium && !isMono && (
        <circle
          cx={hub.cx}
          cy={hub.cy}
          r={hub.r}
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.12"
          strokeWidth="0.5"
        />
      )}
    </svg>
  );
}
