import {
  CANONICAL_BANDS,
  resolveCanonicalLevel,
  rankLabel
} from "@/lib/ascend/canonical-levels";

export type LevelDef = {
  level: number;
  element: string;
  symbol: string;
  xpRequired: number;
};

/** Canonical ASCEND bands (aligned with Android LevelTable.kt). */
export const LEVELS: LevelDef[] = CANONICAL_BANDS.map((b) => ({
  level: b.level,
  element: rankLabel(b.rankNameKey),
  symbol: b.rankCode,
  xpRequired: b.xpRequired
}));

/** @deprecated Use canonical bands via levelFromXp — kept for legacy imports. */
export function xpForLevel(level: number): number {
  return CANONICAL_BANDS.find((b) => b.level === level)?.xpRequired ?? 0;
}

export function levelFromXp(xp: number): LevelDef {
  const resolved = resolveCanonicalLevel(xp);
  return {
    level: resolved.level,
    element: resolved.rankLabel,
    symbol: resolved.rankCode,
    xpRequired: resolved.xpRequired
  };
}

export function nextLevelFromXp(xp: number): LevelDef | null {
  const current = levelFromXp(xp);
  return LEVELS.find((l) => l.level === current.level + 1) ?? null;
}

export function progressToNextLevel(xp: number): number {
  return resolveCanonicalLevel(xp).progressPercent;
}
