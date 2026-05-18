"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useChannel } from "@/lib/realtime/use-channel";
import { startTicker } from "@/lib/realtime/synthetic";
import { applyMessage } from "@/lib/realtime/handlers";
import type { LiveSessionIntent } from "@/lib/dashboard/types";
import type { LiveTick, SessionEnd, SessionStart } from "@/lib/realtime/types";

export function useLiveSession({
  athleteId,
  intent
}: {
  athleteId: string;
  intent: LiveSessionIntent;
}) {
  const { send } = useChannel(`athlete:${athleteId}`);
  const [isActive, setActive] = useState(false);
  const [ticks, setTicks] = useState<LiveTick[]>([]);
  const stopRef = useRef<(() => void) | null>(null);
  const ticksRef = useRef<LiveTick[]>([]);

  const start = useCallback(() => {
    ticksRef.current = [];
    setTicks([]);
    setActive(true);
    const sessionStart: SessionStart = {
      kind: "session-start",
      athleteId,
      sessionId: `live-${Date.now()}`,
      at: new Date().toISOString()
    };
    send(sessionStart);
    applyMessage(sessionStart);
    stopRef.current = startTicker({
      athleteId,
      intent,
      intervalMs: 1500,
      sendTick: (t) => {
        ticksRef.current = [...ticksRef.current, t];
        setTicks((p) => [...p, t]);
        send(t);
        applyMessage(t);
      }
    });
  }, [athleteId, intent, send]);

  const end = useCallback(() => {
    stopRef.current?.();
    stopRef.current = null;
    setActive(false);
    const timeline = ticksRef.current;
    const last = timeline.at(-1);
    const sessionEnd: SessionEnd = {
      kind: "session-end",
      athleteId,
      sessionId: `live-${Date.now()}`,
      summary: {
        distanceKm: Number(
          (((last?.elapsedSec ?? 0) / 60) * (60 / 4.5) / 10).toFixed(1)
        ),
        avgHr: timeline.length
          ? Math.round(timeline.reduce((s, t) => s + t.hr, 0) / timeline.length)
          : 0,
        maxHr: timeline.reduce((m, t) => Math.max(m, t.hr), 0),
        durationSec: last?.elapsedSec ?? 0
      },
      at: new Date().toISOString()
    };
    send(sessionEnd);
    applyMessage(sessionEnd);
  }, [send, athleteId]);

  const last = ticks.at(-1);
  return useMemo(
    () => ({
      isActive,
      ticks,
      hr: last?.hr ?? 0,
      pace: last?.pace ?? 0,
      cadence: last?.cadence ?? 0,
      elapsedSec: last?.elapsedSec ?? 0,
      start,
      end
    }),
    [isActive, ticks, last, start, end]
  );
}
