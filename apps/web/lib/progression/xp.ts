/** New athletes start at 0. Seeded 120 XP was a demo lie. */
export const DEFAULT_PROGRESSION_XP = 0;

export function xpForProgressionEvent(event: {
  type: string;
  xpAward?: number;
  payload?: { distanceM?: number; durationMs?: number };
}): number {
  if (typeof event.xpAward === "number" && event.xpAward > 0) return Math.round(event.xpAward);
  if (event.type === "MISSION_COMPLETED") return 25;
  const durationMin = Math.round((event.payload?.durationMs ?? 0) / 60_000);
  if (durationMin > 0) return Math.max(15, durationMin * 2);
  const distanceM = event.payload?.distanceM ?? 0;
  if (distanceM > 0) return Math.max(15, Math.round(distanceM / 100));
  return 15;
}
