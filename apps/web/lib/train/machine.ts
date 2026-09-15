import { buildSlots, getTrainPlan, substituteExercise } from "./catalog";
import type { LoggedSet, ReadinessView, SaveStatus, TrainCommand, TrainPhase, TrainSnapshot } from "./types";

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

const WORK_PHASES: TrainPhase[] = ["warmup", "active"];
const TIMER_PHASES: TrainPhase[] = ["warmup", "active", "rest"];
const HOLD_PHASES: TrainPhase[] = ["paused", "interrupted", "substituting"];
const LIVE_PHASES: TrainPhase[] = [
  "warmup",
  "active",
  "rest",
  "paused",
  "substituting",
  "interrupted"
];

function isWorkPhase(phase: TrainPhase): boolean {
  return WORK_PHASES.includes(phase);
}

function isLivePhase(phase: TrainPhase): boolean {
  return LIVE_PHASES.includes(phase);
}

function workPhaseForPlan(planId: string | null): TrainPhase {
  const plan = planId ? getTrainPlan(planId) : undefined;
  if (plan?.trainingType === "warm-up") return "warmup";
  return "active";
}

function restoreWorkPhase(snapshot: TrainSnapshot): TrainPhase {
  if (snapshot.resumePhase === "rest") return "rest";
  if (snapshot.resumePhase === "warmup") return "warmup";
  if (snapshot.resumePhase === "active") return "active";
  return workPhaseForPlan(snapshot.planId);
}

function completing(snapshot: TrainSnapshot, nowMs: number, slotIndex = snapshot.slotIndex): TrainSnapshot {
  return {
    ...snapshot,
    phase: "completing",
    completedAtMs: snapshot.completedAtMs ?? nowMs,
    slotIndex,
    restRemainingSec: 0,
    restDurationSec: 0,
    workRemainingSec: 0,
    lastError: null
  };
}

function enterNextSlot(snapshot: TrainSnapshot, nextIndex: number, nowMs: number): TrainSnapshot {
  const plan = snapshot.planId ? getTrainPlan(snapshot.planId) : undefined;
  if (!plan) return completing(snapshot, nowMs);
  const slots = buildSlots(applySubs(plan, snapshot.substituted));
  const finished = slots[nextIndex - 1];
  const restSec = finished?.restSec ?? 0;
  if (nextIndex >= slots.length && restSec <= 0) {
    return completing(snapshot, nowMs, slots.length);
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
    phase: workPhaseForPlan(snapshot.planId),
    slotIndex: nextIndex,
    restRemainingSec: 0,
    restDurationSec: 0
  });
}

