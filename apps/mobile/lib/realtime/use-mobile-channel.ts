import { useCallback, useEffect, useRef, useState } from "react";

const API_BASE = process.env.EXPO_PUBLIC_WEB_URL ?? "http://localhost:3001";

export type RealtimePayload = Record<string, unknown> & { kind: string; at: string };

/** Mobile realtime bridge — polls web API when native Convex client unavailable. */
export function useMobileChannel(channel: string) {
  const [messages, setMessages] = useState<RealtimePayload[]>([]);
  const sinceRef = useRef(0);

  const send = useCallback(
    async (payload: RealtimePayload) => {
      setMessages((prev) => [...prev, payload]);
      await fetch(`${API_BASE}/api/v1/realtime/bridge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, payload })
      }).catch(() => undefined);
    },
    [channel]
  );

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/v1/realtime/bridge?channel=${encodeURIComponent(channel)}&since=${sinceRef.current}`
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          messages: { payload: RealtimePayload; at: number }[];
        };
        for (const row of data.messages) {
          sinceRef.current = Math.max(sinceRef.current, row.at);
          setMessages((prev) => [...prev, row.payload]);
        }
      } catch {
        // offline — ignore
      }
    };

    void poll();
    const id = setInterval(() => void poll(), 3000);
    return () => clearInterval(id);
  }, [channel]);

  return { messages, send };
}
