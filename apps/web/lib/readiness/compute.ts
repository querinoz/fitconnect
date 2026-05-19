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
  weights: { hrv: number; sleep: number; strain: number };
};

const WEIGHTS = { hrv: 0.4, sleep: 0.3, strain: 0.3 } as const;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function computeReadiness(input: ReadinessInputs): ReadinessResult {
  const hrvRatio = input.baselineHrvMs > 0 ? input.hrvMs / input.baselineHrvMs : 1;
  const hrvComponent = clamp(hrvRatio * 100, 0, 100);

  const sleepTarget = 8;
  const sleepComponent = clamp(
    (input.sleepHours / sleepTarget) * 100 * (input.sleepEfficiency / 100),
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
    score >= 70
      ? "Train hard"
      : score >= 40
        ? "Train smart"
        : "Prioritize recovery";

  return {
    score,
    recoveryStatus,
    label,
    weights: { ...WEIGHTS }
  };
}

export function readinessGreeting(name: string, score: number): string {
  const first = name.split(" ")[0] ?? name;
  if (score >= 70) return `Good morning, ${first}. Your body says: Train hard.`;
  if (score >= 40) return `Good morning, ${first}. Your body says: Train smart today.`;
  return `Good morning, ${first}. Low readiness — consider recovery.`;
}

export function generateHrvSeries(
  days: number,
  baselineMs: number,
  seed = 1
): Array<{ day: string; hrv: number; sleep: number }> {
  const out: Array<{ day: string; hrv: number; sleep: number }> = [];
  let state = seed;
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    const noise = (state % 17) - 8;
    const hrv = clamp(baselineMs + noise, 45, 75);
    const sleep = clamp(6.2 + (state % 13) / 10, 5.2, 8.4);
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    out.push({
      day: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      hrv,
      sleep: Number(sleep.toFixed(1))
    });
  }
  return out;
}
