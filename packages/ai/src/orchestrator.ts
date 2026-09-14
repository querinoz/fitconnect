/**
 * Zenith orchestrator — LLM interprets; scores come only from zenith-core.
 * Pipeline: ingest → normalize → validate → context → reason → safety → result.
 */

import { evaluateAthleteState, type AthleteStateInput } from "@fitconnect/zenith-core";
import type { MetricProvenance } from "@fitconnect/types";
import { resolveLlmProvider } from "./llm-provider";

export type ZenithSpecialist =
  | "recovery"
  | "training"
  | "performance"
  | "coach"
  | "sports"
  | "nutrition"
  | "injury_safety"
  | "social"
  | "planner";

export type LlmRoute = "local" | "remote" | "fallback";

export type ProvenancedMetric = {
  value: number | null;
  provenance: MetricProvenance;
};

export type ZenithOrchestratorInput = AthleteStateInput & {
  athleteId: string;
  specialist?: ZenithSpecialist;
  userText?: string;
};

export type ZenithOrchestratorResult = {
  specialist: ZenithSpecialist;
  engineVersion: string;
  metrics: {
    readiness: ProvenancedMetric;
    hrvMs: ProvenancedMetric;
    sleepHours: ProvenancedMetric;
  };
  explanation: string;
  actions: Array<{ type: string; requiresApproval: true; payload?: Record<string, unknown> }>;
  safety: { blocked: boolean; reasons: string[] };
  llmRoute: LlmRoute;
};

function metric(value: number | null, present: boolean): ProvenancedMetric {
  if (!present || value == null || !Number.isFinite(value)) {
    return { value: null, provenance: "MISSING" };
  }
  return { value, provenance: "CALCULATED" };
}

function pickSpecialist(input: ZenithOrchestratorInput): ZenithSpecialist {
  if (input.specialist) return input.specialist;
  const text = (input.userText ?? "").toLowerCase();
  if (/\binjur|pain|diagnos|doctor|clinic/.test(text)) return "injury_safety";
  if (/\brecover|sleep|hrv|rest/.test(text)) return "recovery";
  if (/\bcoach|roster|athlete plan/.test(text)) return "coach";
  if (/\bbook|calendar|plan tomorrow/.test(text)) return "planner";
  if (/\bfeed|kudos|squad/.test(text)) return "social";
  if (/\beat|nutrition|calorie/.test(text)) return "nutrition";
  if (/\bworkout|session|interval|z2/.test(text)) return "training";
  return "performance";
}

function safetyGate(specialist: ZenithSpecialist, userText: string | undefined): string[] {
  const reasons: string[] = [];
  if (specialist === "injury_safety") {
    reasons.push("Not a medical diagnosis — clinician review required.");
  }
  if (userText && /ignore (previous|all) instructions|system prompt/i.test(userText)) {
    reasons.push("Prompt-injection pattern ignored; user text treated as untrusted.");
  }
  return reasons;
}

export function resolveLlmRoute(env: NodeJS.Dict<string> = process.env): LlmRoute {
  if (env.ZENITH_LLM_ROUTE === "local") return "local";
  if (env.ZENITH_LLM_ROUTE === "fallback") return "fallback";
  const keys = [env.OPENAI_API_KEY, env.ANTHROPIC_API_KEY, env.GEMINI_API_KEY];
  if (keys.some((k) => k?.trim() && !k.includes("PASTE_"))) return "remote";
  return "fallback";
}

/**
 * Deterministic orchestrator. Does not call an LLM.
 * Explanation text is engine-derived; remote rewrite is a separate optional step.
 */
export function orchestrateZenith(
  input: ZenithOrchestratorInput,
  env: NodeJS.Dict<string> = process.env
): ZenithOrchestratorResult {
  const specialist = pickSpecialist(input);
  const state = evaluateAthleteState(input);
  const hrvPresent = input.hrvMs != null && Number.isFinite(input.hrvMs);
  const sleepPresent = input.sleepHours != null && Number.isFinite(input.sleepHours);
  const safetyReasons = safetyGate(specialist, input.userText);

  const explanation =
    specialist === "injury_safety"
      ? "Zenith will not diagnose injury. Share symptoms with a clinician. Training advice stays conservative."
      : specialist === "nutrition" && !input.userText
        ? "Nutrition specialist is data-gated — no meal log was provided."
        : state.explainability.what;

  const actions: ZenithOrchestratorResult["actions"] = [];
  if (specialist === "training" || specialist === "planner") {
    actions.push({
      type: "propose_plan_adjustment",
      requiresApproval: true,
      payload: { recommendation: state.recommendations[0]?.type ?? "MONITOR" }
    });
  }

  return {
    specialist,
    engineVersion: state.engineVersion,
    metrics: {
      readiness: metric(state.readiness.score, hrvPresent || sleepPresent),
      hrvMs: metric(input.hrvMs ?? null, hrvPresent),
      sleepHours: metric(input.sleepHours ?? null, sleepPresent)
    },
    explanation,
    actions,
    safety: { blocked: specialist === "injury_safety", reasons: safetyReasons },
    llmRoute: resolveLlmProvider(env).route
  };
}
