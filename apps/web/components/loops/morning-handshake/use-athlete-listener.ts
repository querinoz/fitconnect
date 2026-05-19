"use client";

import { useEffect, useState } from "react";
import { useChannel } from "@/lib/realtime/use-channel";
import type { PlanUpdate } from "@/lib/realtime/types";

export function useAthleteListener(athleteId: string) {
  const ch = useChannel(`athlete:${athleteId}`);
  const [pendingDiff, setPendingDiff] = useState<PlanUpdate | null>(null);

  useEffect(() => {
    const last = ch.messages.at(-1);
    if (
      last &&
      last.kind === "plan-update" &&
      last.athleteId === athleteId
    ) {
      setPendingDiff(last);
    }
  }, [ch.messages, athleteId]);

  return {
    pendingDiff,
    dismiss: () => setPendingDiff(null)
  };
}
