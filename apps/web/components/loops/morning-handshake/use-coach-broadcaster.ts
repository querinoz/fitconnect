"use client";

import { useChannel } from "@/lib/realtime/use-channel";
import type { PlanUpdate } from "@/lib/realtime/types";
import { resolveTransport } from "@/lib/platform/realtime/resolve-transport";

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
      resolveTransport(`athlete:${p.athleteId}`).publish(`athlete:${p.athleteId}`, msg);
    }
  };
}
