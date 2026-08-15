"use client";

import { useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n-provider";

type Tab = "home" | "discover" | "activity" | "community" | "profile";
type Frame = "android" | "iphone";
type ActivityPhase = "idle" | "running" | "paused" | "ended";

const FRAMES: Record<Frame, { w: number; h: number }> = {
  android: { w: 412, h: 915 },
  iphone: { w: 390, h: 844 }
};

export function EliteMobileCockpit() {
  const reduce = useReducedMotion();
  const copy = useLocale().mobileApp.cockpit;
  const [frame, setFrame] = useState<Frame>("android");
  const [tab, setTab] = useState<Tab>("home");
  const [phase, setPhase] = useState<ActivityPhase>("idle");
  const size = FRAMES[frame];

  const tabs = useMemo(
    () =>
      [
        { id: "home" as const, label: copy.home },
        { id: "discover" as const, label: copy.discover },
        { id: "activity" as const, label: copy.activity },
        { id: "community" as const, label: copy.community },
        { id: "profile" as const, label: copy.profile }
      ] as const,
    [copy]
  );

  return (
    <div className="flex min-h-[100dvh] flex-col items-center bg-eos-floor px-4 py-8 text-eos-on-surface">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-eos-voltline">
        Elite OS · {copy.demo}
      </p>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          className={cn(
            "min-h-11 rounded-full border px-4 font-mono text-xs uppercase tracking-wider",
            frame === "android"
              ? "border-eos-voltline bg-eos-voltline/15 text-eos-voltline"
              : "border-eos-on-surface/20 text-eos-on-surface-muted"
          )}
          onClick={() => setFrame("android")}
        >
          {copy.androidFrame}
        </button>
        <button
          type="button"
          className={cn(
            "min-h-11 rounded-full border px-4 font-mono text-xs uppercase tracking-wider",
            frame === "iphone"
              ? "border-eos-voltline bg-eos-voltline/15 text-eos-voltline"
              : "border-eos-on-surface/20 text-eos-on-surface-muted"
          )}
          onClick={() => setFrame("iphone")}
        >
          {copy.iphoneFrame}
        </button>
      </div>
      <div
        role="img"
        aria-label={copy.frameAria}
        data-testid="elite-mobile-frame"
        data-frame={frame}
        className="mt-6 overflow-hidden rounded-[2rem] border border-eos-voltline/25 bg-[#0b101c] shadow-[0_0_80px_rgba(200,255,0,0.08)]"
        style={{ width: size.w, maxWidth: "100%", height: "min(86dvh, " + size.h + "px)" }}
      >
        <div className="flex h-full flex-col">
          <header className="flex items-center justify-between px-5 pt-5">
            <span className="font-display text-lg font-bold tracking-tight">FitConnect</span>
            <span className="font-mono text-[10px] text-eos-voltline">{copy.demo}</span>
          </header>
          <div
            className={cn(
              "min-h-0 flex-1 overflow-y-auto px-5 py-4",
              reduce && "scroll-auto"
            )}
          >
            {tab === "home" ? (
              <HomePane copy={copy} onStart={() => { setTab("activity"); setPhase("running"); }} />
            ) : null}
            {tab === "discover" ? <DiscoverPane copy={copy} /> : null}
            {tab === "activity" ? (
              <ActivityPane copy={copy} phase={phase} setPhase={setPhase} />
            ) : null}
            {tab === "community" ? (
              <p className="text-sm text-eos-on-surface-muted">{copy.emptyFeed}</p>
            ) : null}
            {tab === "profile" ? (
              <div className="space-y-2">
                <p className="font-display text-2xl">Inês Martins</p>
                <p className="font-mono text-xs uppercase text-eos-connect">{copy.role}</p>
                <p className="text-sm text-eos-on-surface-muted">{copy.sport}</p>
              </div>
            ) : null}
          </div>
          <nav
            aria-label={copy.home}
            className="grid grid-cols-5 gap-1 border-t border-white/10 px-2 py-3"
          >
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                className={cn(
                  "min-h-11 rounded-lg font-mono text-[10px] uppercase tracking-wide",
                  tab === item.id ? "text-eos-voltline" : "text-eos-on-surface-muted"
                )}
                onClick={() => setTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

function HomePane({
  copy,
  onStart
}: {
  copy: ReturnType<typeof useLocale>["mobileApp"]["cockpit"];
  onStart: () => void;
}) {
  return (
    <div className="space-y-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-eos-telemetry">
        {copy.prime}
      </p>
      <p className="font-display text-6xl font-extrabold leading-none text-eos-voltline">88</p>
      <section>
        <h2 className="font-mono text-[10px] uppercase tracking-wider text-eos-on-surface-muted">
          {copy.means}
        </h2>
        <p className="mt-1 text-sm">{copy.meansBody}</p>
      </section>
      <section>
        <h2 className="font-mono text-[10px] uppercase tracking-wider text-eos-on-surface-muted">
          {copy.todo}
        </h2>
        <p className="mt-1 text-sm">{copy.todoBody}</p>
      </section>
      <button
        type="button"
        className="min-h-12 w-full rounded-xl bg-eos-voltline font-display text-sm font-bold text-eos-floor"
        onClick={onStart}
      >
        {copy.start}
      </button>
    </div>
  );
}

function DiscoverPane({
  copy
}: {
  copy: ReturnType<typeof useLocale>["mobileApp"]["cockpit"];
}) {
  const [booked, setBooked] = useState(false);
  return (
    <div className="space-y-3">
      <p className="font-display text-xl">{copy.coachName}</p>
      <p className="font-mono text-xs text-eos-connect">Run · 4.9</p>
      <button
        type="button"
        className="min-h-11 w-full rounded-xl border border-eos-voltline/40 font-mono text-xs uppercase tracking-wider text-eos-voltline"
        onClick={() => setBooked(true)}
      >
        {booked ? copy.demo : copy.book}
      </button>
      {booked ? (
        <p className="font-mono text-xs text-eos-performance">PENDING · {copy.demo}</p>
      ) : null}
    </div>
  );
}

function ActivityPane({
  copy,
  phase,
  setPhase
}: {
  copy: ReturnType<typeof useLocale>["mobileApp"]["cockpit"];
  phase: ActivityPhase;
  setPhase: (p: ActivityPhase) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="font-mono text-3xl text-eos-telemetry">
        {phase === "idle" ? "00:00" : "05:42"}
      </p>
      <p className="text-sm text-eos-on-surface-muted">{copy.gps}</p>
      <div className="flex flex-wrap gap-2">
        {phase === "idle" || phase === "ended" ? (
          <button
            type="button"
            className="min-h-11 rounded-xl bg-eos-voltline px-4 font-display text-sm font-bold text-eos-floor"
            onClick={() => setPhase("running")}
          >
            {copy.start}
          </button>
        ) : null}
        {phase === "running" ? (
          <button
            type="button"
            className="min-h-11 rounded-xl border border-eos-on-surface/30 px-4 font-mono text-xs uppercase"
            onClick={() => setPhase("paused")}
          >
            {copy.pause}
          </button>
        ) : null}
        {phase === "paused" ? (
          <button
            type="button"
            className="min-h-11 rounded-xl bg-eos-voltline px-4 font-display text-sm font-bold text-eos-floor"
            onClick={() => setPhase("running")}
          >
            {copy.resume}
          </button>
        ) : null}
        {phase === "running" || phase === "paused" ? (
          <button
            type="button"
            className="min-h-11 rounded-xl border border-eos-alert/40 px-4 font-mono text-xs uppercase text-eos-alert"
            onClick={() => setPhase("ended")}
          >
            {copy.end}
          </button>
        ) : null}
      </div>
    </div>
  );
}
