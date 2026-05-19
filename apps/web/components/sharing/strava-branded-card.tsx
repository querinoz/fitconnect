"use client";

import { Share2 } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Wordmark } from "@/components/brand/wordmark";
import { cn } from "@/lib/utils";

export type StravaBrandedCardProps = {
  athleteName: string;
  activityName: string;
  sportType: string;
  distanceKm: number;
  durationSec: number;
  avgHr?: number;
  maxHr?: number;
  elevationM?: number;
  readinessScore?: number;
  coachName?: string;
  date?: Date | string;
  /** Show share action below the card */
  showShare?: boolean;
  className?: string;
};

function fmtDuration(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function fmtDate(raw?: Date | string) {
  if (!raw) return "";
  const d = typeof raw === "string" ? new Date(raw) : raw;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short"
  });
}

function buildShareText(props: StravaBrandedCardProps) {
  const lines = [
    `${props.activityName} · ${props.sportType}`,
    `${props.distanceKm.toFixed(1)} km · ${fmtDuration(props.durationSec)}`,
    props.readinessScore != null ? `Readiness ${props.readinessScore}` : null,
    props.coachName ? `Coached by ${props.coachName}` : null,
    "Tracked with FitConnect — fitconnect.app"
  ].filter(Boolean);
  return lines.join("\n");
}

export function StravaBrandedCard({
  athleteName,
  activityName,
  sportType,
  distanceKm,
  durationSec,
  avgHr,
  maxHr,
  elevationM,
  readinessScore,
  coachName,
  date,
  showShare = false,
  className
}: StravaBrandedCardProps) {
  const firstName = athleteName.split(" ")[0] ?? athleteName;
  const dateLabel = fmtDate(date);

  async function handleShare() {
    const text = buildShareText({
      athleteName,
      activityName,
      sportType,
      distanceKm,
      durationSec,
      avgHr,
      maxHr,
      elevationM,
      readinessScore,
      coachName,
      date
    });
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: activityName, text, url: "https://fitconnect.app" });
        return;
      } catch {
        /* user cancelled or unsupported payload */
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <article
        className="fc-strava-card relative overflow-hidden rounded-2xl border border-[var(--border-sm)] bg-[#07080b] p-5 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.85)]"
        aria-label={`${activityName} share card`}
      >
        <div
          className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(200,255,0,0.08)_0%,transparent_70%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-12 -right-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(0,221,180,0.06)_0%,transparent_70%)]"
          aria-hidden
        />

        <header className="relative mb-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Logo className="h-7 w-7" />
            <Wordmark size={15} className="hidden min-[360px]:inline-flex" />
          </div>
          <span className="fc-badge fc-badge-connect shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-connect-500" aria-hidden />
            Strava
          </span>
        </header>

        <div className="relative mb-1 flex flex-wrap items-center gap-2">
          <span className="fc-badge fc-badge-volt">{sportType}</span>
          {dateLabel ? (
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-400">
              {dateLabel}
            </span>
          ) : null}
        </div>

        <h3 className="relative font-display text-lg font-extrabold leading-tight tracking-tight text-ink-50">
          {activityName}
        </h3>
        <p className="relative mt-0.5 text-xs text-ink-400">
          {firstName}
          {coachName ? (
            <>
              {" "}
              · <span className="text-connect-500">Coach {coachName.split(" ")[0]}</span>
            </>
          ) : null}
        </p>

        <div className="relative my-5 text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.26em] text-ink-400">
            Distance
          </p>
          <p
            className="font-display text-[clamp(2.75rem,12vw,4rem)] font-extrabold leading-none tracking-[-0.06em] text-volt-500"
            style={{ textShadow: "0 0 40px rgba(200,255,0,0.2)" }}
          >
            {distanceKm.toFixed(1)}
            <span className="ml-1 text-[0.35em] font-bold text-ink-400">km</span>
          </p>
        </div>

        <div className="relative grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Metric label="Time" value={fmtDuration(durationSec)} accent="neutral" />
          <Metric
            label="Avg HR"
            value={avgHr != null ? String(Math.round(avgHr)) : "—"}
            unit={avgHr != null ? "bpm" : undefined}
            accent="crimson"
          />
          <Metric
            label="Elevation"
            value={elevationM != null ? String(Math.round(elevationM)) : "—"}
            unit={elevationM != null ? "m" : undefined}
            accent="connect"
          />
          <Metric
            label="Readiness"
            value={readinessScore != null ? String(readinessScore) : "—"}
            accent="volt"
          />
        </div>

        {maxHr != null ? (
          <p className="relative mt-3 text-center text-[10px] text-ink-400">
            Peak <span className="font-semibold text-signal-500">{Math.round(maxHr)} bpm</span>
          </p>
        ) : null}

        <svg
          viewBox="0 0 320 48"
          className="relative mt-4 h-12 w-full opacity-90"
          aria-hidden
        >
          <defs>
            <linearGradient id="fcStravaRoute" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00DDB4" />
              <stop offset="55%" stopColor="#C8FF00" />
              <stop offset="100%" stopColor="#00BFFF" />
            </linearGradient>
          </defs>
          <path
            d="M0,32 C24,28 40,18 64,22 C88,26 104,38 128,30 C152,22 168,12 192,16 C216,20 232,8 256,10 C272,11 288,14 320,6"
            fill="none"
            stroke="url(#fcStravaRoute)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M0,32 C24,28 40,18 64,22 C88,26 104,38 128,30 C152,22 168,12 192,16 C216,20 232,8 256,10 C272,11 288,14 320,6 L320,48 L0,48 Z"
            fill="url(#fcStravaRoute)"
            opacity="0.07"
          />
          <circle cx="320" cy="6" r="3.5" fill="#C8FF00" />
        </svg>

        <footer className="relative mt-4 flex items-center justify-between border-t border-[var(--border-xs)] pt-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-ink-400">
            Kinetic lab · FitConnect
          </p>
          <p className="font-display text-[11px] font-extrabold text-volt-500">fitconnect.app</p>
        </footer>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-volt-500/40 to-transparent"
          aria-hidden
        />
      </article>

      {showShare ? (
        <button
          type="button"
          onClick={() => void handleShare()}
          className="fc-motion-micro flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-sm)] bg-carbon-2 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-ink-100 transition-colors hover:border-volt-500/30 hover:bg-carbon-3"
        >
          <Share2 className="h-3.5 w-3.5 text-volt-500" aria-hidden />
          Share to feed
        </button>
      ) : null}
    </div>
  );
}

function Metric({
  label,
  value,
  unit,
  accent
}: {
  label: string;
  value: string;
  unit?: string;
  accent: "neutral" | "volt" | "connect" | "crimson";
}) {
  const valueColor = {
    neutral: "text-ink-50",
    volt: "text-volt-500",
    connect: "text-connect-500",
    crimson: "text-signal-500"
  }[accent];

  return (
    <div className="rounded-lg border border-[var(--border-xs)] bg-carbon-3 px-2.5 py-2 text-center">
      <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-ink-400">{label}</p>
      <p className={cn("font-display text-base font-extrabold leading-none", valueColor)}>
        {value}
        {unit ? (
          <span className="ml-0.5 text-[9px] font-semibold text-ink-400">{unit}</span>
        ) : null}
      </p>
    </div>
  );
}

export { buildShareText, fmtDuration };
