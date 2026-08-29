/**
 * Demo gamification fixtures — local preview only, not production XP.
 */

export type BadgeRarity = "COMMON" | "RARE" | "EPIC" | "ELITE" | "LEGENDARY";

export type DemoBadge = {
  id: string;
  name: string;
  description: string;
  rarity: BadgeRarity;
  earned: boolean;
  progress?: { current: number; target: number };
  xpReward: number;
};

export type DemoProfile = {
  level: number;
  title: string;
  xp: number;
  xpToNext: number;
  streak: number;
  squad: string;
  quote: string;
  stats: { label: string; value: string }[];
  featuredBadges: DemoBadge[];
  badgesUnlocked: number;
  badgesTotal: number;
  demo: true;
};

export const DEMO_PROFILE: DemoProfile = {
  level: 24,
  title: "Performance Operator",
  xp: 8420,
  xpToNext: 10000,
  streak: 12,
  squad: "Unit Voltline",
  quote: "Consistency compounds.",
  stats: [
    { label: "Sessions", value: "148" },
    { label: "Volume", value: "1,240 km" },
    { label: "PRs", value: "7" },
    { label: "Squad rank", value: "#3" }
  ],
  featuredBadges: [
    {
      id: "badge-early-bird",
      name: "Early Bird",
      description: "5 sessions before 07:00",
      rarity: "RARE",
      earned: true,
      xpReward: 120
    },
    {
      id: "badge-voltline",
      name: "Voltline",
      description: "Complete a Voltline week",
      rarity: "EPIC",
      earned: true,
      xpReward: 250
    },
    {
      id: "badge-pr-hunter",
      name: "PR Hunter",
      description: "3 personal bests in 30 days",
      rarity: "ELITE",
      earned: false,
      progress: { current: 2, target: 3 },
      xpReward: 400
    }
  ],
  badgesUnlocked: 12,
  badgesTotal: 48,
  demo: true
};

/** Documented rank rules — current web implementation status */
export const GAMIFICATION_CURRENT_RULES = {
  status: "PARTIAL" as const,
  xpSources: ["session-complete (planned)", "streak (planned)", "squad-challenge (planned)"],
  levelFormula: "cumulative XP thresholds — not wired to backend",
  badgeEngine: "fixture data only on profile demo",
  idempotency: "not implemented — requires event_id dedup layer",
  crossPlatform: "BLOCKED — no Android/Wear native clients in repo"
};
