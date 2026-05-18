"use client";

import { useEffect, useState } from "react";
import { useChannel } from "@/lib/realtime/use-channel";
import type { Achievement, Reaction } from "@/lib/realtime/types";

export function useCelebrations(athleteId: string) {
  const ch = useChannel(`celebration:${athleteId}`);
  const [lastAchievement, setLast] = useState<Achievement | null>(null);
  const [reactions, setReactions] = useState<Reaction[]>([]);

  useEffect(() => {
    const m = ch.messages.at(-1);
    if (!m) return;
    if (m.kind === "achievement" && m.athleteId === athleteId) setLast(m);
    if (m.kind === "reaction" && m.athleteId === athleteId) {
      setReactions((p) => [...p, m]);
    }
  }, [ch.messages, athleteId]);

  return {
    lastAchievement,
    reactions,
    publishAchievement: (a: { title: string; metric: string; value: number }) =>
      ch.send({
        kind: "achievement",
        athleteId,
        title: a.title,
        metric: a.metric,
        value: a.value,
        at: new Date().toISOString()
      }),
    publishReaction: (
      achievementId: string,
      emoji: Reaction["emoji"],
      fromName: string
    ) =>
      ch.send({
        kind: "reaction",
        achievementId,
        athleteId,
        emoji,
        fromName,
        at: new Date().toISOString()
      }),
    clearAchievement: () => setLast(null)
  };
}
