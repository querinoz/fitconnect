"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronRight, Moon, Sparkles, Watch } from "lucide-react";
import { evaluateAthleteState } from "@fitconnect/zenith-core";
import { BentoCard } from "@/components/elite-os/bento-card";
import { EliteButton } from "@/components/elite-os/elite-button";
import { BodyText, LabelCaps } from "@/components/elite-os/typography";
import { cn } from "@/lib/utils";

export type InsightTelemetry = {
  hrvMs: number | null;
  baselineHrvMs: number | null;
  sleepHours: number | null;
  strainScore: number | null;
  plannedHighIntensity?: boolean;
};

type Decision = "accept" | "keep" | null;

function finite(n: number | null | undefined): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

export function AiInsightsPanel({ telemetry }: { telemetry?: InsightTelemetry }) {
  const [decision, setDecision] = useState<Decision>(null);
  const [whyOpen, setWhyOpen] = useState(false);

  const state = useMemo(() => {
    if (!telemetry) return null;
    return evaluateAthleteState({
      hrvMs: telemetry.hrvMs,
      baselineHrvMs: telemetry.baselineHrvMs,
      sleepHours: telemetry.sleepHours,
      strainScore: telemetry.strainScore,
      plannedHighIntensity: telemetry.plannedHighIntensity
    });
  }, [telemetry]);

  const primary = state?.recommendations[0];
  const missing =
    !telemetry ||
    (!finite(telemetry.hrvMs) && !finite(telemetry.sleepHours)) ||
    state?.readiness.state === "UNKNOWN" ||
    state?.recovery.state === "UNKNOWN";

  return (
    <BentoCard
      elevation="glass"
      padding="md"
      label={
        <span className="inline-flex items-center gap-2 text-eos-iris-soft">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Zenith
        </span>
      }
    >
      {missing || !primary ? (
        <div className="space-y-3">
          <LabelCaps className="text-eos-on-surface">Recovery needs your data</LabelCaps>
          <BodyText className="text-xs">
            HRV and sleep are not available yet. Connect Health Connect or a wearable to unlock
            recovery guidance. We never invent those metrics.
          </BodyText>
          <EliteButton asChild className="w-full" size="sm">
            <Link href="/settings/wearables">
              <Watch className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Connect a device
            </Link>
          </EliteButton>
        </div>
      ) : (
        <div
          className={cn(
            "rounded-[var(--eos-radius-nested)] border-l-2 bg-eos-elevated/90 p-3.5",
            primary.priority === "high" ? "border-eos-recovery" : "border-eos-voltline"
          )}
        >
          <div className="flex items-start gap-3">
            {primary.priority === "high" ? (
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-eos-recovery" />
            ) : (
              <Moon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-eos-telemetry" />
            )}
            <div className="min-w-0 space-y-2">
              <LabelCaps className="text-eos-on-surface">{primary.type.replaceAll("_", " ")}</LabelCaps>
              <BodyText className="text-xs">{primary.rationale}</BodyText>
              {primary.volumeMultiplier != null ? (
                <BodyText className="text-xs text-eos-voltline">
                  Suggested intensity: {Math.round(primary.volumeMultiplier * 100)}% of the planned
                  high-intensity block.
                </BodyText>
              ) : null}
              {decision ? (
                <p className="text-[10px] font-semibold uppercase tracking-wider text-eos-on-surface-muted">
                  {decision === "accept" ? "Adjustment accepted" : "Original plan kept"}
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <EliteButton type="button" size="sm" onClick={() => setDecision("accept")}>
                    Accept adjustment
                  </EliteButton>
                  <EliteButton
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setDecision("keep")}
                  >
                    Keep original
                  </EliteButton>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-eos-iris-soft"
                    onClick={() => setWhyOpen((v) => !v)}
                  >
                    Why? <ChevronRight className="h-2.5 w-2.5" />
                  </button>
                </div>
              )}
              {whyOpen ? (
                <BodyText className="text-[11px] text-eos-on-surface-muted">
                  {state.explainability.why || primary.expectedBenefit} Confidence{" "}
                  {state.explainability.confidence}%. {state.explainability.disclaimer}
                </BodyText>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </BentoCard>
  );
}
