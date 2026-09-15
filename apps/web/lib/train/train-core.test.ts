import { describe, expect, it } from "vitest";
import { TRAIN_PLANS, buildSlots, filterPlans, getTrainPlan, substituteExercise } from "./catalog";
import {
  IDLE_SNAPSHOT,
  currentSlot,
  durationMs,
  formatTimer,
  reduceTrain,
  sessionProgress,
  volumeKg,
  zenithCues
} from "./machine";
import { readinessFromApi } from "./readiness";
import { recommendPlan } from "./recommend";
import { bestSetFromHistory } from "./persistence";

describe("TRAIN catalog", () => {
  it("ships a multi-sport library with honest metadata and no calorie claims", () => {
    expect(TRAIN_PLANS.length).toBeGreaterThanOrEqual(8);
    const sports = new Set(TRAIN_PLANS.map((plan) => plan.sport));
    expect(sports.has("strength")).toBe(true);
    expect(sports.has("running")).toBe(true);
    expect(sports.has("recovery")).toBe(true);
    for (const plan of TRAIN_PLANS) {
      expect(JSON.stringify(plan)).not.toMatch(/\d+\s*kcal|\d+\s*calories/i);
      expect(plan.exercises.length).toBeGreaterThan(0);
      expect(plan.purpose.length).toBeGreaterThan(8);
    }
  });

  it("filters by sport, duration, and location", () => {
    const home = filterPlans({ location: "home", maxDuration: 20 });
    expect(home.every((plan) => plan.location === "home" && plan.durationMin <= 20)).toBe(true);
    expect(filterPlans({ sport: "hiit" }).map((plan) => plan.id)).toContain("plan_hiit_v1");
    expect(getTrainPlan("plan_warmup_v1")?.trainingType).toBe("warm-up");
    expect(filterPlans({ trainingType: "cool-down" }).map((plan) => plan.id)).toContain("plan_cooldown_v1");
  });

  it("substitutes a movement without inventing load history", () => {
    const plan = getTrainPlan("plan_upper_push_v2")!;
    const next = substituteExercise(plan, "ex_bench_press", "ex_dumbbell_press");
    expect(next.exercises[0]?.exerciseId).toBe("ex_dumbbell_press");
    expect(next.exercises[0]?.name).toMatch(/dumbbell/i);
  });
});

describe("TRAIN readiness honesty", () => {
  it("does not invent a band when the API has no score", () => {
    const view = readinessFromApi({ score: null, source: "insufficient_data" });
    expect(view.available).toBe(false);
    expect(view.band).toBeNull();
    expect(view.detail.toLowerCase()).toMatch(/unavailable|invent/);
  });

  it("maps a real score to a band", () => {
    const view = readinessFromApi({ score: 81, source: "profile" });
    expect(view.band).toBe("PRIMED");
    expect(view.available).toBe(true);
  });
});

describe("TRAIN recommendation", () => {
  it("refuses to claim adaptation without data", () => {
    const rec = recommendPlan(readinessFromApi({ score: null, source: "insufficient_data" }));
    expect(rec.adapted).toBe(false);
    expect(rec.plan.id).toBe("plan_upper_push_v2");
    expect(rec.reason.toLowerCase()).toMatch(/not an adapted/);
  });

  it("selects restore work when a real restore band exists", () => {
    const rec = recommendPlan(readinessFromApi({ score: 22, source: "profile" }));
    expect(rec.adapted).toBe(true);
    expect(rec.plan.plannedIntensity).toBe("restore");
  });
});

