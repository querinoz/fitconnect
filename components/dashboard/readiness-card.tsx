"use client";

import { useT } from "@/lib/i18n-provider";

export function ReadinessCard({ score }: { score: number }) {
  const t = useT();
  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-950/60 p-4 flex items-center gap-4">
      <div className="relative h-[72px] w-[72px] shrink-0">
        <svg
          viewBox="0 0 80 80"
          className="absolute inset-0 -rotate-90 h-full w-full"
          aria-hidden
        >
          <circle
            cx="40"
            cy="40"
            r="32"
            fill="transparent"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="7"
          />
          <circle
            cx="40"
            cy="40"
            r="32"
            fill="transparent"
            stroke="url(#fcReadiness)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 201} 201`}
          />
          <defs>
            <linearGradient id="fcReadiness" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#84cc16" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <p className="font-display text-xl font-bold tabular-nums text-ink-100">
            {score}
          </p>
        </div>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-ink-500">
          {t("dashboard", "readinessTitle")}
        </p>
        <p className="font-display text-lg font-bold text-accent-300">
          {t("dashboard", "readinessGreen")}
        </p>
      </div>
    </div>
  );
}
