"use client";

import type { AICoPilotAlert } from "@/lib/realtime/types";
import { GlassCard } from "@/components/ui-glass/glass-card";
import { VoltButton } from "@/components/ui-glass/volt-button";
import { Pill } from "@/components/ui-glass/pill";

const RULE_LABEL: Record<AICoPilotAlert["rule"], string> = {
  "hrv-down": "HRV trend",
  "sleep-low": "Sleep deficit",
  "missed-sessions": "Adherence risk"
};

export function AlertCard({
  alert,
  athleteName,
  onApprove,
  onOpenAthlete
}: {
  alert: AICoPilotAlert;
  athleteName: string;
  onApprove: (a: AICoPilotAlert) => void;
  onOpenAthlete: (athleteId: string) => void;
}) {
  return (
    <GlassCard tone="default" className="space-y-3">
      <div className="flex items-center gap-2">
        <Pill variant="amber">Co-pilot</Pill>
        <span className="text-xs uppercase tracking-[0.18em] text-ink-400">
          {RULE_LABEL[alert.rule]} · {athleteName}
        </span>
      </div>
      <p className="text-sm text-ink-200">{alert.body}</p>
      <div className="flex gap-2 flex-wrap">
        <VoltButton type="button" onClick={() => onApprove(alert)}>
          Approve
        </VoltButton>
        <button
          type="button"
          onClick={() => onOpenAthlete(alert.athleteId)}
          className="h-11 px-4 rounded-full bg-glass-md border border-glass-border text-sm font-semibold hover:bg-glass-hi"
        >
          Open athlete
        </button>
      </div>
    </GlassCard>
  );
}
