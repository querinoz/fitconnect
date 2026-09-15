import type { ClassificationStatus } from "@fitconnect/types";

/**
 * Impact / technique ML is architected, not hardware-validated.
 * Models may emit DETECTED or CLASSIFIED. They never emit CONFIRMED.
 */
export const TECHNIQUE_MODEL = {
  id: "fitconnect.combat.technique.unvalidated",
  validated: false as const,
  medicalClaims: false as const,
  reason:
    "No FitConnect impact/technique model has passed a hardware validation study. Hypotheses stay CLASSIFIED at most."
};

export type TechniqueHypothesis = {
  modelId: string;
  label: string;
  classification: Exclude<ClassificationStatus, "CONFIRMED">;
  confidence: "LOW" | "MEDIUM" | "MISSING";
  validated: false;
  sourceKind: "REAL" | "DEV_MOCK";
  medicalClaims: false;
};

export function classifyTechniqueHypothesis(input: {
  label: string;
  sourceKind?: "REAL" | "DEV_MOCK";
  sensorConfidence?: number | null;
}): TechniqueHypothesis {
  const sourceKind = input.sourceKind ?? "REAL";
  const conf = input.sensorConfidence;
  const confidence: TechniqueHypothesis["confidence"] =
    typeof conf === "number" && conf >= 0.75 ? "MEDIUM" : typeof conf === "number" ? "LOW" : "MISSING";
  return {
    modelId: TECHNIQUE_MODEL.id,
    label: input.label,
    classification: sourceKind === "DEV_MOCK" || confidence === "MEDIUM" ? "CLASSIFIED" : "DETECTED",
    confidence,
    validated: false,
    sourceKind,
    medicalClaims: false
  };
}

export function assertNeverConfirmedFromModel(status: ClassificationStatus): void {
  if (status === "CONFIRMED") {
    throw new Error("Technique models cannot CONFIRM. Athlete or coach confirmation is required.");
  }
}
