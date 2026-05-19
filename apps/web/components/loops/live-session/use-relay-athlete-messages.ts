"use client";

import { useEffect, useRef } from "react";
import { useChannel } from "@/lib/realtime/use-channel";
import { isRealtimeMessage } from "@/lib/realtime/types";
import { applyMessage } from "@/lib/realtime/handlers";

/**
 * Applies realtime payloads from an athlete channel into the dashboard store (coach tab).
 * Skips messages already in the buffer when the observer mounts to avoid replaying history.
 */
export function useRelayAthleteRealtime(athleteId: string) {
  const ch = useChannel(`athlete:${athleteId}`);
  const consumed = useRef(0);

  useEffect(() => {
    consumed.current = ch.messages.length;
  }, [athleteId]);

  useEffect(() => {
    while (consumed.current < ch.messages.length) {
      const m = ch.messages[consumed.current];
      consumed.current += 1;
      if (isRealtimeMessage(m)) applyMessage(m);
    }
  }, [ch.messages]);
}
