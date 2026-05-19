import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * FitConnect bespoke icon set.
 *
 * Drawn pixel-perfect on a 24×24 grid, single-colour `currentColor`,
 * 1.5 stroke. Designed to slot in everywhere a `lucide-react` icon
 * would, with the same `className` API.
 */
export type IconProps = React.SVGProps<SVGSVGElement> & {
  className?: string;
  title?: string;
};

function Svg({
  children,
  className,
  title,
  ...rest
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn("h-5 w-5", className)}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

/* 1. Heart-rate — a clean ECG trace contained in a soft chest curve. */
export function HeartRateIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 7.5a4.2 4.2 0 0 1 7.6-2.3l1.4 2 1.4-2A4.2 4.2 0 0 1 21 7.5c0 1.7-.7 3.1-2.1 4.7" />
      <path d="M3.5 13h3l1.6-3 2.4 7 2-4 1.5 2h7" />
    </Svg>
  );
}

/* 2. Recovery ring — outer ring with a 75% arc + inner core dot. */
export function RecoveryRingIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="8.5" opacity="0.25" />
      <path d="M19.4 8.4a8.5 8.5 0 1 1-9.9-4.6" />
      <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/* 3. Dumbbell-set — a rack with one barbell ready, two plates stacked. */
export function DumbbellSetIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3.5 11v3M5.5 9.5v6M18.5 9.5v6M20.5 11v3M5.5 12.5h13" />
      <path d="M9 17h6M9.8 19.5h4.4" opacity="0.6" />
    </Svg>
  );
}

/* 4. Stopwatch — circle, top knob, two side buttons, hand at 30s. */
export function StopwatchIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M9.5 3h5M12 3v2.5" />
      <path d="M18.4 6.6 19.5 5.5M5.6 6.6 4.5 5.5" />
      <circle cx="12" cy="13.5" r="6.8" />
      <path d="M12 9.5V13.5l3 1.5" />
    </Svg>
  );
}

/* 5. Calendar-streak — month grid with a 5-day streak highlighted. */
export function CalendarStreakIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 9.5h17M8 3.2v3.6M16 3.2v3.6" />
      <path
        d="M7 13h2M11 13h2M15 13h2M7 16.5h2M11 16.5h2M15 16.5h2"
        opacity="0.35"
      />
      <path
        d="M7 13h2M11 13h2M15 13h2"
        opacity="1"
        strokeWidth={2}
        stroke="currentColor"
      />
      <path d="M6.5 13c2.7 1 5.7 2.3 8.5 4" opacity="0.5" />
    </Svg>
  );
}

/* 6. Certification — shield with check-tick + ribbon tail. */
export function CertificationIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 3 4.5 5.6V12c0 4.4 3.2 7.6 7.5 9 4.3-1.4 7.5-4.6 7.5-9V5.6L12 3Z" />
      <path d="M9 12l2.2 2.2L15.5 10" />
      <path d="M8.5 19l-1.6 2 2.6-.5 1.5 1.5M15.5 19l1.6 2-2.6-.5-1.5 1.5" opacity="0.55" />
    </Svg>
  );
}

/* 7. Video-room — laptop / monitor with a play triangle and bandwidth dot. */
export function VideoRoomIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="2.5" y="5" width="15.5" height="11" rx="2" />
      <path d="M2 18.5h16.5" />
      <path d="M9 9.2v5.6l4.6-2.8z" fill="currentColor" stroke="none" />
      <circle cx="20" cy="6.5" r="1.6" fill="currentColor" stroke="none" />
      <path d="M20 4v.3M21.5 6.5h.3M20 9v-.3M18.5 6.5h-.3" opacity="0.55" />
    </Svg>
  );
}

/* 8. Target — concentric rings with a centre cross and arrow stuck in. */
export function TargetIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <path d="M12 1.5V4M12 20v2.5M22.5 12H20M4 12H1.5" opacity="0.4" />
      <path d="M16.4 7.6 21 3M21 3l-3 .2M21 3l-.2 3" opacity="0.85" />
    </Svg>
  );
}

/* Bonus: a wordmark-friendly arrow used by the marketing CTA */
export function MotionArrowIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 12h14" />
      <path d="M14 7l5 5-5 5" />
      <path d="M3 8.5h2M3 15.5h2" opacity="0.5" />
    </Svg>
  );
}
