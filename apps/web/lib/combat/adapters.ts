import type { CombatFamily, CombatMetricKey, CombatSessionMode, MartialArtDiscipline } from "@fitconnect/types";
import { getDiscipline } from "./taxonomy";

export type DisciplineAdapter = {
  id: string;
  family: CombatFamily;
  allowedModes: CombatSessionMode[];
  primaryMetrics: CombatMetricKey[];
  headlineIsNotStrikeRate: boolean;
  allowsForceHeadline: boolean;
  mixKataKumite: boolean;
  scoringFromImu: false;
  notes: string[];
};

export function adapterFor(disciplineId: string): DisciplineAdapter | null {
  const d = getDiscipline(disciplineId);
  if (!d) return null;
  return buildAdapter(d);
}

function buildAdapter(d: MartialArtDiscipline): DisciplineAdapter {
  const traditional =
    d.family === "traditional_cultural" || d.family === "internal" || d.family === "self_defense";
  return {
    id: d.id,
    family: d.family,
    allowedModes: d.sessionModes,
    primaryMetrics: d.metrics,
    headlineIsNotStrikeRate: d.id === "capoeira" || traditional,
    allowsForceHeadline: false,
    mixKataKumite: false,
    scoringFromImu: false,
    notes: [d.telemetryNotes, d.culturalNote].filter((x): x is string => Boolean(x))
  };
}

export function modeAllowed(disciplineId: string, mode: CombatSessionMode): boolean {
  const adapter = adapterFor(disciplineId);
  if (!adapter) return false;
  return adapter.allowedModes.includes(mode);
}

export function analyticsDimensions(disciplineId: string): string[] {
  const adapter = adapterFor(disciplineId);
  if (!adapter) return ["session_duration", "rpe"];
  if (adapter.id === "capoeira") return ["session_duration", "rpe", "flow", "mobility", "ginga"];
  if (adapter.family === "grappling") {
    return ["takedowns", "transitions", "control", "submissions", "escapes", "rpe", "rounds"];
  }
  if (adapter.family === "mixed") {
    return ["strikes", "takedowns", "control", "submissions", "rounds", "rpe"];
  }
  if (adapter.headlineIsNotStrikeRate) {
    return ["movement", "technique", "balance", "session_duration", "rpe"];
  }
  return ["volume", "rate", "velocity", "acceleration", "left_right", "combinations", "rpe", "rounds"];
}
