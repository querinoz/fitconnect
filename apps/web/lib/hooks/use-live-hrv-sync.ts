"use client";

import { useEffect } from "react";
import { useDashboardStore } from "@/lib/dashboard-store";
import { getBroadcastTransport } from "@/lib/platform/realtime/broadcast-transport";

/** Demo: simulates wearable HRV sync + cross-tab broadcast every 45s. */
export function useLiveHrvSync(athleteId: string, enabled = true) {
  const ingest = useDashboardStore((s) => s.ingestHrvReading);

  useEffect(() => {
    if (!enabled || !athleteId) return;

    const transport = getBroadcastTransport();
    const channel = `athlete:${athleteId}:vitals`;

    const unsub = transport.subscribe(channel, (msg) => {
      if (msg.kind === "vitals" && msg.athleteId === athleteId) {
        ingest(athleteId, msg.hrvMs);
      }
    });

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
