"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Link2,
  RefreshCw,
  Zap
} from "lucide-react";
import {
  AIInsight,
  PremiumCard,
  RealtimeBadge,
  SectionHeader
} from "@/components/ui-glass/premium-system";
import { liquidPress } from "@/lib/motion/liquid";
import { cn } from "@/lib/utils";
import { StravaBrandedCard } from "@/components/sharing/strava-branded-card";
import { StravaActivityMap } from "@/components/dashboard/strava-activity-map";
import { getSportMeta } from "@fitconnect/types";

type ProviderRow = {
  id: string;
  label: string;
  category: string;
  metrics: string[];
  oauth: boolean;
  status: string;
  lastSyncAt: string | null;
  configured?: boolean;
};

type StatusPayload = {
  providers: ProviderRow[];
  strava: {
    connected: boolean;
    lastSyncAt: string | null;
    syncLabel?: string;
    activityCount: number;
    activities: {
      id: string;
      name: string;
      type: string;
      distanceM: number;
      movingTimeSec: number;
      startDate: string;
      avgHr?: number;
      mapPolyline?: string;
    }[];
    rateLimit: {
      fifteenMin: { used: number; limit: number };
      daily: { used: number; limit: number };
    };
  };
  syncLogs: { id: string; provider: string; at: string; action: string; ok: boolean; detail?: string }[];
};

function fmtDistance(m: number) {
  if (m <= 0) return "—";
  return `${(m / 1000).toFixed(1)} km`;
}

function fmtDuration(sec: number) {
  const m = Math.floor(sec / 60);
  return `${m} min`;
}

