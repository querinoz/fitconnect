import { buildSlots, getTrainPlan, substituteExercise } from "./catalog";
import type { LoggedSet, ReadinessView, TrainCommand, TrainPhase, TrainSnapshot } from "./types";

export const IDLE_SNAPSHOT: TrainSnapshot = {
  phase: "idle",
  resumePhase: null,
  planId: null,
  sessionId: "",
  startedAtMs: null,
  completedAtMs: null,
  slotIndex: 0,
  restRemainingSec: 0,
  restDurationSec: 0,
  workRemainingSec: 0,
  workDurationSec: 0,
  sets: [],
  lastError: null,
  saveStatus: "idle",
  substituted: {}
};

function activePhases(phase: TrainPhase): boolean {
  return phase === "active" || phase === "rest" || phase === "paused";
}

function enterNextSlot(snapshot: TrainSnapshot, nextIndex: number, nowMs: number): TrainSnapshot {
  const plan = snapshot.planId ? getTrainPlan(snapshot.planId) : undefined;
  if (!plan) return { ...snapshot, phase: "complete", completedAtMs: nowMs };
  const slots = buildSlots(applySubs(plan, snapshot.substituted));
  const finished = slots[nextIndex - 1];
  const restSec = finished?.restSec ?? 0;
  if (nextIndex >= slots.length && restSec <= 0) {
    return {
      ...snapshot,
      phase: "complete",
      completedAtMs: nowMs,
      slotIndex: slots.length,
      restRemainingSec: 0
    };
  }
  if (restSec > 0) {
    return {
      ...snapshot,
      phase: "rest",
      slotIndex: nextIndex,
      restDurationSec: restSec,
      restRemainingSec: restSec
    };
  }
  return armWorkTimer({
    ...snapshot,
    phase: "active",
    slotIndex: nextIndex,
    restRemainingSec: 0,
    restDurationSec: 0
  });
}

function completeIfPastEnd(snapshot: TrainSnapshot, nowMs = Date.now()): TrainSnapshot {
  const plan = snapshot.planId ? getTrainPlan(snapshot.planId) : undefined;
  if (!plan) return { ...snapshot, phase: "complete", completedAtMs: snapshot.completedAtMs ?? nowMs };
  const total = buildSlots(applySubs(plan, snapshot.substituted)).length;
  if (snapshot.slotIndex >= total) {
    return {
      ...snapshot,
      phase: "complete",
      completedAtMs: snapshot.completedAtMs ?? nowMs,
      restRemainingSec: 0
    };
  }
  return snapshot;
}

function armWorkTimer(snapshot: TrainSnapshot): TrainSnapshot {
  const slot = currentSlot(snapshot);
  if (slot?.mode === "time" && slot.targetTimeSec && slot.targetTimeSec > 0) {
    return {
      ...snapshot,
      workDurationSec: slot.targetTimeSec,
      workRemainingSec: slot.targetTimeSec
    };
  }
  return { ...snapshot, workDurationSec: 0, workRemainingSec: 0 };
}

function applySubs(
  plan: NonNullable<ReturnType<typeof getTrainPlan>>,
  substituted: Record<string, string>
) {
  let next = plan;
  for (const [fromId, toId] of Object.entries(substituted)) {
    next = substituteExercise(next, fromId, toId);
  }
  return next;
}

export function currentSlot(snapshot: TrainSnapshot) {
  if (!snapshot.planId) return undefined;
  const plan = getTrainPlan(snapshot.planId);
  if (!plan) return undefined;
  const slots = buildSlots(applySubs(plan, snapshot.substituted));
  return slots[snapshot.slotIndex];
}

export function nextSlot(snapshot: TrainSnapshot) {
  if (!snapshot.planId) return undefined;
  const plan = getTrainPlan(snapshot.planId);
  if (!plan) return undefined;
  const slots = buildSlots(applySubs(plan, snapshot.substituted));
  const index = snapshot.phase === "rest" ? snapshot.slotIndex : snapshot.slotIndex + 1;
  return slots[index];
}

