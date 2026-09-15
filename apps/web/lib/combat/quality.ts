/** Data quality for combat events. Never invent samples to fill charts. */

export function normalizeIso(value: string | number | null | undefined): string | null {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value).toISOString();
  }
  const parsed = Date.parse(String(value));
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed).toISOString();
}

export function eventDedupeKey(input: {
  sessionId: string;
  occurredAt: string;
  kind: string;
  source: string;
}): string {
  return `${input.sessionId}|${input.occurredAt}|${input.kind}|${input.source}`;
}

export function isDuplicate(seen: Set<string>, key: string): boolean {
  if (seen.has(key)) return true;
  seen.add(key);
  return false;
}

/** Unrealistic wrist acceleration is dropped, not rewritten into force. */
export function accelerationOutlier(g: number | null): boolean {
  if (g == null || !Number.isFinite(g)) return true;
  return g <= 0 || g > 200;
}

export function sensorDropout(sampledAt: string | null, nowMs = Date.now(), maxGapMs = 5_000): boolean {
  if (!sampledAt) return true;
  const t = Date.parse(sampledAt);
  if (Number.isNaN(t)) return true;
  return nowMs - t > maxGapMs;
}

export function normalizeUnit(unit: string | null, metric: string): string | null {
  if (!unit) return metric === "impact_force" || metric === "impact_estimate" ? "N" : null;
  const u = unit.trim();
  if (u === "newtons") return "N";
  if (u === "ms" || u === "msec") return "ms";
  return u;
}
