"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { ReadinessCardFull } from "@/components/dashboard/os/readiness-card-full";

type Props = {
  readiness: number;
  hrv: number;
  baselineHrv: number;
  sleepHours: string;
  sleepQuality?: string;
};

export function ReadinessCardWithExplain(props: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute right-0 top-0 z-10 inline-flex items-center gap-1 rounded-full border border-ink-700 bg-ink-900/80 px-2.5 py-1 text-[10px] font-semibold text-ink-300 hover:border-volt-500/30 hover:text-volt-400"
          aria-label="Explain readiness score"
        >
          <Info className="h-3 w-3" aria-hidden />
          How it works
        </button>
        <ReadinessCardFull {...props} />
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Readiness explanation"
        >
          <div className="max-w-md rounded-2xl border border-ink-800 bg-ink-900 p-6">
            <h3 className="font-display text-lg font-bold text-ink-50">
              Readiness Score
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-300">
              Your daily score blends HRV vs your 30-day baseline, last night&apos;s sleep
              duration and efficiency, and recent training load from Strava activities.
              Green means push; amber means steady; red means recover.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-ink-400">
              <li>HRV: heart-rate variability — higher vs baseline = better recovery</li>
              <li>Sleep: hours + efficiency from Apple Watch, Garmin or Whoop</li>
              <li>Load: moving time and heart rate from synced Strava workouts</li>
            </ul>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-6 w-full rounded-xl bg-volt-500 py-2.5 text-sm font-bold text-ink-950"
            >
              Got it
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
