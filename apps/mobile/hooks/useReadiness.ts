import { useMemo } from "react";
import { computeReadiness } from "@/lib/readiness";
import { readReadinessCache, writeReadinessCache } from "@/lib/cache";

const LIVE = {
  hrvMs: 58,
  baselineHrvMs: 54,
  sleepHours: 7.4,
  sleepEfficiency: 92,
  strainScore: 38
};

export function useReadiness() {
  return useMemo(() => {
    const result = computeReadiness(LIVE);
    writeReadinessCache({
      score: result.score,
      label: result.label,
      hrvMs: LIVE.hrvMs,
      sleepHours: LIVE.sleepHours,
      strain: LIVE.strainScore
    });
    return { ...result, ...LIVE, cached: readReadinessCache() };
  }, []);
}

export function useCachedReadiness() {
  return readReadinessCache();
}
