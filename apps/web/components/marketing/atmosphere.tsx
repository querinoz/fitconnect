import { cn } from "@/lib/utils";

type AtmosphereProps = {
  className?: string;
  /** Tone of the bands.
   *  - "default": connect→volt→cyan kinetic energy lines (used on /, /pricing, /discover hero).
   *  - "warm": signal→crimson sunset (used on /community).
   */
  tone?: "default" | "warm";
  /** Suppresses the SVG sin-wave layer for sections where the wave
   *  would conflict with foreground charts. */
  bandsOnly?: boolean;
  /** Number of drifting brand-coloured dust particles. 0 disables the
   *  layer (default). 18-28 is the sweet spot for the hero. */
  particles?: number;
};

/**
 * FitConnect signature background — kinetic energy lines.
 */
export function Atmosphere({
  className,
  tone = "default",
  bandsOnly = false,
  particles = 0
}: AtmosphereProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className
      )}
    >
      {particles > 0 && <Particles count={particles} tone={tone} />}
      <div
        className={cn(
          "absolute inset-0 fc-kinetic",
          tone === "warm" && "fc-kinetic-warm"
        )}
        style={
          tone === "warm"
            ? {
                background:
                  "radial-gradient(60% 80% at 18% 30%, rgba(255,58,92,0.22), transparent 70%)," +
                  "radial-gradient(55% 70% at 82% 60%, rgba(255,58,92,0.14), transparent 70%)," +
                  "radial-gradient(40% 55% at 50% 90%, rgba(0,221,180,0.1), transparent 70%)",
                backgroundSize: "220% 220%, 220% 220%, 220% 220%"
              }
            : undefined
        }
      />

      <div
        className="absolute inset-0 bg-grid-dark bg-[size:64px_64px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />

      {!bandsOnly && <Waves tone={tone} />}

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink-950" />

      <div className="absolute inset-0 bg-noise opacity-30 mix-blend-overlay" />
    </div>
  );
}

function Particles({
  count,
  tone
}: {
  count: number;
  tone: "default" | "warm";
}) {
  const palette =
    tone === "warm"
      ? ["#ff3a5c", "#ff6480", "#00ddb4"]
      : ["#c8ff00", "#00ddb4", "#00bfff"];
  const dots = Array.from({ length: count }, (_, i) => {
    const x = ((i * 47.13) % 100 + 100) % 100;
    const y = ((i * 31.71) % 100 + 100) % 100;
    const size = 2 + (i % 4);
    const delay = (i % 13) * 0.7;
    const dur = 11 + (i % 7);
    const colour = palette[i % palette.length];
    return { x, y, size, delay, dur, colour, i };
  });
  return (
    <div className="absolute inset-0">
      {dots.map((d) => (
        <span
          key={d.i}
          className="fc-particle absolute rounded-full"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
            background: d.colour,
            boxShadow: `0 0 ${d.size * 4}px ${d.colour}`,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.dur}s`,
            opacity: 0
          }}
        />
      ))}
    </div>
  );
}

function Waves({ tone }: { tone: "default" | "warm" }) {
  const stops =
    tone === "warm"
      ? { a: "#ff3a5c", b: "#ff6480", c: "#00ddb4" }
      : { a: "#00ddb4", b: "#c8ff00", c: "#00bfff" };
  return (
    <svg
      viewBox="0 0 1440 720"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        <linearGradient id="fcWave1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={stops.a} stopOpacity="0" />
          <stop offset="50%" stopColor={stops.a} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stops.a} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="fcWave2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={stops.b} stopOpacity="0" />
          <stop offset="50%" stopColor={stops.b} stopOpacity="0.30" />
          <stop offset="100%" stopColor={stops.b} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="fcWave3" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={stops.c} stopOpacity="0" />
          <stop offset="50%" stopColor={stops.c} stopOpacity="0.22" />
          <stop offset="100%" stopColor={stops.c} stopOpacity="0" />
        </linearGradient>
        <filter id="fcWaveBlur">
          <feGaussianBlur stdDeviation="0.8" />
        </filter>
      </defs>

      <g filter="url(#fcWaveBlur)">
        <path
          className="fc-wave-1"
          d="M-200 280 Q 60 200 320 300 T 840 280 T 1360 300 T 1820 280"
          fill="none"
          stroke="url(#fcWave1)"
          strokeWidth="2"
          strokeDasharray="8 14"
          strokeLinecap="round"
        />
        <path
          className="fc-wave-2"
          d="M-200 420 Q 100 360 360 440 T 920 420 T 1480 440 T 1820 420"
          fill="none"
          stroke="url(#fcWave2)"
          strokeWidth="2.4"
          strokeDasharray="10 16"
          strokeLinecap="round"
        />
        <path
          className="fc-wave-3"
          d="M-200 560 Q 80 480 360 560 T 880 560 T 1400 560 T 1820 560"
          fill="none"
          stroke="url(#fcWave3)"
          strokeWidth="1.8"
          strokeDasharray="6 12"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
