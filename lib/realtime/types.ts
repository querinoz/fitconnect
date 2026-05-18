export type PlanUpdate = {
  kind: "plan-update";
  planId: string;
  athleteId: string;
  coachId: string;
  diff: "lighter-day" | "swap-z2" | "add-recovery" | "custom";
  customNote?: string;
  at: string;
  origin: "coach" | "co-pilot";
};

export type LiveTick = {
  kind: "live-tick";
  athleteId: string;
  hr: number;
  pace: number;
  cadence: number;
  elapsedSec: number;
  at: string;
};

export type Nudge = {
  kind: "nudge";
  athleteId: string;
  coachId: string;
  variant: "slow-down" | "push" | "great-work";
  at: string;
};

export type SessionStart = {
  kind: "session-start";
  athleteId: string;
  sessionId: string;
  at: string;
};

export type SessionEnd = {
  kind: "session-end";
  athleteId: string;
  sessionId: string;
  summary: {
    distanceKm: number;
    avgHr: number;
    maxHr: number;
    durationSec: number;
  };
  at: string;
};

export type Achievement = {
  kind: "achievement";
  athleteId: string;
  title: string;
  metric: string;
  value: number;
  at: string;
};

export type Reaction = {
  kind: "reaction";
  achievementId: string;
  athleteId: string;
  emoji: "🔥" | "⚡" | "💪" | "👏" | "🚀";
  fromName: string;
  at: string;
};

export type AICoPilotAlert = {
  kind: "ai-alert";
  id: string;
  coachId: string;
  athleteId: string;
  rule: "hrv-down" | "sleep-low" | "missed-sessions";
  recommendation: "lighter-day" | "swap-z2" | "recovery-day";
  body: string;
  at: string;
};

export type RealtimeMessage =
  | PlanUpdate
  | LiveTick
  | Nudge
  | SessionStart
  | SessionEnd
  | Achievement
  | Reaction
  | AICoPilotAlert;

const KINDS = new Set<string>([
  "plan-update",
  "live-tick",
  "nudge",
  "session-start",
  "session-end",
  "achievement",
  "reaction",
  "ai-alert"
]);

export function isRealtimeMessage(v: unknown): v is RealtimeMessage {
  return (
    !!v &&
    typeof v === "object" &&
    typeof (v as { kind?: unknown }).kind === "string" &&
    KINDS.has((v as { kind: string }).kind) &&
    typeof (v as { at?: unknown }).at === "string"
  );
}
