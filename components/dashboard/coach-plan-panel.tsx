"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useT } from "@/lib/i18n-provider";
import type { CoachPlan } from "@/lib/dashboard/types";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type CoachPlanPanelProps = {
  plan: CoachPlan;
  editable?: boolean;
  onToggleBlock?: (blockId: string) => void;
};

export function CoachPlanPanel({
  plan,
  editable = false,
  onToggleBlock
}: CoachPlanPanelProps) {
  const t = useT();

  return (
    <Card id="coach-plan" className="scroll-mt-24">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base sm:text-lg">
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-plasma-400" />
            {t("dashboard", "coachPlanTitle")}
          </span>
          <Badge className="bg-plasma-500/10 text-plasma-300 ring-plasma-500/30">
            {plan.weekLabel}
          </Badge>
        </CardTitle>
        <p className="text-sm text-ink-400">{t("dashboard", "coachPlanSubtitle")}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-plasma-500/25 bg-plasma-500/5 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-plasma-300">
            {plan.approvedLabel}
          </p>
          <p className="mt-2 text-sm text-ink-200 leading-relaxed">{plan.aiSuggestion}</p>
        </div>

        <ul className="space-y-2">
          {plan.blocks.map((block) => (
            <li key={block.id}>
              <button
                type="button"
                disabled={!editable && !onToggleBlock}
                onClick={() => onToggleBlock?.(block.id)}
                className={cn(
                  "w-full text-left flex items-start gap-3 rounded-xl border border-ink-800 bg-ink-950/40 p-3 sm:p-4 transition-colors",
                  onToggleBlock && "hover:border-brand-400/40 active:scale-[0.99]",
                  block.completed && "border-accent-500/30 bg-accent-500/5"
                )}
              >
                {block.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-accent-400 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="h-5 w-5 text-ink-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-300">
                      {block.day}
                    </span>
                    <Badge className="text-[10px] ring-1 ring-ink-700 bg-ink-900/60">
                      {block.intensity}
                    </Badge>
                  </div>
                  <p className="font-semibold text-ink-100 mt-1">{block.title}</p>
                  <p className="text-xs text-ink-400 mt-0.5">{block.detail}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
