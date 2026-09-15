import type { ClassificationStatus, CombatMeasurement, CombatSensor } from "@fitconnect/types";
import { assertHonestForce } from "./measurement";

export type IngestKind = "strike" | "grappling" | "movement" | "impact_safety";

export type IngestEventInput = {
  id?: string;
  sessionId: string;
  roundIndex?: number | null;
  occurredAt?: string | null;
  kind: IngestKind;
  payload?: Record<string, unknown>;
  classification?: ClassificationStatus;
  source?: CombatSensor;
  confirmedBy?: string | null;
  measurements?: CombatMeasurement[];
};

export type SanitizedIngest = {
  id: string;
  sessionId: string;
  roundIndex: number | null;
  occurredAt: string;
  kind: IngestKind;
  payload: Record<string, unknown>;
  classification: ClassificationStatus;
  source: CombatSensor;
  confirmedBy: string | null;
  measurements: CombatMeasurement[];
};

const AUTO_CONFIRM_SOURCES: CombatSensor[] = ["MANUAL", "COACH", "OFFICIAL_RESULT"];

export function sanitizeIngestEvent(input: IngestEventInput): SanitizedIngest | { error: string } {
  if (!input.sessionId) return { error: "session_required" };
  if (!["strike", "grappling", "movement", "impact_safety"].includes(input.kind)) {
    return { error: "unknown_kind" };
  }
  const source = input.source ?? "MANUAL";
  let classification: ClassificationStatus =
    input.classification ?? (AUTO_CONFIRM_SOURCES.includes(source) ? "CONFIRMED" : "DETECTED");
  if (!AUTO_CONFIRM_SOURCES.includes(source) && classification === "CONFIRMED") {
    classification = "CLASSIFIED";
  }
  const payload = { ...(input.payload ?? {}) };
  if (input.kind === "impact_safety") {
    payload.advisory = "IMPACT_EVENT";
    delete payload.diagnosis;
    delete payload.concussion;
  }
  const measurements = (input.measurements ?? []).map((m) =>
    assertHonestForce({
      ...m,
      sessionId: input.sessionId,
      source: m.source || source,
      provider: m.provider || source
    })
  );
  return {
    id: input.id?.trim() || `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    sessionId: input.sessionId,
    roundIndex: input.roundIndex ?? null,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    kind: input.kind,
    payload,
    classification,
    source,
    confirmedBy: AUTO_CONFIRM_SOURCES.includes(source) ? input.confirmedBy ?? "athlete" : null,
    measurements
  };
}