function completeIfPastEnd(snapshot: TrainSnapshot, nowMs = Date.now()): TrainSnapshot {
  const plan = snapshot.planId ? getTrainPlan(snapshot.planId) : undefined;
  if (!plan) return completing(snapshot, nowMs);
  const total = buildSlots(applySubs(plan, snapshot.substituted)).length;
  if (snapshot.slotIndex >= total) {
    return completing(snapshot, nowMs, total);
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

export function normalizeTrainSnapshot(raw: TrainSnapshot): TrainSnapshot {
  const legacyPhase = raw.phase as string;
  const phase: TrainPhase =
    legacyPhase === "briefing" ? "prep" : ((legacyPhase as TrainPhase) ?? "idle");
  const legacySave = raw.saveStatus as string;
  const saveStatus: SaveStatus =
    legacySave === "saving" ? "save_pending" : ((raw.saveStatus as SaveStatus) ?? "idle");
  return {
    ...IDLE_SNAPSHOT,
    ...raw,
    phase,
    saveStatus,
    workRemainingSec: raw.workRemainingSec ?? 0,
    workDurationSec: raw.workDurationSec ?? 0,
    resumePhase:
      raw.resumePhase === ("briefing" as TrainPhase) ? "prep" : (raw.resumePhase ?? null)
  };
}

export function reduceTrain(snapshot: TrainSnapshot, command: TrainCommand): TrainSnapshot {
  switch (command.type) {
    case "restore":
      return normalizeTrainSnapshot(command.snapshot);
    case "reset":
      return { ...IDLE_SNAPSHOT };
    case "select_plan": {
      if (isLivePhase(snapshot.phase) && !HOLD_PHASES.includes(snapshot.phase)) {
        return { ...snapshot, lastError: "Finish or pause the live session before changing plans." };
      }
      if (HOLD_PHASES.includes(snapshot.phase) && snapshot.phase !== "paused") {
        return { ...snapshot, lastError: "Resume or finish the interrupted session before changing plans." };
      }
      if (snapshot.phase === "paused") {
        return { ...snapshot, lastError: "Finish or resume the paused session before changing plans." };
      }
      if (!getTrainPlan(command.planId)) {
        return { ...snapshot, lastError: "That session is not in the catalog." };
      }
      return {
        ...IDLE_SNAPSHOT,
        phase: "prep",
        planId: command.planId,
        lastError: null
      };
    }
    case "start": {
      if (snapshot.phase !== "prep" || !snapshot.planId) {
        return { ...snapshot, lastError: "Preview a session before starting." };
      }
      return armWorkTimer({
        ...snapshot,
        phase: workPhaseForPlan(snapshot.planId),
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
      if (!isWorkPhase(snapshot.phase)) {
        return { ...snapshot, lastError: "Log sets only during the work block." };
      }
      const slot = currentSlot(snapshot);
      if (!slot) return completing(snapshot, command.nowMs);
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
      if (!isWorkPhase(snapshot.phase)) return snapshot;
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
          phase: workPhaseForPlan(snapshot.planId),
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
      if (!TIMER_PHASES.includes(snapshot.phase)) return snapshot;
      return { ...snapshot, resumePhase: snapshot.phase, phase: "paused", lastError: null };
    }
    case "interrupt": {
      if (!TIMER_PHASES.includes(snapshot.phase)) return snapshot;
      return {
        ...snapshot,
        resumePhase: snapshot.phase,
        phase: "interrupted",
        lastError: command.reason === "background"
          ? "Session interrupted while the app was in the background. Resume to continue — completed sets are kept."
          : "Session interrupted. Resume to continue — completed sets are kept."
      };
    }
    case "resume": {
      if (snapshot.phase !== "paused" && snapshot.phase !== "interrupted") return snapshot;
      return {
        ...snapshot,
        phase: restoreWorkPhase(snapshot),
        resumePhase: null,
        lastError: null
      };
    }
    case "enter_substitution": {
      if (!isWorkPhase(snapshot.phase) && snapshot.phase !== "prep") return snapshot;
      return { ...snapshot, resumePhase: snapshot.phase, phase: "substituting", lastError: null };
    }
    case "cancel_substitution": {
      if (snapshot.phase !== "substituting") return snapshot;
      return {
        ...snapshot,
        phase: snapshot.resumePhase === "prep" ? "prep" : restoreWorkPhase(snapshot),
        resumePhase: null
      };
    }
    case "tick": {
      if (isWorkPhase(snapshot.phase) && snapshot.workRemainingSec > 0) {
        const remaining = snapshot.workRemainingSec - 1;
        const plan = snapshot.planId ? getTrainPlan(snapshot.planId) : undefined;
        const slot = currentSlot(snapshot);
        if (remaining <= 0 && plan?.combat && slot?.mode === "time") {
          const nowMs = Date.now();
          const logged: LoggedSet = {
            exerciseId: slot.exerciseId,
            name: slot.name,
            setNumber: slot.setNumber,
            reps: null,
            loadKg: null,
            timeSec: slot.targetTimeSec,
            rpe: null,
            completedAtMs: nowMs,
            skipped: false
          };
          return enterNextSlot(
            { ...snapshot, workRemainingSec: 0, sets: [...snapshot.sets, logged], lastError: null },
            snapshot.slotIndex + 1,
            nowMs
          );
        }
        return { ...snapshot, workRemainingSec: remaining };
      }
      if (snapshot.phase !== "rest") return snapshot;
      if (snapshot.restRemainingSec <= 1) {
        return completeIfPastEnd(
          armWorkTimer({
            ...snapshot,
            phase: workPhaseForPlan(snapshot.planId),
            restRemainingSec: 0
          })
        );
      }
      return { ...snapshot, restRemainingSec: snapshot.restRemainingSec - 1 };
    }
    case "finish": {
      if (!isLivePhase(snapshot.phase)) return snapshot;
      return completing(snapshot, command.nowMs);
    }
    case "mark_save": {
      const terminal =
        command.status === "saved" || command.status === "failed" || command.status === "local_only";
      return {
        ...snapshot,
        phase: snapshot.phase === "completing" && terminal ? "complete" : snapshot.phase,
        saveStatus: command.status,
        lastError:
          command.error !== undefined
            ? command.error
            : command.status === "saved"
              ? null
              : snapshot.lastError
      };
    }
    case "substitute": {
      if (
        snapshot.phase !== "prep" &&
        snapshot.phase !== "substituting" &&
        !isWorkPhase(snapshot.phase)
      ) {
        return snapshot;
      }
      const slot = currentSlot(
        snapshot.phase === "prep" ? { ...snapshot, slotIndex: 0 } : snapshot
      );
      if (!slot) return snapshot;
      if (!slot.substitutions.includes(command.replacementExerciseId)) {
        return { ...snapshot, lastError: "That substitute is not available for this movement." };
      }
      const applied = {
        ...snapshot,
        substituted: { ...snapshot.substituted, [slot.exerciseId]: command.replacementExerciseId },
        lastError: null
      };
      if (snapshot.phase === "substituting") {
        return {
          ...applied,
          phase: snapshot.resumePhase === "prep" ? "prep" : restoreWorkPhase(snapshot),
          resumePhase: null
        };
      }
      return applied;
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
  if (plan?.combat) {
    cues.push(
      `FIGHT MODE · ${plan.combat.disciplineId.replace(/_/g, " ")} · ${plan.combat.roundCount} × ${plan.combat.roundDurationSec}s. ${plan.combat.focus}`
    );
  }
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
  if (snapshot.phase === "interrupted") {
    cues.push("Timers are frozen. Nothing was uploaded while interrupted.");
  }
  if (snapshot.phase === "warmup") {
    cues.push("Warm-up block. Heart rate stays blank unless a connected source is streaming.");
  }
  return cues;
}

export function formatTimer(totalSec: number): string {
  const sec = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
