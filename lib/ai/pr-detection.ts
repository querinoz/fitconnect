export type SessionRecord = {
  athleteId: string;
  at: string;
  distanceKm: number;
  durationSec: number;
  avgHr: number;
  maxHr: number;
};

export type PRMetric = "distanceKm" | "durationSec" | "maxHr";

export type PR = {
  athleteId: string;
  metric: PRMetric;
  value: number;
  prevBest: number;
  at: string;
};

export function detectPRs(latest: SessionRecord, history: SessionRecord[]): PR[] {
  const past = history.filter((h) => h.athleteId === latest.athleteId);
  const out: PR[] = [];
  for (const m of ["distanceKm", "durationSec", "maxHr"] as PRMetric[]) {
    const prev = past.length ? Math.max(...past.map((h) => h[m])) : -Infinity;
    if (latest[m] > prev) {
      out.push({
        athleteId: latest.athleteId,
        metric: m,
        value: latest[m],
        prevBest: prev === -Infinity ? 0 : prev,
        at: latest.at
      });
    }
  }
  return out;
}
