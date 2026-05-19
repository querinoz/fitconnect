"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { IRealtimeTransport } from "@/lib/platform/ports/realtime";
import { resolveTransport } from "@/lib/platform/realtime/resolve-transport";
import type { RealtimeMessage } from "./types";

export function useChannel(name: string) {
  const transportRef = useRef<IRealtimeTransport | null>(null);
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);

  const send = useCallback(
    (m: RealtimeMessage) => {
      transportRef.current?.publish(name, m);
    },
    [name]
  );

  useEffect(() => {
    const transport = resolveTransport(name);
    transportRef.current = transport;
    const unsub = transport.subscribe(name, (m) =>
      setMessages((prev) => [...prev, m])
    );
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
