"use client";

import { GlassCard } from "@/components/ui-glass/glass-card";
import { VoltButton } from "@/components/ui-glass/volt-button";
import { Pill } from "@/components/ui-glass/pill";
import { MorphCard } from "@/components/shell/morph-card";
import type { LiveSessionIntent } from "@/lib/dashboard/types";

export function SessionCard({
  title,
  durationMin,
  intent,
  morphId,
  onStart
}: {
  title: string;
  durationMin: number;
  intent: LiveSessionIntent;
  morphId?: string;
  onStart: () => void;
}) {
  const inner = (
    <GlassCard tone="default" className="flex items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Pill>Today</Pill>
          <span className="text-xs uppercase tracking-[0.18em] text-ink-400">
            {intent}
          </span>
        </div>
        <p className="text-lg font-semibold">{title}</p>
        <p className="text-sm text-ink-300">{durationMin} min</p>
      </div>
      <VoltButton type="button" onClick={onStart}>
        Start
      </VoltButton>
    </GlassCard>
  );
  return morphId ? <MorphCard morphId={morphId}>{inner}</MorphCard> : inner;
}
