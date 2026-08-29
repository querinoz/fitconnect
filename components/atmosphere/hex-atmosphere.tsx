"use client";

/** Subtle hexagonal atmosphere — technical, low-contrast, non-interactive */
export function HexAtmosphere({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden ${className}`}
    >
      <div className="hex-atmosphere absolute inset-0 opacity-[0.35]" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950/20 via-transparent to-ink-950/60" />
    </div>
  );
}
