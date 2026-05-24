import type { ReadinessComputeResult, ReadinessComputeStatus, RecoveryStatus } from "@fitconnect/types";

export type ReadinessInputs = {
  hrvMs: number;
  baselineHrvMs: number;
  sleepHours: number;
  sleepEfficiency: number;
  strainScore: number;
  historyDays?: 1 | 7;
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
  const hrvMs = clamp(Number.isFinite(input.hrvMs) ? input.hrvMs : 0, 0, 200);
  const baselineHrvMs = clamp(
    Number.isFinite(input.baselineHrvMs) ? input.baselineHrvMs : 58,
    1,
    200
  );
  const sleepHours =
    input.sleepHours == null || Number.isNaN(input.sleepHours) ? 7.5 : input.sleepHours;
  const sleepEfficiency = clamp(
    Number.isFinite(input.sleepEfficiency) ? input.sleepEfficiency : 85,
    0,
    100
  );
  const strainScore = Number.isFinite(input.strainScore) ? clamp(input.strainScore, 0, 100) : 0;

  const historyWeight =
    input.historyDays === 7 ? 1.04 : input.historyDays === 1 ? 0.96 : 1;

  const hrvRatio = baselineHrvMs > 0 ? hrvMs / baselineHrvMs : 1;
  const hrvComponent = clamp(hrvRatio * 100, 0, 100);

  const sleepTarget = 8;
  const sleepComponent = clamp(
    (sleepHours / sleepTarget) * 100 * (sleepEfficiency / 100),
    0,
    100
  );

  const strainComponent = clamp(100 - strainScore, 0, 100);

  const rawScore =
    hrvComponent * WEIGHTS.hrv +
    sleepComponent * WEIGHTS.sleep +
    strainComponent * WEIGHTS.strain;

  const score = Math.round(clamp(rawScore * historyWeight, 0, 100));

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

export function mapRecoveryToComputeStatus(
  score: number,
  recoveryStatus: RecoveryStatus
): ReadinessComputeStatus {
  if (score >= 85 || recoveryStatus === "green") return score >= 85 ? "optimal" : "good";
  if (recoveryStatus === "amber" || score >= 40) return "moderate";
  return "poor";
}

export function computeReadinessForApi(input: ReadinessInputs): ReadinessComputeResult {
  const result = computeReadiness(input);
  const hrvMs = clamp(Number.isFinite(input.hrvMs) ? input.hrvMs : 0, 0, 200);
  const baselineHrvMs = clamp(
    Number.isFinite(input.baselineHrvMs) ? input.baselineHrvMs : 58,
    1,
    200
  );
  const sleepHours =
    input.sleepHours == null || Number.isNaN(input.sleepHours) ? 7.5 : input.sleepHours;
  const sleepEfficiency = clamp(
    Number.isFinite(input.sleepEfficiency) ? input.sleepEfficiency : 85,
    0,
    100
  );
  const strainScore = Number.isFinite(input.strainScore) ? clamp(input.strainScore, 0, 100) : 0;

  const hrvRatio = baselineHrvMs > 0 ? hrvMs / baselineHrvMs : 1;
  const hrvComponent = clamp(hrvRatio * 100, 0, 100);
  const sleepComponent = clamp((sleepHours / 8) * 100 * (sleepEfficiency / 100), 0, 100);
  const strainComponent = clamp(100 - strainScore, 0, 100);

  return {
    score: result.score,
    status: mapRecoveryToComputeStatus(result.score, result.recoveryStatus),
    breakdown: {
      hrv: Math.round(hrvComponent),
      sleep: Math.round(sleepComponent),
      strain: Math.round(strainComponent)
    }
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
