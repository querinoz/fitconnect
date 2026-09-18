/**
 * V10.2 Adaptive Training Engine — rule-bound session adaptation.
 * Extends sport-intelligence; never silently mutates active plans.
 */

import type { Confidence } from "@/lib/sports-intelligence/events";
import type { TrainingLoadView } from "@/lib/sports-intelligence/training-load";

export type AdaptationAction =
  | "KEEP"
  | "REDUCE_VOLUME"
  | "REDUCE_INTENSITY"
  | "EXTEND_REST"
  | "SWAP_TO_RECOVERY"
  | "DELOAD_SUGGEST";

export type ExplainableAdaptation = {
  action: AdaptationAction;
  what: string;
  why: string;
  data: string[];
  confidence: Confidence;
  requiresConfirm: true;
  autoApplied: false;
};

export function recommendSessionAdaptation(input: {
  trainingLoad: TrainingLoadView;
  readinessScore: number | null;
  readinessState: Confidence;
  availableMin: number | null;
  plannedDurationMin: number;
}): ExplainableAdaptation {
  const data: string[] = [
    `load=${input.trainingLoad.label}`,
    `acwr=${input.trainingLoad.acwr ?? "n/a"}`,
    `readiness=${input.readinessScore ?? input.readinessState}`,
    `plannedMin=${input.plannedDurationMin}`
  ];

  if (input.trainingLoad.label === "SPIKE") {
    return {
      action: "REDUCE_VOLUME",
      what: "Reduce planned volume by ~20–30% or swap to recovery session",
      why: "Acute:chronic workload ratio in SPIKE band",
      data,
      confidence: "MEDIUM",
      requiresConfirm: true,
      autoApplied: false
    };
  }

  if (
    input.readinessScore != null &&
    input.readinessScore < 45 &&
    input.readinessState !== "NOT_AVAILABLE"
  ) {
    return {
      action: "SWAP_TO_RECOVERY",
      what: "Prefer recovery / technique session over high intensity",
      why: "Readiness score below caution threshold",
      data,
      confidence: input.readinessState,
      requiresConfirm: true,
      autoApplied: false
    };
  }

  if (
    input.availableMin != null &&
    input.availableMin > 0 &&
    input.availableMin < input.plannedDurationMin * 0.7
  ) {
    return {
      action: "REDUCE_VOLUME",
      what: "Shorten session to fit available time",
      why: "Available time materially below planned duration",
      data: [...data, `availableMin=${input.availableMin}`],
      confidence: "HIGH",
      requiresConfirm: true,
      autoApplied: false
    };
  }

  if (input.trainingLoad.label === "HIGH") {
    return {
      action: "EXTEND_REST",
      what: "Extend rest intervals; keep intensity unless athlete confirms cut",
      why: "Elevated training load without SPIKE",
      data,
      confidence: "MEDIUM",
      requiresConfirm: true,
      autoApplied: false
    };
  }

  return {
    action: "KEEP",
    what: "Keep planned session",
    why: "No rule-bound adaptation triggers",
    data,
    confidence:
      input.trainingLoad.confidence === "NOT_AVAILABLE" ? "LOW" : input.trainingLoad.confidence,
    requiresConfirm: true,
    autoApplied: false
  };
}
