import type {
  ClassificationStatus,
  CombatEvent,
  GrapplingEvent,
  ImpactSafetyEvent,
  MovementEvent,
  StrikeEvent
} from "@fitconnect/types";

export function neverAutoConfirm(status: ClassificationStatus): ClassificationStatus {
  return status === "CONFIRMED" ? "CONFIRMED" : status;
}

export function confirmEvent(event: CombatEvent, confirmedBy: string): CombatEvent {
  if (!confirmedBy) return event;
  return { ...event, classification: "CONFIRMED", confirmedBy };
}

export function createManualStrike(
  partial: Omit<StrikeEvent, "kind" | "classification" | "source" | "confirmedBy"> & {
    confirmedBy?: string | null;
  }
): StrikeEvent {
  return {
    ...partial,
    kind: "strike",
    source: "MANUAL",
    classification: partial.confirmedBy ? "CONFIRMED" : "CONFIRMED",
    confirmedBy: partial.confirmedBy ?? "athlete"
  };
}

export function createDetectedStrike(
  partial: Omit<StrikeEvent, "kind" | "classification" | "confirmedBy">
): StrikeEvent {
  return {
    ...partial,
    kind: "strike",
    classification: "DETECTED",
    confirmedBy: null
  };
}

export function classifyStrike(event: StrikeEvent, punchOrKickKnown: boolean): StrikeEvent {
  if (event.classification === "CONFIRMED") return event;
  return {
    ...event,
    classification: punchOrKickKnown ? "CLASSIFIED" : "DETECTED"
  };
}

export function createGrappling(partial: Omit<GrapplingEvent, "kind">): GrapplingEvent {
  return { ...partial, kind: "grappling" };
}

export function createMovement(partial: Omit<MovementEvent, "kind">): MovementEvent {
  return { ...partial, kind: "movement" };
}

export function createImpactSafety(
  partial: Omit<ImpactSafetyEvent, "kind" | "advisory" | "classification">
): ImpactSafetyEvent {
  return {
    ...partial,
    kind: "impact_safety",
    classification: "DETECTED",
    advisory: "IMPACT_EVENT"
  };
}

export function isSafetyEvent(event: CombatEvent): event is ImpactSafetyEvent {
  return event.kind === "impact_safety";
}

export function safetyCopy(): string {
  return "Impact event recorded. This is not a concussion diagnosis. Seek appropriate professional evaluation if you have symptoms.";
}
