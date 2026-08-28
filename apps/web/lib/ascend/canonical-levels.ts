/** Mirrors android/ascend/.../LevelTable.kt — single canonical progression curve. */

export type CanonicalBand = {
  level: number;
  xpRequired: number;
  rankCode: string;
  rankNameKey: string;
};

export type CanonicalLevel = {
  level: number;
  rankCode: string;
  rankNameKey: string;
  rankLabel: string;
  xpRequired: number;
  xpIntoLevel: number;
  xpForLevel: number;
  xpToNext: number;
  progressPercent: number;
};

const RANK_LABELS: Record<string, string> = {
  "rank.initiate": "Initiate",
  "rank.activated": "Activated",
  "rank.mover": "Mover",
  "rank.athlete": "Athlete",
  "rank.performer": "Performer",
  "rank.competitor": "Competitor",
  "rank.elite": "Elite",
  "rank.advanced_elite": "Advanced Elite",
  "rank.performance_pro": "Performance Pro",
  "rank.high_performance": "High Performance",
  "rank.prime": "Prime",
  "rank.elite_prime": "Elite Prime",
  "rank.ascendant": "Ascendant",
  "rank.apex": "Apex",
  "rank.legacy": "Legacy"
};

export const CANONICAL_BANDS: CanonicalBand[] = [
  { level: 1, xpRequired: 0, rankCode: "01", rankNameKey: "rank.initiate" },
  { level: 2, xpRequired: 200, rankCode: "02", rankNameKey: "rank.activated" },
  { level: 3, xpRequired: 500, rankCode: "03", rankNameKey: "rank.mover" },
  { level: 4, xpRequired: 900, rankCode: "04", rankNameKey: "rank.athlete" },
  { level: 5, xpRequired: 1400, rankCode: "05", rankNameKey: "rank.performer" },
  { level: 6, xpRequired: 2000, rankCode: "06", rankNameKey: "rank.competitor" },
  { level: 7, xpRequired: 2800, rankCode: "07", rankNameKey: "rank.elite" },
  { level: 8, xpRequired: 3800, rankCode: "08", rankNameKey: "rank.advanced_elite" },
  { level: 9, xpRequired: 5000, rankCode: "09", rankNameKey: "rank.performance_pro" },
  { level: 10, xpRequired: 6500, rankCode: "10", rankNameKey: "rank.high_performance" },
  { level: 11, xpRequired: 8500, rankCode: "11", rankNameKey: "rank.prime" },
  { level: 12, xpRequired: 11000, rankCode: "12", rankNameKey: "rank.elite_prime" },
  { level: 13, xpRequired: 14500, rankCode: "13", rankNameKey: "rank.ascendant" },
  { level: 14, xpRequired: 19000, rankCode: "14", rankNameKey: "rank.apex" },
  { level: 15, xpRequired: 25000, rankCode: "15", rankNameKey: "rank.legacy" }
];

export function rankLabel(rankNameKey: string): string {
  return RANK_LABELS[rankNameKey] ?? rankNameKey;
}

export function resolveCanonicalLevel(totalXp: number): CanonicalLevel {
  const xp = Math.max(0, totalXp);
  const current = CANONICAL_BANDS.filter((b) => xp >= b.xpRequired).at(-1) ?? CANONICAL_BANDS[0]!;
  const next = CANONICAL_BANDS.find((b) => b.level === current.level + 1);
  const floor = current.xpRequired;
  const ceiling = next?.xpRequired ?? floor + 1;
  const span = Math.max(1, ceiling - floor);
  const into = Math.min(span, xp - floor);
  const remaining = next ? Math.max(0, ceiling - xp) : 0;
  const percent = next ? Math.min(99, Math.max(0, Math.round((into / span) * 100))) : 100;

  return {
    level: current.level,
    rankCode: current.rankCode,
    rankNameKey: current.rankNameKey,
    rankLabel: rankLabel(current.rankNameKey),
    xpRequired: current.xpRequired,
    xpIntoLevel: into,
    xpForLevel: span,
    xpToNext: remaining,
    progressPercent: percent
  };
}
