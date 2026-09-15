export type CombatSharePayload = {
  kind: "combat_session" | "competition_result" | "milestone";
  title: string;
  disciplineName: string;
  roundsCompleted: number | null;
  durationMin: number | null;
  outcome: string | null;
  includesBiometrics: false;
};

const BLOCKED = /hrv|heart rate|sleep|resting hr|force n|concussion|impact_force/i;

export function buildSharePayload(input: {
  title: string;
  disciplineName: string;
  roundsCompleted?: number | null;
  durationMin?: number | null;
  outcome?: string | null;
}): CombatSharePayload | { error: "sensitive_content" } {
  const blob = `${input.title} ${input.outcome ?? ""}`;
  if (BLOCKED.test(blob)) return { error: "sensitive_content" };
  return {
    kind: "combat_session",
    title: input.title,
    disciplineName: input.disciplineName,
    roundsCompleted: input.roundsCompleted ?? null,
    durationMin: input.durationMin ?? null,
    outcome: input.outcome ?? null,
    includesBiometrics: false
  };
}
