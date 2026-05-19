"use client";

const ITEMS = [
  "sync_apple_health.ts",
  "npm run match",
  "HRV: 84ms · sleep 7.2h",
  "62% rejected",
  "TODO: PR today",
  "12,418 verified specialists",
  "recovery_score: 91",
  "coach_payout: 85%",
  "live_demo: /mobile"
] as const;

export function StatusTicker() {
  const doubled = [...ITEMS, ...ITEMS];

  return (
    <div className="fc-marquee-viewport relative border-y border-ink-800/80 bg-ink-950/60 backdrop-blur-sm">
      <div className="fc-status-ticker fc-marquee-track flex whitespace-nowrap py-2.5">
        {doubled.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="inline-flex items-center gap-3 px-4 sm:px-6 font-mono text-[10px] sm:text-[11px] text-ink-500"
          >
            <span className="h-1 w-1 shrink-0 rounded-full bg-volt-500/70" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
