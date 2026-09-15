import { adapterFor, analyticsDimensions } from "./adapters";
import { getDiscipline } from "./taxonomy";
import type { CombatSessionMode } from "@fitconnect/types";
import type { CombatRecoveryView } from "./recovery";

export type CombatZenithContext = {
  disciplineId: string;
  disciplineName: string;
  sessionMode: CombatSessionMode | null;
  experience: "beginner" | "intermediate" | "advanced" | "competitor" | null;
  goal: string | null;
  telemetryAvailable: string[];
  telemetryMissing: string[];
  briefing: string;
  medicalClaims: false;
};

export function zenithCombatContext(input: {
  disciplineId: string;
  sessionMode?: CombatSessionMode | null;
  experience?: CombatZenithContext["experience"];
  goal?: string | null;
  presentMetrics?: string[];
  recovery?: CombatRecoveryView | null;
}): CombatZenithContext | null {
  const d = getDiscipline(input.disciplineId);
  const adapter = adapterFor(input.disciplineId);
  if (!d || !adapter) return null;
  const dims = analyticsDimensions(d.id);
  const present = input.presentMetrics ?? [];
  const telemetryAvailable = dims.filter((k) => present.includes(k));
  const telemetryMissing = dims.filter((k) => !present.includes(k));
  const cultural = d.culturalNote ? ` ${d.culturalNote}` : "";
  const recoveryNote = input.recovery?.recommendation ?? "";
  const briefing = [
    `${d.name} · ${adapter.family}. ${d.telemetryNotes}`,
    input.sessionMode ? `Session mode ${input.sessionMode}.` : "No session mode selected.",
    adapter.headlineIsNotStrikeRate ? "Do not lead with strikes per minute." : "Volume and rate only from logged or sensor events.",
    "No official scores from a generic wearable.",
    "No concussion or injury diagnosis.",
    recoveryNote,
    cultural
  ]
    .filter(Boolean)
    .join(" ");

  return {
    disciplineId: d.id,
    disciplineName: d.name,
    sessionMode: input.sessionMode ?? null,
    experience: input.experience ?? null,
    goal: input.goal ?? null,
    telemetryAvailable,
    telemetryMissing,
    briefing,
    medicalClaims: false
  };
}
