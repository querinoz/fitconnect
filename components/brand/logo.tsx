import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  /**
   * If true, the inner stroke animates a one-shot trace on mount.
   * Animation is suppressed automatically by the global
   * prefers-reduced-motion guard.
   */
  animated?: boolean;
  title?: string;
};

/**
 * FitConnect brand mark.
 *
 * Concept: an asymmetric "F" upright fused with a tension stroke that
 * arcs into a "C" — two crossing strokes that read as an athlete mid-stride
 * and as a measurement line cresting into recovery.
 *
 * Renders as a 32×32 logical mark inside an inset-rounded plate so it
 * still works at 16-24px while staying crisp at 96px.
 */
export function Logo({ className, animated = false, title = "FitConnect" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      role="img"
      aria-label={title}
      className={cn("h-9 w-9", className)}
    >
      <defs>
        <linearGradient id="fcMarkPlate" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="55%" stopColor="#7dd3a3" />
          <stop offset="100%" stopColor="#a3e635" />
        </linearGradient>
        <linearGradient id="fcMarkStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#020617" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <radialGradient id="fcMarkGlow" cx="0.3" cy="0.3" r="0.85">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="fcMarkTension" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#020617" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>

      {/* Plate */}
      <rect
        x="1"
        y="1"
        width="38"
        height="38"
        rx="11"
        fill="url(#fcMarkPlate)"
      />
      {/* Plasma kiss */}
      <rect
        x="1"
        y="1"
        width="38"
        height="38"
        rx="11"
        fill="url(#fcMarkGlow)"
      />

      {/* "F" upright + horizontals — one continuous stroke */}
      <path
        d="M13 9.5 V30.5"
        fill="none"
        stroke="url(#fcMarkStroke)"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      <path
        d="M13 11 H27.5"
        fill="none"
        stroke="url(#fcMarkStroke)"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      <path
        d="M13 19.5 H22"
        fill="none"
        stroke="url(#fcMarkStroke)"
        strokeWidth="3.6"
        strokeLinecap="round"
      />

      {/* Tension stroke — a second motion line that crosses the F and
          arcs upward like a heart-rate spike + the inside of a "C". */}
      <path
        className={animated ? "fc-mark-trace" : undefined}
        d="M9.2 27.6 C 14 27.6 17.5 22.2 22 22.2 C 27 22.2 28.4 31 33 28"
        fill="none"
        stroke="url(#fcMarkTension)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Tip dot — the athlete's strike point */}
      <circle cx="33" cy="28" r="1.6" fill="#020617" />
    </svg>
  );
}

/**
 * Compact monochrome variant — used inside the favicon and any
 * single-colour context where the gradient would compete with the
 * surface (e.g. a chip on the AI assistant header).
 */
export function LogoMono({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      role="img"
      aria-label="FitConnect"
      className={cn("h-5 w-5", className)}
    >
      <path
        d="M13 9.5 V30.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      <path
        d="M13 11 H27.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      <path
        d="M13 19.5 H22"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      <path
        d="M9.2 27.6 C 14 27.6 17.5 22.2 22 22.2 C 27 22.2 28.4 31 33 28"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