export function sessionProgress(snapshot: TrainSnapshot): { done: number; total: number } {
  if (!snapshot.planId) return { done: 0, total: 0 };
  const plan = getTrainPlan(snapshot.planId);
  if (!plan) return { done: 0, total: 0 };
  const total = buildSlots(applySubs(plan, snapshot.substituted)).length;
  return { done: snapshot.sets.length, total };
}

export function previousSetForCurrent(snapshot: TrainSnapshot): LoggedSet | undefined {
  const slot = currentSlot(snapshot);
  if (!slot) return undefined;
  return [...snapshot.sets].reverse().find((item) => item.exerciseId === slot.exerciseId);
}

export function reduceTrain(snapshot: TrainSnapshot, command: TrainCommand): TrainSnapshot {
  switch (command.type) {
    case "restore":
      return {
        ...IDLE_SNAPSHOT,
        ...command.snapshot,
        workRemainingSec: command.snapshot.workRemainingSec ?? 0,
        workDurationSec: command.snapshot.workDurationSec ?? 0
      };
    case "reset":
      return { ...IDLE_SNAPSHOT };
    case "select_plan": {
      if (activePhases(snapshot.phase) && snapshot.phase !== "paused") {
        return { ...snapshot, lastError: "Finish or pause the live session before changing plans." };
      }
      if (!getTrainPlan(command.planId)) {
        return { ...snapshot, lastError: "That session is not in the catalog." };
      }
      return {
        ...IDLE_SNAPSHOT,
        phase: "briefing",
        planId: command.planId,
        lastError: null
      };
    }
    case "start": {
      if (snapshot.phase !== "briefing" || !snapshot.planId) {
        return { ...snapshot, lastError: "Preview a session before starting." };
      }
      return armWorkTimer({
        ...snapshot,
        phase: "active",
        sessionId: command.sessionId,
        startedAtMs: command.nowMs,
        completedAtMs: null,
        slotIndex: 0,
        sets: [],
        lastError: null,
        saveStatus: "idle",
        workRemainingSec: 0,
        workDurationSec: 0
      });
    }
    case "log_set": {
      if (snapshot.phase !== "active") {
        return { ...snapshot, lastError: "Log sets only during the active block." };
      }
      const slot = currentSlot(snapshot);
      if (!slot) return { ...snapshot, phase: "complete", completedAtMs: command.nowMs };
      const logged: LoggedSet = {
        exerciseId: slot.exerciseId,
        name: slot.name,
        setNumber: slot.setNumber,
        reps: command.reps,
        loadKg: command.loadKg,
        timeSec: command.timeSec,
        rpe: command.rpe,
        completedAtMs: command.nowMs,
        skipped: false
      };
      return enterNextSlot(
        { ...snapshot, sets: [...snapshot.sets, logged], lastError: null },
        snapshot.slotIndex + 1,
        command.nowMs
      );
    }
    case "skip_exercise": {
      if (snapshot.phase !== "active") return snapshot;
      const plan = snapshot.planId ? getTrainPlan(snapshot.planId) : undefined;
      if (!plan) return snapshot;
      const slots = buildSlots(applySubs(plan, snapshot.substituted));
      const current = slots[snapshot.slotIndex];
      if (!current) return snapshot;
      const nextDifferent = slots.findIndex(
        (item, index) => index > snapshot.slotIndex && item.exerciseId !== current.exerciseId
      );
      const jumpTo = nextDifferent === -1 ? slots.length : nextDifferent;
      const skippedSets: LoggedSet[] = slots
        .slice(snapshot.slotIndex, jumpTo)
        .map((item) => ({
          exerciseId: item.exerciseId,
          name: item.name,
          setNumber: item.setNumber,
          reps: null,
          loadKg: null,
          timeSec: null,
          rpe: null,
          completedAtMs: command.nowMs,
          skipped: true
        }));
      return enterNextSlot(
        { ...snapshot, sets: [...snapshot.sets, ...skippedSets], lastError: null },
        jumpTo,
        command.nowMs
      );
    }
    case "skip_rest": {
      if (snapshot.phase !== "rest") return snapshot;
      return completeIfPastEnd(
        armWorkTimer({
          ...snapshot,
          phase: "active",
          restRemainingSec: 0,
          restDurationSec: 0
        })
      );
    }
    case "extend_rest": {
      if (snapshot.phase !== "rest") return snapshot;
      const extra = Math.max(0, command.extraSec);
      return {
        ...snapshot,
        restRemainingSec: snapshot.restRemainingSec + extra,
        restDurationSec: snapshot.restDurationSec + extra
      };
    }
    case "pause": {
      if (snapshot.phase !== "active" && snapshot.phase !== "rest") return snapshot;
      return { ...snapshot, resumePhase: snapshot.phase, phase: "paused" };
    }
    case "resume": {
      if (snapshot.phase !== "paused") return snapshot;
      return {
        ...snapshot,
        phase: snapshot.resumePhase === "rest" ? "rest" : "active",
        resumePhase: null
      };
    }
    case "tick": {
      if (snapshot.phase === "active" && snapshot.workRemainingSec > 0) {
        return { ...snapshot, workRemainingSec: snapshot.workRemainingSec - 1 };
      }
      if (snapshot.phase !== "rest") return snapshot;
      if (snapshot.restRemainingSec <= 1) {
        return completeIfPastEnd(
          armWorkTimer({ ...snapshot, phase: "active", restRemainingSec: 0 })
        );
      }
      return { ...snapshot, restRemainingSec: snapshot.restRemainingSec - 1 };
    }
    case "finish": {
      if (!activePhases(snapshot.phase) && snapshot.phase !== "paused") return snapshot;
      return {
        ...snapshot,
        phase: "complete",
        completedAtMs: command.nowMs,
        restRemainingSec: 0
      };
    }
    case "mark_save":
      return { ...snapshot, saveStatus: command.status, lastError: command.error ?? snapshot.lastError };
    case "substitute": {
      if (snapshot.phase !== "briefing" && snapshot.phase !== "active") return snapshot;
      const slot = currentSlot(snapshot);
      if (!slot) return snapshot;
      if (!slot.substitutions.includes(command.replacementExerciseId)) {
        return { ...snapshot, lastError: "That substitute is not available for this movement." };
      }
      return {
        ...snapshot,
        substituted: { ...snapshot.substituted, [slot.exerciseId]: command.replacementExerciseId },
        lastError: null
      };
    }
    default:
      return snapshot;
  }
}

