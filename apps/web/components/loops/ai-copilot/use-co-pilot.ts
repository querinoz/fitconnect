"use client";

import { useChannel } from "@/lib/realtime/use-channel";
import type { AICoPilotAlert, PlanUpdate } from "@/lib/realtime/types";
import { useDashboardStore, selectPlanForAthlete } from "@/lib/dashboard-store";

type QuickDiffKey = Exclude<PlanUpdate["diff"], "custom">;

const RECO_TO_DIFF: Record<AICoPilotAlert["recommendation"], QuickDiffKey> = {
  "lighter-day": "lighter-day",
  "swap-z2": "swap-z2",
  "recovery-day": "add-recovery"
};

export function useCoPilot(coachId: string) {
  const roster = useChannel(`roster:${coachId}`);

  return {
    approve: (alert: AICoPilotAlert) => {
      const plan = selectPlanForAthlete(useDashboardStore.getState(), alert.athleteId);
      if (!plan) return;
      const diff = RECO_TO_DIFF[alert.recommendation];
      const msg: PlanUpdate = {
        kind: "plan-update",
        planId: plan.id,
        athleteId: alert.athleteId,
        coachId,
        diff,
        at: new Date().toISOString(),
        origin: "co-pilot"
      };
      roster.send(msg);
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const bc = new BroadcastChannel(`athlete:${alert.athleteId}`);
        bc.postMessage(msg);
        bc.close();
      }
      useDashboardStore.getState().applyPlanDiff(plan.id, diff);
      useDashboardStore.getState().dismissAIAlert(alert.id);
    }
  };
}
