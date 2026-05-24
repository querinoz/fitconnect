/** Deterministic AI match % for discover cards (demo telemetry). */
export function aiMatchScore(trainerId: string): number {
  let hash = 0;
  for (let i = 0; i < trainerId.length; i++) {
    hash = (hash * 31 + trainerId.charCodeAt(i)) >>> 0;
  }
  return 72 + (hash % 24);
}
