import type { RecoveryStatus } from "@fitconnect/types";

export type ReadinessInputs = {
  hrvMs: number;
  baselineHrvMs: number;
  sleepHours: number;
  sleepEfficiency: number;
  strainScore: number;
};

export type ReadinessResult = {
  score: number;
  recoveryStatus: RecoveryStatus;
  label: string;
};

const WEIGHTS = { hrv: 0.4, sleep: 0.3, strain: 0.3 } as const;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function computeReadiness(input: ReadinessInputs): ReadinessResult {
  const hrvRatio = input.baselineHrvMs > 0 ? input.hrvMs / input.baselineHrvMs : 1;
  const hrvComponent = clamp(hrvRatio * 100, 0, 100);
  const sleepComponent = clamp(
    (input.sleepHours / 8) * 100 * (input.sleepEfficiency / 100),
    0,
    100
  );
  const strainComponent = clamp(100 - input.strainScore, 0, 100);
  const score = Math.round(
    hrvComponent * WEIGHTS.hrv +
      sleepComponent * WEIGHTS.sleep +
      strainComponent * WEIGHTS.strain
  );

  let recoveryStatus: RecoveryStatus = "green";
  if (score < 40) recoveryStatus = "red";
  else if (score < 70) recoveryStatus = "amber";

  const label =
    score >= 70 ? "Train hard" : score >= 40 ? "Train smart" : "Prioritize recovery";

  return { score, recoveryStatus, label };
}

export function readinessGreeting(name: string, score: number): string {
  const first = name.split(" ")[0] ?? name;
  if (score >= 70) return `Good morning, ${first}`;
  if (score >= 40) return `Hey ${first} — train smart today`;
  return `Recovery day, ${first}`;
}
