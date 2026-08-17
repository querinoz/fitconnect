"use client";

import { Activity, Radio, ShieldCheck, Users } from "lucide-react";
import { useLocale } from "@/lib/i18n-provider";
import { useLiveDemoTelemetry } from "@/lib/demo/live-telemetry";
import { cn } from "@/lib/utils";

export type LandingPhoneRole = "athlete" | "coach" | "together";

type LandingPhoneStageProps = {
  role: LandingPhoneRole;
  className?: string;
};

/** CSS-3D Android chassis wrapping Elite OS demo screens. */
export function LandingPhoneStage({ role, className }: LandingPhoneStageProps) {
  const e = useLocale().landingEditorial.heroElite;
  const label =
    role === "athlete" ? e.ctaPrimary : role === "coach" ? e.navInitialize : e.liveSession;

  return (
    <div className={cn("eos-phone-stage", className)}>
      <div className="eos-phone-rig">
        <div className="eos-phone-chassis">
          <div
            role="img"
            aria-label={`${label} · ${e.demoBadge}`}
            data-testid={`landing-phone-${role}`}
            className="eos-phone-screen"
          >
            <span className="eos-phone-glare" aria-hidden />
            {role === "athlete" ? <AthleteScreen /> : null}
            {role === "coach" ? <CoachScreen /> : null}
            {role === "together" ? <TogetherScreen /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function Chrome({ title }: { title: string }) {
  const e = useLocale().landingEditorial.heroElite;
  return (
    <header className="flex items-center justify-between border-b border-white/10 px-4 pb-3 pt-4">
      <span className="font-display text-sm font-bold tracking-tight text-eos-on-surface">
        {title}
      </span>
      <span className="rounded-full border border-eos-voltline/30 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-eos-voltline">
        {e.demoBadge}
      </span>
    </header>
  );
}

function AthleteScreen() {
  const e = useLocale().landingEditorial.heroElite;
  const live = useLiveDemoTelemetry();
  return (
    <div className="relative z-[1] flex h-full flex-col">
      <Chrome title="Athlete OS" />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-4 py-4">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-eos-on-surface-muted">
            {e.readinessIndex}
          </p>
          <div className="mt-1 flex items-end gap-2">
            <span className="font-display text-5xl leading-none tabular-nums text-eos-on-surface">
              {live.readiness}
            </span>
            <span className="font-mono text-eos-voltline">%</span>
            <Activity className="mb-1 h-4 w-4 text-eos-voltline" aria-hidden />
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-gradient-to-r from-eos-telemetry to-eos-voltline"
              style={{ width: `${live.readiness}%` }}
            />
          </div>
        </div>
        {[
          { label: e.telemetryHrv, value: `${live.hrvMs} ms`, width: `${Math.min(100, live.hrvMs)}%` },
          { label: e.telemetryLoad, value: live.load.toFixed(2), width: `${Math.round(live.load * 100)}%` },
          { label: e.telemetrySleep, value: "7h 18m", width: "88%" }
        ].map((row) => (
          <div key={row.label}>
            <div className="mb-1 flex justify-between font-mono text-[9px] uppercase tracking-[0.12em] text-eos-on-surface-muted">
              <span>{row.label}</span>
              <span className="text-eos-telemetry">{row.value}</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-eos-telemetry to-eos-voltline"
                style={{ width: row.width }}
              />
            </div>
          </div>
        ))}
        <div className="mt-auto rounded-xl bg-eos-voltline px-3 py-2.5 text-center font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-eos-floor">
          {e.ctaPrimary}
        </div>
      </div>
    </div>
  );
}

function CoachScreen() {
  const e = useLocale().landingEditorial.heroElite;
  const live = useLiveDemoTelemetry();
  const rows = [
    { name: "Ines Martins", status: "Green", score: String(live.readiness) },
    { name: "Diego Alvarez", status: "HR drift", score: "4.2" },
    { name: "Marta Kovac", status: "Threshold", score: "73" }
  ];
  return (
    <div className="relative z-[1] flex h-full flex-col">
      <Chrome title="Coach OS" />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-4">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-eos-on-surface-muted">
            {e.coachSignal}
          </p>
          <span className="inline-flex items-center gap-1 rounded border border-eos-telemetry/30 px-1.5 py-0.5 font-mono text-[8px] text-eos-telemetry">
            <Users className="h-3 w-3" aria-hidden />
            {e.coachSignalBadge}
          </span>
        </div>
        <p className="font-display text-3xl leading-none text-eos-on-surface">
          {e.coachSignalValue}
          <span className="ml-1 font-mono text-xs text-eos-on-surface-muted">{e.coachSignalUnit}</span>
        </p>
        <ul className="mt-5 divide-y divide-white/10 border-y border-white/10">
          {rows.map((row) => (
            <li key={row.name} className="flex items-baseline justify-between gap-3 py-2.5">
              <span>
                <span className="block text-sm font-semibold text-eos-on-surface">{row.name}</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-eos-on-surface-subtle">
                  {row.status}
                </span>
              </span>
              <span className="font-mono text-sm text-eos-voltline">{row.score}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function TogetherScreen() {
  const e = useLocale().landingEditorial.heroElite;
  const live = useLiveDemoTelemetry();
  return (
    <div className="relative z-[1] flex h-full flex-col">
      <Chrome title={e.liveSession} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-4 py-4">
        <div className="flex items-start justify-between gap-2">
          <p className="font-display text-lg font-semibold leading-tight text-eos-on-surface">
            {e.liveSessionTitle}
          </p>
          <span className="inline-flex items-center gap-1 rounded-full border border-eos-voltline/25 px-2 py-0.5 font-mono text-[8px] uppercase text-eos-voltline">
            <Radio className="h-3 w-3" aria-hidden />
            {e.liveBadge}
          </span>
        </div>
        {[
          { label: e.telemetryHrv, value: `${live.hrvMs} ms` },
          { label: e.telemetryLoad, value: live.load.toFixed(2) }
        ].map((row) => (
          <div key={row.label} className="flex justify-between font-mono text-[10px] uppercase text-eos-on-surface-muted">
            <span>{row.label}</span>
            <span className="text-eos-telemetry">{row.value}</span>
          </div>
        ))}
        <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-eos-on-surface-muted">
              {e.coachAction}
            </span>
            <ShieldCheck className="h-4 w-4 text-eos-performance" aria-hidden />
          </div>
          <p className="text-xs leading-5 text-eos-on-surface-muted">{e.coachActionBody}</p>
        </div>
      </div>
    </div>
  );
}