describe("TRAIN state machine", () => {
  it("runs discover → prep → active → rest → completing with logged volume", () => {
    const plan = getTrainPlan("plan_recovery_v1")!;
    const slots = buildSlots(plan);
    let snap = reduceTrain(IDLE_SNAPSHOT, { type: "select_plan", planId: plan.id });
    expect(snap.phase).toBe("prep");
    snap = reduceTrain(snap, { type: "start", nowMs: 1_000, sessionId: "sess-1" });
    expect(snap.phase).toBe("active");
    expect(currentSlot(snap)?.name).toBe(slots[0]?.name);

    for (let i = 0; i < slots.length; i += 1) {
      if (snap.phase === "rest") {
        snap = reduceTrain(snap, { type: "skip_rest" });
      }
      if (snap.phase === "completing" || snap.phase === "complete") break;
      const slot = currentSlot(snap)!;
      snap = reduceTrain(snap, {
        type: "log_set",
        nowMs: 2_000 + i * 1_000,
        reps: slot.mode === "reps" || slot.mode === "bodyweight" ? slot.targetRepsMax : null,
        loadKg: slot.weighted ? slot.targetLoadKg : null,
        timeSec: slot.mode === "time" ? slot.targetTimeSec : null,
        rpe: 6
      });
    }
    while (snap.phase === "rest") {
      snap = reduceTrain(snap, { type: "skip_rest" });
      if (snap.phase === "active" || snap.phase === "warmup") {
        snap = reduceTrain(snap, { type: "finish", nowMs: 50_000 });
      }
    }
    if (snap.phase !== "completing" && snap.phase !== "complete") {
      snap = reduceTrain(snap, { type: "finish", nowMs: 50_000 });
    }
    expect(snap.phase).toBe("completing");
    snap = reduceTrain(snap, { type: "mark_save", status: "saved" });
    expect(snap.phase).toBe("complete");
    expect(snap.sets.length).toBeGreaterThan(0);
    expect(durationMs(snap)).toBeGreaterThan(0);
  });

  it("extends rest, pauses, and does not invent heart rate cues", () => {
    let snap = reduceTrain(IDLE_SNAPSHOT, { type: "select_plan", planId: "plan_hiit_v1" });
    snap = reduceTrain(snap, { type: "start", nowMs: 0, sessionId: "s2" });
    snap = reduceTrain(snap, {
      type: "log_set",
      nowMs: 1,
      reps: null,
      loadKg: null,
      timeSec: 30,
      rpe: 8
    });
    expect(snap.phase).toBe("rest");
    snap = reduceTrain(snap, { type: "extend_rest", extraSec: 30 });
    expect(snap.restRemainingSec).toBe(60);
    snap = reduceTrain(snap, { type: "pause" });
    expect(snap.phase).toBe("paused");
    snap = reduceTrain(snap, { type: "resume" });
    expect(snap.phase).toBe("rest");
    const cues = zenithCues(snap, readinessFromApi({ score: null }));
    expect(cues.join(" ").toLowerCase()).not.toMatch(/\bhrv\b.*dropped|heart rate is 1\d\d/);
    expect(cues.join(" ")).toMatch(/unavailable|not a measured/i);
  });

  it("skips an entire exercise and formats the timer", () => {
    let snap = reduceTrain(IDLE_SNAPSHOT, { type: "select_plan", planId: "plan_upper_push_v2" });
    snap = reduceTrain(snap, { type: "start", nowMs: 0, sessionId: "s3" });
    const before = currentSlot(snap)?.exerciseId;
    snap = reduceTrain(snap, { type: "skip_exercise", nowMs: 10 });
    expect(currentSlot(snap)?.exerciseId).not.toBe(before);
    expect(snap.sets.every((set) => set.skipped)).toBe(true);
    expect(formatTimer(75)).toBe("1:15");
    expect(sessionProgress(snap).total).toBeGreaterThan(sessionProgress(snap).done);
  });

  it("computes volume only from logged load × reps", () => {
    let snap = reduceTrain(IDLE_SNAPSHOT, { type: "select_plan", planId: "plan_upper_push_v2" });
    snap = reduceTrain(snap, { type: "start", nowMs: 0, sessionId: "s4" });
    snap = reduceTrain(snap, {
      type: "log_set",
      nowMs: 1,
      reps: 5,
      loadKg: 60,
      timeSec: null,
      rpe: 7
    });
    expect(volumeKg(snap)).toBe(300);
  });

  it("arms a timed work countdown without inventing heart rate", () => {
    let snap = reduceTrain(IDLE_SNAPSHOT, { type: "select_plan", planId: "plan_hiit_v1" });
    snap = reduceTrain(snap, { type: "start", nowMs: 0, sessionId: "timed" });
    expect(snap.workRemainingSec).toBeGreaterThan(0);
    const remaining = snap.workRemainingSec;
    snap = reduceTrain(snap, { type: "tick" });
    expect(snap.workRemainingSec).toBe(remaining - 1);
    expect(snap.phase).toBe("active");
  });

  it("reads a previous best from device history only", () => {
    const best = bestSetFromHistory(
      [
        {
          sessionId: "old",
          planId: "plan_upper_push_v2",
          completedAtMs: 1,
          durationMs: 1_000,
          sets: 1,
          volumeKg: 200,
          saveStatus: "local_only",
          bestSets: [
            { exerciseId: "ex_bench_press", name: "Barbell bench press", reps: 5, loadKg: 40, rpe: 7 }
          ]
        }
      ],
      "ex_bench_press"
    );
    expect(best?.loadKg).toBe(40);
  });

  it("starts warm-up plans in WARMUP and restores legacy briefing snapshots as PREP", () => {
    let snap = reduceTrain(IDLE_SNAPSHOT, { type: "select_plan", planId: "plan_warmup_v1" });
    expect(snap.phase).toBe("prep");
    snap = reduceTrain(snap, { type: "start", nowMs: 0, sessionId: "warm" });
    expect(snap.phase).toBe("warmup");
    snap = reduceTrain(snap, { type: "interrupt", reason: "background" });
    expect(snap.phase).toBe("interrupted");
    snap = reduceTrain(snap, { type: "resume" });
    expect(snap.phase).toBe("warmup");

    const restored = reduceTrain(IDLE_SNAPSHOT, {
      type: "restore",
      snapshot: {
        ...IDLE_SNAPSHOT,
        phase: "briefing" as never,
        planId: "plan_hiit_v1",
        saveStatus: "saving" as never
      }
    });
    expect(restored.phase).toBe("prep");
    expect(restored.saveStatus).toBe("save_pending");
  });

  it("keeps substitution and completing as explicit states", () => {
    let snap = reduceTrain(IDLE_SNAPSHOT, { type: "select_plan", planId: "plan_upper_push_v2" });
    snap = reduceTrain(snap, { type: "start", nowMs: 0, sessionId: "sub" });
    snap = reduceTrain(snap, { type: "enter_substitution" });
    expect(snap.phase).toBe("substituting");
    snap = reduceTrain(snap, { type: "substitute", replacementExerciseId: "ex_dumbbell_press" });
    expect(snap.phase).toBe("active");
    expect(currentSlot(snap)?.exerciseId).toBe("ex_dumbbell_press");
    snap = reduceTrain(snap, { type: "finish", nowMs: 9 });
    expect(snap.phase).toBe("completing");
    snap = reduceTrain(snap, { type: "mark_save", status: "save_pending" });
    expect(snap.phase).toBe("completing");
    snap = reduceTrain(snap, { type: "mark_save", status: "failed", error: "Cloud save failed." });
    expect(snap.phase).toBe("complete");
    expect(snap.saveStatus).toBe("failed");
  });
});
