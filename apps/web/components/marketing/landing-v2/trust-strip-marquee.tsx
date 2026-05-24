"use client";

import { TrustStrip } from "@/components/marketing/trust-strip";

/** Trust strip with continuous logo marquee (landing v2). */
export function TrustStripMarquee() {
  return (
    <div className="landing-v2-trust relative z-10 -mt-px border-b border-white/5 bg-[var(--eos-floor)]/80 backdrop-blur-md">
      <TrustStrip />
      <div className="overflow-hidden border-t border-white/5 py-3" aria-hidden>
        <div className="landing-v2-marquee flex w-max gap-10 px-4">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center gap-10">
              {["Strava", "Whoop", "Garmin", "Oura", "Apple Health", "FitConnect Verified"].map(
                (name) => (
                  <span
                    key={`${copy}-${name}`}
                    className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-500"
                  >
                    {name}
                  </span>
                )
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
