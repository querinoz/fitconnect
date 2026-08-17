"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { ReadinessCardFull } from "@/components/dashboard/os/readiness-card-full";
import { useLocale } from "@/lib/i18n-provider";

type Props = {
  readiness: number;
  hrv: number;
  baselineHrv: number;
  sleepHours: string;
  sleepQuality?: string;
};

export function ReadinessCardWithExplain(props: Props) {
  const [open, setOpen] = useState(false);
  const copy = useLocale().dashboard.readiness_ring;

  return (
    <>
      <ReadinessCardFull
        {...props}
        headerAction={
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex min-h-8 shrink-0 items-center gap-1 rounded-full border border-eos-outline bg-eos-floor/80 px-2.5 py-1 text-[10px] font-semibold text-eos-on-surface-muted hover:border-eos-voltline/30 hover:text-eos-voltline"
            aria-label={copy.howItWorks}
          >
            <Info className="h-3 w-3" aria-hidden />
            {copy.howItWorks}
          </button>
        }
      />

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-eos-floor/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Readiness explanation"
        >
          <div className="max-w-md rounded-2xl border border-eos-outline bg-eos-surface-container p-6">
            <h3 className="font-display text-lg font-bold text-eos-on-surface">
              Readiness Score
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-eos-on-surface-muted">
              Your daily score blends HRV vs your 30-day baseline, last night&apos;s sleep
              duration and efficiency, and recent training load from Strava activities.
              Green means push; amber means steady; red means recover.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-eos-on-surface-subtle">
              <li>HRV: heart-rate variability — higher vs baseline = better recovery</li>
              <li>Sleep: hours + efficiency from Apple Watch, Garmin or Whoop</li>
              <li>Load: moving time and heart rate from synced Strava workouts</li>
            </ul>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-6 w-full rounded-xl bg-eos-voltline py-2.5 text-sm font-bold text-eos-floor"
            >
              Got it
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