export function durationMs(snapshot: TrainSnapshot, nowMs = Date.now()): number {
  if (!snapshot.startedAtMs) return 0;
  const end = snapshot.completedAtMs ?? nowMs;
  return Math.max(0, end - snapshot.startedAtMs);
}

export function volumeKg(snapshot: TrainSnapshot): number {
  return snapshot.sets.reduce((sum, set) => {
    if (set.skipped || set.reps == null || set.loadKg == null) return sum;
    return sum + set.reps * set.loadKg;
  }, 0);
}

export function zenithCues(snapshot: TrainSnapshot, readiness: ReadinessView): string[] {
  const cues: string[] = [];
  const plan = snapshot.planId ? getTrainPlan(snapshot.planId) : undefined;
  if (plan) cues.push(plan.zenithNote);
  if (readiness.available && readiness.score != null && readiness.band) {
    cues.push(
      `Readiness ${readiness.score} (${readiness.band}) from ${readiness.source}. This is your private score — not a social metric.`
    );
  } else {
    cues.push(readiness.detail);
  }
  const previous = previousSetForCurrent(snapshot);
  if (previous && !previous.skipped) {
    const bits = [
      previous.reps != null ? `${previous.reps} reps` : null,
      previous.loadKg != null ? `${previous.loadKg} kg` : null,
      previous.rpe != null ? `RPE ${previous.rpe}` : null
    ].filter(Boolean);
    if (bits.length) cues.push(`Previous logged set: ${bits.join(" at ")}.`);
  }
  if (snapshot.phase === "rest") {
    cues.push("Rest is programmed. Optional slow breathing — not a measured recovery signal.");
  }
  return cues;
}

export function formatTimer(totalSec: number): string {
  const sec = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
