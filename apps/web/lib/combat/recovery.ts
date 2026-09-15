import { missingObservation, type FitnessObservation } from "@/lib/health/observation";

export type CombatRecoveryView = {
  compositeScore: null;
  reason: string;
  signals: {
    hrvMs: FitnessObservation;
    sleepHours: FitnessObservation;
    restingHrBpm: FitnessObservation;
    sparringRounds: FitnessObservation;
    rpe: FitnessObservation;
  };
  recommendation: string;
};

/**
 * No undocumented composite "combat recovery score".
 * High sparring volume plus poor HRV/sleep can change copy, not invent a number.
 */
export function combatRecoveryFromSignals(input: {
  hrvMs?: number | null;
  sleepHours?: number | null;
  restingHrBpm?: number | null;
  sparringRounds?: number | null;
  rpe?: number | null;
  source?: string;
  provider?: string;
  measuredAt?: string | null;
}): CombatRecoveryView {
  const source = input.source ?? "insufficient_data";
  const provider = input.provider ?? source;
  const measuredAt = input.measuredAt ?? null;
  const ingestedAt = new Date().toISOString();

  const obs = (value: number | null | undefined, unit: string): FitnessObservation =>
    typeof value === "number"
      ? { value, unit, source, provider, measuredAt, ingestedAt, confidence: "measured" }
      : missingObservation(source, provider, unit);

  const hrvMs = obs(input.hrvMs, "ms");
  const sleepHours = obs(input.sleepHours, "h");
  const restingHrBpm = obs(input.restingHrBpm, "bpm");
  const sparringRounds = obs(input.sparringRounds, "rounds");
  const rpe = obs(input.rpe, "rpe");

  const heavySparring = typeof input.sparringRounds === "number" && input.sparringRounds >= 6;
  const lowHrv = typeof input.hrvMs === "number";
  const poorSleep = typeof input.sleepHours === "number" && input.sleepHours < 6;

  let recommendation =
    "Show the signals you have. No combat recovery composite is computed without a documented method.";
  if (heavySparring && poorSleep) {
    recommendation =
      "Logged sparring volume is high and sleep hours are low. Prefer technique or recovery work until sleep is measured as restored — this is not a medical opinion.";
  } else if (heavySparring && !lowHrv) {
    recommendation =
      "Sparring volume is logged; HRV is unavailable. Do not invent readiness from rounds alone.";
  }

  return {
    compositeScore: null,
    reason: "FitConnect does not publish an undocumented combat recovery score.",
    signals: { hrvMs, sleepHours, restingHrBpm, sparringRounds, rpe },
    recommendation
  };
}
