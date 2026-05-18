"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LocalChannel } from "./local-channel";
import type { RealtimeMessage } from "./types";

export function useChannel(name: string) {
  const ref = useRef<LocalChannel | null>(null);
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);

  const send = useCallback((m: RealtimeMessage) => {
    ref.current?.send(m);
  }, []);

  useEffect(() => {
    const ch = new LocalChannel(name);
    ref.current = ch;
    const unsub = ch.subscribe((m) => setMessages((prev) => [...prev, m]));
    return () => {
      unsub();
      ch.close();
      ref.current = null;
    };
  }, [name]);

  return {
    messages,
    send
  };
}
