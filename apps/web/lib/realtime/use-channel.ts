"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { IRealtimeTransport } from "@/lib/platform/ports/realtime";
import { resolveTransport } from "@/lib/platform/realtime/resolve-transport";
import { canPublishRealtime, realtimeEventKey } from "./channel-policy";
import type { RealtimeMessage } from "./types";

export function useChannel(name: string) {
  const transportRef = useRef<IRealtimeTransport | null>(null);
  const seenRef = useRef(new Set<string>());
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);

  const send = useCallback(
    (m: RealtimeMessage) => {
      if (!canPublishRealtime(name, m)) return;
      transportRef.current?.publish(name, m);
    },
    [name]
  );

  useEffect(() => {
    const transport = resolveTransport(name);
    transportRef.current = transport;
    seenRef.current = new Set();
    const unsub = transport.subscribe(name, (m) => {
      if (!canPublishRealtime(name, m)) return;
      const key = realtimeEventKey(m);
      if (seenRef.current.has(key)) return;
      seenRef.current.add(key);
      setMessages((prev) => [...prev, m]);
    });
    return () => {
      unsub();
      transportRef.current = null;
    };
  }, [name]);

  return {
    messages,
    send
  };
}
