import type { ReadinessBand, ReadinessView } from "./types";

export function bandFromScore(score: number): ReadinessBand {
  if (score < 40) return "RESTORE";
  if (score < 55) return "RECOVER";
  if (score < 70) return "CAUTION";
  if (score < 85) return "PRIMED";
  return "READY";
}

export function readinessFromApi(payload: {
  score?: number | null;
  source?: string;
} | null): ReadinessView {
  const score =
    payload && typeof payload.score === "number" && Number.isFinite(payload.score)
      ? Math.round(payload.score)
      : null;
  if (score == null) {
    return {
      score: null,
      band: null,
      source: payload?.source ?? "unavailable",
      available: false,
      detail:
        "Body data is unavailable. TRAIN will not invent HRV, sleep, or heart rate. Use the planned session as written."
    };
  }
  const source = payload?.source ?? "unknown";
  return {
    score,
    band: bandFromScore(score),
    source,
    available: true,
    detail: `Private readiness ${score} from ${source}. Strava-origin data stays on this athlete surface only.`
  };
}