export function IntegrationsHub({ athleteId }: { athleteId: string }) {
  const [data, setData] = useState<StatusPayload | null>(null);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/v1/integrations/status?athleteId=${encodeURIComponent(athleteId)}`);
    if (res.ok) setData(await res.json());
  }, [athleteId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function syncStrava() {
    setSyncing(true);
    try {
      await fetch("/api/v1/integrations/strava/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ athleteId })
      });
      await load();
    } finally {
      setSyncing(false);
    }
  }

  if (!data) {
    return (
      <PremiumCard className="p-4 animate-pulse">
        <p className="text-sm text-ink-400">Loading integrations…</p>
      </PremiumCard>
    );
  }

  const stravaPct = Math.round(
    (data.strava.rateLimit.fifteenMin.used / data.strava.rateLimit.fifteenMin.limit) * 100
  );

  return (
    <section className="space-y-4">
      <SectionHeader
        eyebrow="API monitor"
        title="Connected sports data"
        body="Strava, wearables and live sync — monitored from your dashboard."
        action={<RealtimeBadge>Live API</RealtimeBadge>}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {data.providers.map((p, i) => (
          <motion.div key={p.id} {...liquidPress} style={{ animationDelay: `${i * 60}ms` }}>
            <PremiumCard
              tone={p.status === "connected" ? "volt" : "neutral"}
              interactive
              className="p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-500">
                    {p.category}
                  </p>
                  <p className="mt-1 font-display text-lg font-bold text-ink-50">{p.label}</p>
                  <p className="mt-1 text-[10px] text-ink-400">{p.metrics.join(" · ")}</p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wider",
                    p.status === "connected"
                      ? "bg-volt-500/15 text-volt-300"
                      : "bg-ink-800 text-ink-500"
                  )}
                >
                  {p.status}
                </span>
              </div>
              {p.id === "strava" && p.status !== "connected" && (
                <Link
                  href={`/api/v1/integrations/strava/connect?athleteId=${encodeURIComponent(athleteId)}`}
                  className="mt-3 inline-flex h-9 items-center gap-2 rounded-full bg-grad-pulse px-4 text-xs font-semibold text-ink-950 fc-liquid-btn"
                >
                  <Link2 className="h-3.5 w-3.5" />
                  Connect Strava
                </Link>
              )}
            </PremiumCard>
          </motion.div>
        ))}
      </div>

      {data.strava.connected && (
        <PremiumCard tone="brand" className="space-y-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-300">
                Strava · API monitor
              </p>
              <p className="mt-1 font-display text-xl font-bold text-ink-50">
                {data.strava.activityCount} recent activities
              </p>
              <p className="text-xs text-ink-400">
                {data.strava.syncLabel ??
                  (data.strava.lastSyncAt
                    ? `Last sync ${new Date(data.strava.lastSyncAt).toLocaleString()}`
                    : "Not synced yet")}
              </p>
            </div>
            <motion.button
              type="button"
              {...liquidPress}
              disabled={syncing}
              onClick={() => void syncStrava()}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-4 text-xs font-semibold text-brand-200 fc-liquid-glass"
            >
              <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
              Sync now
            </motion.button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-2xl border border-glass-border bg-ink-950/50 p-3 fc-liquid-glass">
              <p className="text-ink-500">15-min rate limit</p>
              <p className="mt-1 font-bold text-ink-50">
                {data.strava.rateLimit.fifteenMin.used}/{data.strava.rateLimit.fifteenMin.limit}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-400 to-volt-400 transition-all"
                  style={{ width: `${stravaPct}%` }}
                />
              </div>
            </div>
            <div className="rounded-2xl border border-glass-border bg-ink-950/50 p-3 fc-liquid-glass">
              <p className="text-ink-500">Daily quota</p>
              <p className="mt-1 font-bold text-ink-50">
                {data.strava.rateLimit.daily.used}/{data.strava.rateLimit.daily.limit}
              </p>
            </div>
          </div>

          <ul className="space-y-2">
            {data.strava.activities.map((a) => {
              const meta = getSportMeta(a.type);
              return (
              <li
                key={a.id}
                className="space-y-2 rounded-2xl border border-glass-border bg-ink-950/40 px-3 py-2.5 fc-liquid-glass fc-liquid-interactive"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink-50">{a.name}</p>
                    <p className="text-[10px] text-ink-400">
                      {meta.icon} {meta.labelPt} · {fmtDistance(a.distanceM)} · {fmtDuration(a.movingTimeSec)}
                      {a.avgHr ? ` · ${Math.round(a.avgHr)} bpm` : ""}
                    </p>
                  </div>
                  <Activity className="h-4 w-4 shrink-0 text-volt-400" />
                </div>
                {a.mapPolyline ? <StravaActivityMap polyline={a.mapPolyline} /> : null}
              </li>
            );
            })}
          </ul>

          {data.strava.activities[0] ? (
            <div className="space-y-2 border-t border-glass-border pt-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-400">
                Branded share card · stands out in Strava feed
              </p>
              <StravaBrandedCard
                athleteName="Demo athlete"
                activityName={data.strava.activities[0].name}
                sportType={data.strava.activities[0].type}
                distanceKm={data.strava.activities[0].distanceM / 1000}
                durationSec={data.strava.activities[0].movingTimeSec}
                avgHr={data.strava.activities[0].avgHr}
                elevationM={180}
                readinessScore={88}
                date={data.strava.activities[0].startDate}
              />
            </div>
          ) : null}
        </PremiumCard>
      )}

      <AIInsight
        title="Webhook-first sync recommended"
        body="Use Strava push subscriptions for live activity updates instead of polling — saves rate limit budget for coach review flows."
        action={
          <Link
            href="/settings/wearables"
            className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-plasma-300"
          >
            Manage all wearables
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      />

      {data.syncLogs.length > 0 && (
        <PremiumCard className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-500">
            Sync log
          </p>
          <ul className="mt-3 space-y-2">
            {data.syncLogs.map((log) => (
              <li key={log.id} className="flex items-center gap-2 text-[11px] text-ink-400">
                <Zap className={cn("h-3 w-3", log.ok ? "text-volt-400" : "text-signal-500")} />
                <span className="text-ink-300">{log.provider}</span>
                <span>{log.action}</span>
                <span className="ml-auto tabular-nums">
                  {new Date(log.at).toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
        </PremiumCard>
      )}
    </section>
  );
}
