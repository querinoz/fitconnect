import type { CombatRoundPrescription, CombatSessionMode } from "@fitconnect/types";

export type RoundPhase =
  | "idle"
  | "countdown"
  | "work"
  | "warning"
  | "rest"
  | "paused"
  | "complete";

export type RoundSnapshot = {
  phase: RoundPhase;
  resumePhase: RoundPhase | null;
  prescription: CombatRoundPrescription;
  disciplineId: string;
  currentRound: number;
  remainingSec: number;
  completedRounds: number;
  startedAtMs: number | null;
  muted: boolean;
  lastCue: "none" | "start" | "warning" | "round_end" | "rest" | "complete";
};

export type RoundCommand =
  | { type: "configure"; prescription: CombatRoundPrescription; disciplineId: string }
  | { type: "start"; nowMs: number }
  | { type: "tick" }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "skip_rest" }
  | { type: "finish"; nowMs: number }
  | { type: "mute"; muted: boolean }
  | { type: "restore"; snapshot: RoundSnapshot };

export const IDLE_ROUND: RoundSnapshot = {
  phase: "idle",
  resumePhase: null,
  prescription: {
    roundCount: 3,
    workSec: 180,
    restSec: 60,
    warningSec: 10,
    countdownSec: 10,
    sessionMode: "bag_work"
  },
  disciplineId: "boxing",
  currentRound: 0,
  remainingSec: 0,
  completedRounds: 0,
  startedAtMs: null,
  muted: false,
  lastCue: "none"
};

function beginWork(snapshot: RoundSnapshot, round: number): RoundSnapshot {
  const warning = snapshot.prescription.warningSec;
  const work = snapshot.prescription.workSec;
  return {
    ...snapshot,
    phase: warning > 0 && work <= warning ? "warning" : "work",
    currentRound: round,
    remainingSec: work,
    lastCue: "start",
    resumePhase: null
  };
}

function beginRest(snapshot: RoundSnapshot): RoundSnapshot {
  if (snapshot.currentRound >= snapshot.prescription.roundCount || snapshot.prescription.restSec <= 0) {
    return {
      ...snapshot,
      phase: "complete",
      remainingSec: 0,
      completedRounds: snapshot.currentRound,
      lastCue: "complete"
    };
  }
  return {
    ...snapshot,
    phase: "rest",
    remainingSec: snapshot.prescription.restSec,
    completedRounds: snapshot.currentRound,
    lastCue: "round_end"
  };
}

export function reduceRound(snapshot: RoundSnapshot, command: RoundCommand): RoundSnapshot {
  switch (command.type) {
    case "restore":
      return command.snapshot;
    case "configure":
      if (snapshot.phase !== "idle" && snapshot.phase !== "complete") return snapshot;
      return {
        ...IDLE_ROUND,
        prescription: command.prescription,
        disciplineId: command.disciplineId,
        muted: snapshot.muted
      };
    case "mute":
      return { ...snapshot, muted: command.muted };
    case "start": {
      if (snapshot.phase !== "idle" && snapshot.phase !== "complete") return snapshot;
      const countdown = snapshot.prescription.countdownSec;
      if (countdown > 0) {
        return {
          ...snapshot,
          phase: "countdown",
          currentRound: 0,
          remainingSec: countdown,
          completedRounds: 0,
          startedAtMs: command.nowMs,
          lastCue: "none"
        };
      }
      return beginWork({ ...snapshot, startedAtMs: command.nowMs, completedRounds: 0 }, 1);
    }
    case "pause":
      if (snapshot.phase === "idle" || snapshot.phase === "complete" || snapshot.phase === "paused") {
        return snapshot;
      }
      return { ...snapshot, phase: "paused", resumePhase: snapshot.phase, lastCue: "none" };
    case "resume":
      if (snapshot.phase !== "paused" || !snapshot.resumePhase) return snapshot;
      return { ...snapshot, phase: snapshot.resumePhase, resumePhase: null };
    case "skip_rest":
      if (snapshot.phase !== "rest") return snapshot;
      return beginWork(snapshot, snapshot.currentRound + 1);
    case "finish":
      if (snapshot.phase === "idle") return snapshot;
      return {
        ...snapshot,
        phase: "complete",
        remainingSec: 0,
        lastCue: "complete"
      };
    case "tick": {
      if (
        snapshot.phase !== "countdown" &&
        snapshot.phase !== "work" &&
        snapshot.phase !== "warning" &&
        snapshot.phase !== "rest"
      ) {
        return snapshot;
      }
      if (snapshot.remainingSec <= 1) {
        if (snapshot.phase === "countdown") return beginWork(snapshot, 1);
        if (snapshot.phase === "rest") return beginWork(snapshot, snapshot.currentRound + 1);
        return beginRest(snapshot);
      }
      const remainingSec = snapshot.remainingSec - 1;
      if (
        (snapshot.phase === "work" || snapshot.phase === "warning") &&
        remainingSec <= snapshot.prescription.warningSec
      ) {
        return {
          ...snapshot,
          remainingSec,
          phase: "warning",
          lastCue: remainingSec === snapshot.prescription.warningSec ? "warning" : snapshot.lastCue
        };
      }
      return { ...snapshot, remainingSec, lastCue: "none" };
    }
    default:
      return snapshot;
  }
}

export function formatClock(totalSec: number): string {
  const sec = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function roundHeadline(snapshot: RoundSnapshot): string {
  if (snapshot.phase === "idle") return "FIGHT MODE";
  if (snapshot.phase === "countdown") return "COUNTDOWN";
  if (snapshot.phase === "rest") return "REST";
  if (snapshot.phase === "paused") return "HOLD";
  if (snapshot.phase === "complete") return "SESSION COMPLETE";
  return `ROUND ${snapshot.currentRound}`;
}

export function isLiveRound(phase: RoundPhase): boolean {
  return phase === "countdown" || phase === "work" || phase === "warning" || phase === "rest";
}

export function withMode(prescription: CombatRoundPrescription, sessionMode: CombatSessionMode): CombatRoundPrescription {
  return { ...prescription, sessionMode };
}
