export type CombatSharePayload = {
  kind: "combat_session" | "competition_result" | "milestone" | "pr";
  title: string;
  disciplineName: string;
  roundsCompleted: number | null;
  durationMin: number | null;
  outcome: string | null;
  includesBiometrics: false;
};

const BLOCKED = /hrv|heart rate|\bhr\b|sleep|resting hr|force n|impact_force|head impact|concussion|newtons/i;

export function buildSharePayload(input: {
  kind?: CombatSharePayload["kind"];
  title: string;
  disciplineName: string;
  roundsCompleted?: number | null;
  durationMin?: number | null;
  outcome?: string | null;
}): CombatSharePayload | { error: "sensitive_content" } {
  const blob = `${input.title} ${input.outcome ?? ""}`;
  if (BLOCKED.test(blob)) return { error: "sensitive_content" };
  return {
    kind: input.kind ?? "combat_session",
    title: input.title,
    disciplineName: input.disciplineName,
    roundsCompleted: input.roundsCompleted ?? null,
    durationMin: input.durationMin ?? null,
    outcome: input.outcome ?? null,
    includesBiometrics: false
  };
}
