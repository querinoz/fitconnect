import type { CombatEvent, CombatMeasurement, StrikeEvent } from "@fitconnect/types";
import { missingMeasurement } from "./measurement";

export type RoundVolume = {
  roundIndex: number;
  strikeCount: number;
  durationSec: number;
  ratePerMin: number | null;
};

export type OutputDecline = {
  fromRound: number;
  toRound: number;
  fromRate: number;
  toRate: number;
  label: "OUTPUT DECLINE";
  /** Never a medical fatigue percentage. */
  inventedFatiguePercent: null;
};

export function strikeEvents(events: CombatEvent[]): StrikeEvent[] {
  return events.filter((e): e is StrikeEvent => e.kind === "strike");
}

export function countByKind(events: CombatEvent[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const event of events) {
    if (event.kind === "strike") {
      const key = event.strikeKind;
      out[key] = (out[key] ?? 0) + 1;
    }
    if (event.kind === "grappling") {
      const key = event.grapplingKind;
      out[key] = (out[key] ?? 0) + 1;
    }
  }
  return out;
}

export function leftRightDistribution(events: CombatEvent[]): {
  left: number;
  right: number;
  unknown: number;
} | null {
  const strikes = strikeEvents(events);
  if (strikes.length === 0) return null;
  return {
    left: strikes.filter((s) => s.side === "left").length,
    right: strikes.filter((s) => s.side === "right").length,
    unknown: strikes.filter((s) => s.side !== "left" && s.side !== "right").length
  };
}

export function roundVolumes(events: CombatEvent[], roundDurationsSec: number[]): RoundVolume[] {
  return roundDurationsSec.map((durationSec, idx) => {
    const roundIndex = idx + 1;
    const strikeCount = strikeEvents(events).filter((e) => e.roundIndex === roundIndex).length;
    const ratePerMin = durationSec > 0 && strikeCount > 0 ? (strikeCount / durationSec) * 60 : strikeCount === 0 ? 0 : null;
    return { roundIndex, strikeCount, durationSec, ratePerMin };
  });
}

export function outputDecline(volumes: RoundVolume[]): OutputDecline | null {
  const usable = volumes.filter((v) => v.ratePerMin != null && v.strikeCount > 0);
  if (usable.length < 2) return null;
  const first = usable[0]!;
  const last = usable[usable.length - 1]!;
  if (first.ratePerMin == null || last.ratePerMin == null) return null;
  if (last.ratePerMin >= first.ratePerMin) return null;
  return {
    fromRound: first.roundIndex,
    toRound: last.roundIndex,
    fromRate: first.ratePerMin,
    toRate: last.ratePerMin,
    label: "OUTPUT DECLINE",
    inventedFatiguePercent: null
  };
}

export function neverFillChart(measurements: CombatMeasurement[], sessionId: string, metric: string): CombatMeasurement[] {
  const present = measurements.filter((m) => m.metric === metric && m.value != null);
  if (present.length) return present;
  return [missingMeasurement({ metric, sessionId, source: "none" })];
}

export function combinationSequences(events: CombatEvent[], windowMs = 2500): string[] {
  const strikes = strikeEvents(events).sort((a, b) => a.occurredAtMs - b.occurredAtMs);
  const sequences: string[] = [];
  let current: string[] = [];
  let lastTs: number | null = null;
  for (const strike of strikes) {
    const label =
      strike.punchClass && strike.punchClass !== "unclassified"
        ? strike.punchClass
        : strike.kickClass && strike.kickClass !== "unclassified"
          ? strike.kickClass
          : strike.strikeKind;
    if (lastTs != null && strike.occurredAtMs - lastTs > windowMs) {
      if (current.length >= 2) sequences.push(current.join(" → "));
      current = [];
    }
    current.push(label.toUpperCase());
    lastTs = strike.occurredAtMs;
  }
  if (current.length >= 2) sequences.push(current.join(" → "));
  return sequences;
}
