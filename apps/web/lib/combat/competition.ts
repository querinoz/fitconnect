export type CompetitionResult = {
  disciplineId: string;
  rulesetId: string;
  rulesetVersion: string;
  weightClass: string | null;
  ageClass: string | null;
  eventName: string | null;
  rounds: number | null;
  roundDurationSec: number | null;
  restDurationSec: number | null;
  outcome: "win" | "loss" | "draw" | "nc" | "exhibition" | null;
  method: string | null;
  score: string | null;
  roundEnded: number | null;
  notes: string | null;
  source: "official" | "athlete" | "coach";
};

export function officialStatsAllowed(source: CompetitionResult["source"], hasOfficialFeed: boolean): boolean {
  return source === "official" && hasOfficialFeed;
}

export function sanitizeCompetition(input: Partial<CompetitionResult> & Pick<CompetitionResult, "disciplineId" | "rulesetId" | "rulesetVersion" | "source">): CompetitionResult {
  return {
    disciplineId: input.disciplineId,
    rulesetId: input.rulesetId,
    rulesetVersion: input.rulesetVersion,
    weightClass: input.weightClass ?? null,
    ageClass: input.ageClass ?? null,
    eventName: input.eventName ?? null,
    rounds: input.rounds ?? null,
    roundDurationSec: input.roundDurationSec ?? null,
    restDurationSec: input.restDurationSec ?? null,
    outcome: input.outcome ?? null,
    method: input.method ?? null,
    score: input.score ?? null,
    roundEnded: input.roundEnded ?? null,
    notes: input.notes ?? null,
    source: input.source
  };
}
