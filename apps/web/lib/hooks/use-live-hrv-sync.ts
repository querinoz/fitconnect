"use client";

import { useEffect } from "react";
import { isDemoModeEnv } from "@/lib/auth/middleware-auth";
import { useDashboardStore } from "@/lib/dashboard-store";
import { resolveTransport } from "@/lib/platform/realtime/resolve-transport";

/** Subscribe to real vitals. Never invent HRV outside explicit LOCAL_DEMO. */
export function useLiveHrvSync(athleteId: string, enabled = true) {
  const ingest = useDashboardStore((s) => s.ingestHrvReading);

  useEffect(() => {
    if (!enabled || !athleteId) return;

    const channel = `athlete:${athleteId}:vitals`;
    const transport = resolveTransport(channel);

    const unsub = transport.subscribe(channel, (msg) => {
      if (msg.kind === "vitals" && msg.athleteId === athleteId) {
        ingest(athleteId, msg.hrvMs);
      }
    });

    if (!isDemoModeEnv(process.env.NEXT_PUBLIC_DEMO_MODE)) {
      return () => {
        unsub();
      };
    }

    const tick = () => {
      const athlete = useDashboardStore
        .getState()
        .athletes.find((a) => a.id === athleteId);
      if (!athlete) return;
      const delta = Math.random() > 0.5 ? 1 : -1;
      const hrvMs = Math.min(75, Math.max(45, athlete.hrv + delta));
      ingest(athleteId, hrvMs);
      transport.publish(channel, {
        kind: "vitals",
        athleteId,
        hrvMs,
        at: new Date().toISOString()
      });
    };

    const id = window.setInterval(tick, 45_000);
    return () => {
      window.clearInterval(id);
      unsub();
    };
  }, [athleteId, enabled, ingest]);
}

