"use client";

import { cn } from "@/lib/utils";

type AtmosphereProps = {
  className?: string;
  tone?: "default" | "warm";
  bandsOnly?: boolean;
  particles?: number;
};

/** Section-level atmosphere — smooth kinetic lines over the landing canvas. */
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
          "absolute inset-0 fc-kinetic fc-kinetic-smooth opacity-90",
          tone === "warm" && "fc-kinetic-warm"
        )}
      />

      {!bandsOnly && <Waves tone={tone} />}

      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink-950/90" />
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
      : ["#c8ff00", "#d6ff33", "#00ddb4"];
  const dots = Array.from({ length: count }, (_, i) => {
    const x = ((i * 47.13) % 100 + 100) % 100;
    const y = ((i * 31.71) % 100 + 100) % 100;
    const size = 1.5 + (i % 3);
    const delay = (i % 13) * 0.7;
    const dur = 14 + (i % 7);
    const colour = palette[i % palette.length];
    return { x, y, size, delay, dur, colour, i };
  });
  return (
    <div className="absolute inset-0">
      {dots.map((d) => (
        <span
          key={d.i}
          className="fc-particle absolute rounded-full blur-[0.5px]"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
            background: d.colour,
            boxShadow: `0 0 ${d.size * 6}px ${d.colour}`,
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
      className="absolute inset-0 h-full w-full opacity-70"
    >
      <defs>
        <linearGradient id="fcWave1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={stops.a} stopOpacity="0" />
          <stop offset="50%" stopColor={stops.a} stopOpacity="0.22" />
          <stop offset="100%" stopColor={stops.a} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="fcWave2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={stops.b} stopOpacity="0" />
          <stop offset="50%" stopColor={stops.b} stopOpacity="0.18" />
          <stop offset="100%" stopColor={stops.b} stopOpacity="0" />
        </linearGradient>
        <filter id="fcWaveBlur">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>
      <g filter="url(#fcWaveBlur)">
        <path
          className="fc-wave-1"
          d="M-200 300 Q 80 220 360 320 T 920 300 T 1480 320"
          fill="none"
          stroke="url(#fcWave1)"
          strokeWidth="1.5"
          strokeDasharray="10 18"
          strokeLinecap="round"
        />
        <path
          className="fc-wave-2"
          d="M-200 440 Q 120 380 400 460 T 960 440 T 1520 460"
          fill="none"
          stroke="url(#fcWave2)"
          strokeWidth="1.8"
          strokeDasharray="12 20"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
