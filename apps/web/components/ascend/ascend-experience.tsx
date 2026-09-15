"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BentoCard } from "@/components/elite-os/bento-card";
import { DailyMissions } from "@/components/gamification/gamification-panel";
import { listLocalHistory } from "@/lib/train/persistence";
import { getTrainPlan } from "@/lib/train/catalog";
import { formatTimer } from "@/lib/train/machine";

type ProgressionPayload = {
  source?: string;
  progression?: {
    totalXp: number;
    streakDays: number;
    badges: string[];
    level?: { level: number; rankLabel?: string };
  };
  error?: string;
};

export function AscendExperience() {
  const [payload, setPayload] = useState<ProgressionPayload | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading");
  const history = typeof window === "undefined" ? [] : listLocalHistory();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/v1/ascend/progression", { credentials: "include" });
        if (res.status === 503) {
          if (!cancelled) setStatus("unavailable");
          return;
        }
        if (!res.ok) {
          if (!cancelled) setStatus("unavailable");
          return;
        }
        const body = (await res.json()) as ProgressionPayload;
        if (!cancelled) {
          setPayload(body);
          setStatus("ready");
        }
      } catch {
        if (!cancelled) setStatus("unavailable");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const xp = payload?.progression?.totalXp ?? 0;
  const level = payload?.progression?.level?.level ?? 1;
  const streak = payload?.progression?.streakDays ?? 0;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6" data-testid="ascend-experience">
      <header className="space-y-2">
        <p className="eos-label-caps text-eos-voltline">ASCEND</p>
        <h1 className="eos-headline text-4xl italic">Progress you actually earned.</h1>
        <p className="text-sm text-eos-on-surface-muted">
          XP comes from completed TRAIN sessions and missions that persist. Decorative scores are not shown.
        </p>
      </header>

      <BentoCard label="PROGRESSION" elevation="2">
        {status === "loading" ? <p>Loading progression…</p> : null}
        {status === "unavailable" ? (
          <div className="space-y-2">
            <p className="eos-headline text-3xl">DATA UNAVAILABLE</p>
            <p className="text-sm text-eos-on-surface-muted">
              Cloud Ascend is not configured. Device TRAIN history below is still yours.
            </p>
          </div>
        ) : null}
        {status === "ready" ? (
          <div className="space-y-3">
            <p className="eos-headline text-5xl text-eos-voltline">{xp} XP</p>
            <p className="text-sm">
              Level {level}
              {payload?.progression?.level?.rankLabel ? ` · ${payload.progression.level.rankLabel}` : ""} ·{" "}
              {streak}d streak
            </p>
            <p className="text-xs uppercase tracking-wider text-eos-on-surface-muted">
              Source: {payload?.source ?? "unknown"}
            </p>
          </div>
        ) : null}
      </BentoCard>

      <BentoCard label="TRAIN ON THIS DEVICE">
        {history.length === 0 ? (
          <p className="text-sm text-eos-on-surface-muted">
            No completed sessions on this device yet.{" "}
            <Link className="text-eos-telemetry underline-offset-4 hover:underline" href="/train">
              Open TRAIN
            </Link>
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {history.slice(0, 8).map((item) => (
              <li key={item.sessionId}>
                {getTrainPlan(item.planId)?.title ?? item.planId} ·{" "}
                {formatTimer(Math.floor(item.durationMs / 1000))} · {item.sets} sets · {item.saveStatus}
              </li>
            ))}
          </ul>
        )}
      </BentoCard>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-eos-on-surface-muted">
          Local missions — they write to Ascend when the API is available. Completing them does not invent recovery.
        </p>
        <DailyMissions />
      </div>
    </div>
  );
}
