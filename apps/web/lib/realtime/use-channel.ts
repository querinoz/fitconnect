"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getBroadcastTransport } from "@/lib/platform/realtime/broadcast-transport";
import { getConvexTransport } from "@/lib/platform/realtime/convex-transport";
import type { IRealtimeTransport } from "@/lib/platform/ports/realtime";
import { getRealtimeProvider } from "@/lib/platform/stack";
import type { RealtimeMessage } from "./types";

function resolveTransport(): IRealtimeTransport {
  const provider = getRealtimeProvider();
  switch (provider) {
    case "convex":
      return getConvexTransport();
    case "broadcast":
    default:
      return getBroadcastTransport();
  }
}

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
    const transport = resolveTransport();
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
