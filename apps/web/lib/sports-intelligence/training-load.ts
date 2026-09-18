/**
 * Training load model (ACWR-lite).
 * Uses session strain history when available; never invents biometrics.
 * Output is CALCULATED or MISSING — never REAL fabricated HR.
 */

export type LoadSession = {
  dateISO: string;
  /** Session strain / RPE*duration proxy — caller-supplied, never invented here */
  strain: number;
};

export type TrainingLoadView = {
  acute7d: number | null;
  chronic28d: number | null;
  /** Acute:Chronic Workload Ratio when both available */
  acwr: number | null;
  label: "LOW" | "MODERATE" | "HIGH" | "SPIKE" | "UNKNOWN";
  provenance: "CALCULATED" | "MISSING";
  explanation: string[];
  confidence: "HIGH" | "MEDIUM" | "LOW" | "NOT_AVAILABLE";
};

function sumStrain(sessions: LoadSession[], fromISO: string, toISO: string): number {
  return sessions
    .filter((s) => s.dateISO >= fromISO && s.dateISO <= toISO)
    .reduce((acc, s) => acc + Math.max(0, s.strain), 0);
}

function daysAgoISO(days: number, now = new Date()): string {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

export function computeTrainingLoad(sessions: LoadSession[], now = new Date()): TrainingLoadView {
  if (!sessions.length) {
    return {
      acute7d: null,
      chronic28d: null,
      acwr: null,
      label: "UNKNOWN",
      provenance: "MISSING",
      explanation: ["No session strain history available — training load NOT_AVAILABLE."],
      confidence: "NOT_AVAILABLE"
    };
  }

  const today = now.toISOString().slice(0, 10);
  const acute = sumStrain(sessions, daysAgoISO(6, now), today);
  const chronicRaw = sumStrain(sessions, daysAgoISO(27, now), today);
  const chronicAvg = chronicRaw / 4; // weekly average over 4 weeks

  let acwr: number | null = null;
  if (chronicAvg > 0) {
    acwr = Math.round((acute / chronicAvg) * 100) / 100;
  }

  let label: TrainingLoadView["label"] = "UNKNOWN";
  if (acwr == null) label = "UNKNOWN";
  else if (acwr < 0.8) label = "LOW";
  else if (acwr <= 1.3) label = "MODERATE";
  else if (acwr <= 1.5) label = "HIGH";
  else label = "SPIKE";

  return {
    acute7d: Math.round(acute * 10) / 10,
    chronic28d: Math.round(chronicAvg * 10) / 10,
    acwr,
    label,
    provenance: "CALCULATED",
    explanation: [
      "Acute load = sum of strain over last 7 days.",
      "Chronic load = average weekly strain over last 28 days.",
      "ACWR = acute / chronic. SPIKE (>1.5) suggests caution — not a medical diagnosis.",
      "Strain values must be supplied by completed sessions — never fabricated."
    ],
    confidence: acwr == null ? "LOW" : "MEDIUM"
  };
}
