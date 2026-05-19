"use client";

import { useEffect, useState } from "react";
import type { ThreadMessage } from "@fitconnect/types";

export function useAthleteMessages(athleteId: string | undefined) {
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!athleteId) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/v1/messages?athleteId=${encodeURIComponent(athleteId)}`)
      .then((r) => r.json())
      .then((data: { messages: ThreadMessage[] }) => {
        if (!cancelled) setMessages(data.messages ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [athleteId]);

  return { messages, loading };
}
