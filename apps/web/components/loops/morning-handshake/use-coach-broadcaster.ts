"use client";

import { useChannel } from "@/lib/realtime/use-channel";
import type { PlanUpdate } from "@/lib/realtime/types";

export function useCoachBroadcaster(coachId: string) {
  const roster = useChannel(`roster:${coachId}`);
  return {
    publishDiff: (p: {
      planId: string;
      athleteId: string;
      diff: PlanUpdate["diff"];
    }) => {
      const msg: PlanUpdate = {
        kind: "plan-update",
        planId: p.planId,
        athleteId: p.athleteId,
        coachId,
        diff: p.diff,
        at: new Date().toISOString(),
        origin: "coach"
      };
      roster.send(msg);
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const ch = new BroadcastChannel(`athlete:${p.athleteId}`);
        ch.postMessage(msg);
        ch.close();
      }
    }
  };
}
