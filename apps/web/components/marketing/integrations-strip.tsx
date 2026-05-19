"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Link2, RefreshCw, TrendingUp } from "lucide-react";
import { useLocale } from "@/lib/i18n-provider";

const INTEGRATIONS = [
  { name: "Strava", src: "/brands/strava.svg" },
  { name: "Garmin", src: "/brands/garmin.svg" },
  { name: "Apple Health", src: "/brands/apple-health.svg" },
  { name: "Whoop", src: "/brands/whoop.svg" },
  { name: "Oura", src: "/brands/oura.svg" }
];

const STEPS = [Link2, RefreshCw, TrendingUp];

export function IntegrationsStrip() {
  const locale = useLocale();
  const t = locale.integrationsStrip;
  const [synced, setSynced] = useState(false);
  const [syncTime, setSyncTime] = useState(t.syncDemo);

  useEffect(() => {
    fetch("/api/v1/integrations/status?athleteId=a-ines")
      .then((r) => r.json())
      .then((data) => {
        if (data?.strava?.connected) {
          setSynced(true);
          if (data.strava.lastSyncAt) {
            const mins = Math.round(
              (Date.now() - new Date(data.strava.lastSyncAt).getTime()) / 60000
            );
            setSyncTime(mins <= 1 ? t.syncDemo : `${mins} min`);
          }
        }
      })
      .catch(() => {
        /* demo fallback */
      });
  }, [t.syncDemo]);

  const steps = [t.step1, t.step2, t.step3];

  return (
    <section className="border-y border-ink-800/60 bg-gradient-to-b from-ink-950/80 to-transparent">
      <div className="mx-auto max-w-7xl fc-section-x px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="eyebrow">{t.eyebrow}</p>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">{t.title}</h2>
            <p className="mt-3 text-ink-400">{t.subtitle}</p>
          </div>
          <div
            className={`inline-flex items-center gap-2 self-start rounded-full px-4 py-2 text-sm font-semibold ring-1 ${
              synced
                ? "bg-volt-dim text-volt-400 ring-volt-500/30"
                : "bg-ink-900/80 text-ink-300 ring-ink-700"
            }`}
          >
            <span
              aria-hidden
              className={`h-2 w-2 rounded-full ${synced ? "bg-volt-500 animate-pulse" : "bg-ink-500"}`}
            />
            {t.syncLabel}
            <span className="text-ink-500">· {syncTime}</span>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {steps.map((label, i) => {
            const Icon = STEPS[i] ?? Link2;
            return (
              <div
                key={label}
                className="flex items-start gap-4 rounded-2xl border border-ink-800 bg-ink-900/40 p-5"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-volt-dim text-volt-500 ring-1 ring-volt-500/25">
                  <Icon aria-hidden className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-mono text-xs text-ink-500">0{i + 1}</span>
                  <p className="mt-1 font-semibold text-ink-100">{label}</p>
                </div>
                {i < 2 && (
                  <ArrowRight
                    aria-hidden
                    className="ml-auto hidden h-4 w-4 self-center text-ink-600 sm:block"
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-8">
          {INTEGRATIONS.map((logo) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={logo.name}
              src={logo.src}
              alt={logo.name}
              width={100}
              height={24}
              className="h-6 w-auto opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
