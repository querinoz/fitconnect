import { cn } from "@/lib/utils";

type WordmarkProps = {
  className?: string;
  /** font-size in px for the SVG text element. Defaults to 22. */
  size?: number;
  /**
   * If true, the inner stroke trace below "Connect" is drawn
   * (fully animated only when prefers-reduced-motion: no-preference).
   */
  underline?: boolean;
  title?: string;
};

/**
 * "FitConnect" wordmark in inline SVG.
 *
 * "Fit" is rendered in solid ink-50 with custom -0.02em tracking,
 * "Connect" in a brand→accent gradient with a discreet 1px tension
 * underline that mirrors the brand mark's tension stroke.
 */
export function Wordmark({
  className,
  size = 22,
  underline = true,
  title = "FitConnect"
}: WordmarkProps) {
  const w = size * 8.6;
  const h = size * 1.6;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label={title}
      className={cn("inline-block align-middle", className)}
      style={{ height: size * 1.05, width: "auto" }}
    >
      <defs>
        <linearGradient id="fcWmGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="55%" stopColor="#7dd3a3" />
          <stop offset="100%" stopColor="#a3e635" />
        </linearGradient>
      </defs>
      <text
        x="0"
        y={size * 1.18}
        fill="#f8fafc"
        fontSize={size}
        fontFamily="var(--font-display), system-ui, sans-serif"
        fontWeight={800}
        letterSpacing="-0.02em"
      >
        Fit
      </text>
      <text
        x={size * 1.62}
        y={size * 1.18}
        fill="url(#fcWmGrad)"
        fontSize={size}
        fontFamily="var(--font-display), system-ui, sans-serif"
        fontWeight={800}
        letterSpacing="-0.02em"
      >
        Connect
      </text>
      {underline && (
        <path
          d={`M${size * 1.7} ${size * 1.34}
              C ${size * 2.6} ${size * 1.42}
                ${size * 4.6} ${size * 1.26}
                ${size * 7.6} ${size * 1.34}`}
          fill="none"
          stroke="url(#fcWmGrad)"
          strokeWidth={Math.max(1.2, size * 0.07)}
          strokeLinecap="round"
          opacity="0.55"
        />
      )}
    </svg>
  );
}
