"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode
} from "react";
import Link from "next/link";
import { BentoCard } from "@/components/elite-os/bento-card";
import { useAuthStore } from "@/lib/auth-store";
import {
  TRAIN_FILTERS,
  buildSlots,
  filterPlans,
  findAnyExercise,
  getTrainPlan
} from "@/lib/train/catalog";
import { success as hapticSuccess, tap as hapticTap } from "@/lib/pwa/haptics";
import { notifyTrainProgress } from "@/lib/train/progress";
import {
  IDLE_SNAPSHOT,
  currentSlot,
  durationMs,
  formatTimer,
  nextSlot,
  previousSetForCurrent,
  reduceTrain,
  sessionProgress,
  volumeKg,
  zenithCues
} from "@/lib/train/machine";
import {
  bestSetFromHistory,
  clearTrainSnapshot,
  devicePrs,
  listLocalHistory,
  loadTrainSnapshot,
  persistTrainSnapshot,
  recordLocalHistory,
  setsForHistory
} from "@/lib/train/persistence";
import { readinessFromApi } from "@/lib/train/readiness";
import { recommendPlan } from "@/lib/train/recommend";
import type { ReadinessView, TrainPlan, TrainSnapshot } from "@/lib/train/types";
import { TRAIN_PHASE_LABEL } from "@/lib/train/types";
import { cn } from "@/lib/utils";

const FILTER_CHIPS = [
  { id: "all", label: "All" },
  { id: "strength", label: "Strength" },
  { id: "hypertrophy", label: "Hypertrophy" },
  { id: "running", label: "Run" },
  { id: "cycling", label: "Cycle" },
  { id: "hiit", label: "HIIT" },
  { id: "mobility", label: "Mobility" },
  { id: "recovery", label: "Recovery" },
  { id: "conditioning", label: "Conditioning" },
  { id: "sport", label: "Sport" },
  { id: "endurance", label: "Endurance" }
] as const;

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `train-${Date.now()}`;
}

async function fetchReadiness(): Promise<ReadinessView> {
  try {
    const res = await fetch("/api/v1/readiness", { credentials: "include" });
    if (!res.ok) return readinessFromApi({ score: null, source: "unauthorized" });
    const body = (await res.json()) as { score?: number | null; source?: string };
    return readinessFromApi(body);
  } catch {
    return readinessFromApi({ score: null, source: "offline" });
  }
}

export function TrainExperience() {
  const user = useAuthStore((s) => s.user);
  const [snapshot, setSnapshot] = useState<TrainSnapshot>(() => reduceTrain(IDLE_SNAPSHOT, { type: "reset" }));
  const [readiness, setReadiness] = useState<ReadinessView>(() =>
    readinessFromApi({ score: null, source: "pending" })
  );
  const [sport, setSport] = useState("all");
  const [maxDuration, setMaxDuration] = useState<number | undefined>(undefined);
  const [difficulty, setDifficulty] = useState("all");
  const [location, setLocation] = useState("all");
  const [equipment, setEquipment] = useState("all");
  const [trainingType, setTrainingType] = useState("all");
  const [offline, setOffline] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [ascendNote, setAscendNote] = useState<string | null>(null);
  const [reps, setReps] = useState("");
  const [load, setLoad] = useState("");
  const [rpe, setRpe] = useState<number | null>(null);
  const restored = useRef(false);
  const saveStartedFor = useRef<string | null>(null);

  const dispatch = useCallback((command: Parameters<typeof reduceTrain>[1]) => {
    setSnapshot((current) => reduceTrain(current, command));
  }, []);

  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    const saved = loadTrainSnapshot();
    if (saved && saved.phase !== "idle") {
      dispatch({ type: "restore", snapshot: saved });
    }
    void fetchReadiness().then(setReadiness);
  }, [dispatch]);

  useEffect(() => {
    persistTrainSnapshot(snapshot);
  }, [snapshot]);

  useEffect(() => {
    const onStatus = () => setOffline(typeof navigator !== "undefined" && navigator.onLine === false);
    onStatus();
    window.addEventListener("online", onStatus);
    window.addEventListener("offline", onStatus);
    return () => {
      window.removeEventListener("online", onStatus);
      window.removeEventListener("offline", onStatus);
    };
  }, []);

  useEffect(() => {
    const liveTimers =
      snapshot.phase === "rest" || snapshot.phase === "active" || snapshot.phase === "warmup";
    if (!liveTimers) return;
    const id = window.setInterval(() => {
      setNowMs(Date.now());
      dispatch({ type: "tick" });
    }, 1000);
    return () => window.clearInterval(id);
  }, [snapshot.phase, dispatch]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        dispatch({ type: "interrupt", reason: "background" });
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [dispatch]);

  const slot = currentSlot(snapshot);
  const slotKey = `${snapshot.phase}:${slot?.slotIndex ?? "none"}:${slot?.exerciseId ?? ""}`;
  const nextReps =
    slot && (slot.mode === "reps" || slot.mode === "bodyweight") ? String(slot.targetRepsMax) : "";
  const nextLoad = slot?.weighted && slot.targetLoadKg != null ? String(slot.targetLoadKg) : "";
  useEffect(() => {
    setReps(nextReps);
    setLoad(nextLoad);
    setRpe(null);
  }, [slotKey, nextReps, nextLoad]);

  const recommendation = useMemo(() => recommendPlan(readiness), [readiness]);
  const plans = useMemo(
    () =>
      filterPlans({
        sport,
        difficulty,
        location,
        equipment,
        trainingType,
        maxDuration
      }),
    [sport, difficulty, location, equipment, trainingType, maxDuration]
  );
  const plan = snapshot.planId ? getTrainPlan(snapshot.planId) : undefined;
  const progress = sessionProgress(snapshot);
  const cues = zenithCues(snapshot, readiness);
  const previous = previousSetForCurrent(snapshot);
  const upcoming = nextSlot(snapshot);
  const elapsed = formatTimer(Math.floor(durationMs(snapshot, nowMs) / 1000));
  const live =
    snapshot.phase === "active" ||
    snapshot.phase === "warmup" ||
    snapshot.phase === "rest" ||
    snapshot.phase === "paused" ||
    snapshot.phase === "interrupted" ||
    snapshot.phase === "substituting";
  const done = snapshot.phase === "completing" || snapshot.phase === "complete";
  const historyBest = slot
    ? bestSetFromHistory(listLocalHistory(), slot.exerciseId, snapshot.sessionId)
    : null;

  async function saveCompletion(next: TrainSnapshot) {
    if (!next.planId || !next.sessionId || !next.startedAtMs || !next.completedAtMs) return;
    const body = {
      activityId: next.sessionId,
      userId: user?.id ?? "",
      sessionId: next.sessionId,
      idempotencyKey: `train:${next.sessionId}`,
      provider: "MANUAL",
      sport: (getTrainPlan(next.planId)?.sport ?? "strength").toUpperCase(),
      startedAtMs: next.startedAtMs,
      completedAtMs: next.completedAtMs,
      durationMs: durationMs(next),
      metrics: {
        sets: next.sets.length,
        volumeKg: volumeKg(next),
        skipped: next.sets.filter((set) => set.skipped).length
      },
      metadata: { workoutId: next.planId, surface: "web-train" }
    };
    recordLocalHistory({
      sessionId: next.sessionId,
      planId: next.planId,
      completedAtMs: next.completedAtMs,
      durationMs: durationMs(next),
      sets: next.sets.filter((set) => !set.skipped).length,
      volumeKg: volumeKg(next),
      saveStatus: "local_only",
      bestSets: setsForHistory(next.sets)
    });
    const progress = await notifyTrainProgress({
      sessionId: next.sessionId,
      durationMs: durationMs(next),
      planId: next.planId
    });
    if (progress.status === "applied" && progress.awardedXp != null) {
      setAscendNote(`Ascend recorded +${progress.awardedXp} XP from this session.`);
    } else if (progress.status === "duplicate") {
      setAscendNote("This session was already counted in Ascend.");
    } else if (progress.status === "local_only" || progress.status === "offline") {
      setAscendNote("Ascend cloud is unavailable. Session stays on this device.");
    } else if (progress.status === "unauthorized") {
      setAscendNote("Sign in to write Ascend progress. Local history is kept.");
    } else {
      setAscendNote("Ascend was not updated. Training history on this device is intact.");
    }
    if (!user?.id) {
      dispatch({
        type: "mark_save",
        status: "local_only",
        error: "Signed-in cloud save needs an account. This session is kept on this device."
      });
      return;
    }
    dispatch({ type: "mark_save", status: "save_pending" });
    try {
      const res = await fetch("/api/v1/workout-sessions", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.status === 503) {
        dispatch({
          type: "mark_save",
          status: "local_only",
          error: "Cloud database is not configured. Session kept on this device."
        });
        return;
      }
      if (!res.ok) {
        dispatch({
          type: "mark_save",
          status: "failed",
          error: "Cloud save failed. Your sets are still on this device."
        });
        return;
      }
      recordLocalHistory({
        sessionId: next.sessionId,
        planId: next.planId,
        completedAtMs: next.completedAtMs,
        durationMs: durationMs(next),
        sets: next.sets.filter((set) => !set.skipped).length,
        volumeKg: volumeKg(next),
        saveStatus: "saved",
        bestSets: setsForHistory(next.sets)
      });
      dispatch({ type: "mark_save", status: "saved" });
    } catch {
      dispatch({
        type: "mark_save",
        status: "local_only",
        error: "Offline. Session kept on this device and can sync later."
      });
    }
  }

  function finishNow() {
    dispatch({ type: "finish", nowMs: Date.now() });
  }

  useEffect(() => {
    if (snapshot.phase !== "completing") return;
    if (snapshot.saveStatus !== "idle") return;
    if (!snapshot.sessionId || saveStartedFor.current === snapshot.sessionId) return;
    saveStartedFor.current = snapshot.sessionId;
    void saveCompletion(snapshot);
    // saveCompletion closes over the current snapshot; status updates go through dispatch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot.phase, snapshot.sessionId, snapshot.saveStatus]);

  return (
    <div
      className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 pb-28 lg:pb-10"
      data-testid="train-experience"
    >
      <header className="space-y-3">
        <p className="eos-label-caps text-eos-voltline">TRAIN</p>
        <h1 className="eos-headline text-4xl italic tracking-tight text-eos-on-surface sm:text-6xl">
          {snapshot.phase === "complete" || snapshot.phase === "completing"
            ? "Session in the book."
            : live
              ? "Stay with this block."
              : "Your session is about to begin."}
        </h1>
        <p className="max-w-2xl text-sm text-eos-on-surface-muted sm:text-base">
          Discover, prep, train, rest, finish. Heart rate, HRV and calories stay blank unless a
          real source provides them.
        </p>
        <div className="flex flex-wrap gap-2">
          <StatusChip
            label={readiness.available && readiness.band ? readiness.band : "DATA UNAVAILABLE"}
            tone={readiness.available ? "live" : "muted"}
          />
          {offline ? <StatusChip label="OFFLINE" tone="warn" /> : null}
          {snapshot.phase !== "idle" ? (
            <StatusChip label={TRAIN_PHASE_LABEL[snapshot.phase]} tone={live ? "live" : "muted"} />
          ) : null}
        </div>
      </header>

      {snapshot.phase === "idle" ? (
        <ReadinessCard readiness={readiness} recommendation={recommendation} onOpen={() => dispatch({ type: "select_plan", planId: recommendation.plan.id })} />
      ) : null}

      {snapshot.phase === "idle" && (
        <>
          <FilterBar
            sport={sport}
            difficulty={difficulty}
            location={location}
            equipment={equipment}
            trainingType={trainingType}
            maxDuration={maxDuration}
            onSport={setSport}
            onDifficulty={setDifficulty}
            onLocation={setLocation}
            onEquipment={setEquipment}
            onTrainingType={setTrainingType}
            onDuration={setMaxDuration}
          />
          <section aria-label="Workout library" className="grid gap-4 md:grid-cols-2">
            {plans.length === 0 ? (
              <BentoCard label="EMPTY" className="md:col-span-2">
                <p>No sessions match those filters. Clear a filter to see the catalog.</p>
              </BentoCard>
            ) : (
              plans.map((item) => (
                <WorkoutCard
                  key={item.id}
                  plan={item}
                  recommended={item.id === recommendation.plan.id}
                  selected={item.id === snapshot.planId}
                  onSelect={() => dispatch({ type: "select_plan", planId: item.id })}
                />
              ))
            )}
          </section>
        </>
      )}

      {snapshot.phase === "prep" && plan ? (
        <Briefing
          plan={plan}
          readiness={readiness}
          cues={cues}
          onStart={() => {
            hapticTap();
            dispatch({ type: "start", nowMs: Date.now(), sessionId: newId() });
          }}
          onBack={() => dispatch({ type: "reset" })}
        />
      ) : null}

      {(snapshot.phase === "active" || snapshot.phase === "warmup") && plan && slot ? (
        <LiveBlock
          plan={plan}
          snapshot={snapshot}
          slot={slot}
          upcoming={upcoming}
          previous={previous}
          historyBest={historyBest}
          progress={progress}
          elapsed={elapsed}
          cues={cues}
          reps={reps}
          load={load}
          rpe={rpe}
          onReps={setReps}
          onLoad={setLoad}
          onRpe={setRpe}
          onLog={() => {
            hapticSuccess();
            dispatch({
              type: "log_set",
              nowMs: Date.now(),
              reps: reps ? Number(reps) : null,
              loadKg: load ? Number(load) : null,
              timeSec: slot.targetTimeSec,
              rpe
            });
          }}
          onSkip={() => dispatch({ type: "skip_exercise", nowMs: Date.now() })}
          onPause={() => dispatch({ type: "pause" })}
          onFinish={finishNow}
          onOpenSubstitution={() => dispatch({ type: "enter_substitution" })}
        />
      ) : null}

      {snapshot.phase === "rest" && plan ? (
        <RestBlock
          snapshot={snapshot}
          upcoming={currentSlot(snapshot) ?? upcoming}
          progress={progress}
          elapsed={elapsed}
          cues={cues}
          onSkip={() => dispatch({ type: "skip_rest" })}
          onPlus15={() => dispatch({ type: "extend_rest", extraSec: 15 })}
          onPlus30={() => dispatch({ type: "extend_rest", extraSec: 30 })}
          onPause={() => dispatch({ type: "pause" })}
        />
      ) : null}

      {snapshot.phase === "paused" || snapshot.phase === "interrupted" ? (
        <BentoCard
          label={snapshot.phase === "interrupted" ? "INTERRUPTED" : "PAUSED"}
          elevation="glass"
          data-testid={snapshot.phase === "interrupted" ? "train-interrupted" : "train-paused"}
        >
          <p className="eos-headline text-3xl">
            {snapshot.phase === "interrupted" ? "Hold. The session is still here." : "Hold."}
          </p>
          <p className="mt-2 text-sm text-eos-on-surface-muted">
            Timers are frozen. Completed sets stay on this device. Nothing was uploaded.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <PrimaryButton onClick={() => dispatch({ type: "resume" })}>Resume</PrimaryButton>
            <GhostButton onClick={finishNow}>Finish workout</GhostButton>
          </div>
        </BentoCard>
      ) : null}

      {snapshot.phase === "substituting" && plan && slot ? (
        <BentoCard label="SUBSTITUTION" elevation="glass" data-testid="train-substitution">
          <p className="eos-headline text-3xl">{slot.name}</p>
          <p className="mt-2 text-sm text-eos-on-surface-muted">
            Swap for equipment, difficulty, or an injury-safer pattern. This is not medical advice.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {slot.substitutions.length === 0 ? (
              <p className="text-sm">No catalog substitute is listed for this movement.</p>
            ) : (
              slot.substitutions.map((id) => {
                const sub = findAnyExercise(id);
                if (!sub) return null;
                return (
                  <GhostButton
                    key={id}
                    onClick={() => dispatch({ type: "substitute", replacementExerciseId: id })}
                  >
                    {sub.name}
                  </GhostButton>
                );
              })
            )}
          </div>
          <GhostButton className="mt-6" onClick={() => dispatch({ type: "cancel_substitution" })}>
            Keep original
          </GhostButton>
        </BentoCard>
      ) : null}

      {done && plan ? (
        <CompleteBlock
          plan={plan}
          snapshot={snapshot}
          elapsed={elapsed}
          ascendNote={ascendNote}
          prs={devicePrs(snapshot.sets, listLocalHistory(), snapshot.sessionId)}
          onRetry={() => void saveCompletion(snapshot)}
          onNew={() => {
            saveStartedFor.current = null;
            clearTrainSnapshot();
            setAscendNote(null);
            dispatch({ type: "reset" });
          }}
        />
      ) : null}

      {snapshot.lastError ? (
        <p role="alert" className="text-sm text-eos-alert">
          {snapshot.lastError}
        </p>
      ) : null}

      {!live && !done ? (
        <footer className="flex flex-wrap gap-3 text-sm">
          <Link className="text-eos-telemetry underline-offset-4 hover:underline" href="/coaches">
            Find a coach
          </Link>
          <Link className="text-eos-telemetry underline-offset-4 hover:underline" href="/sessions">
            Coach bookings
          </Link>
          <Link className="text-eos-telemetry underline-offset-4 hover:underline" href="/settings/wearables">
            Device connections
          </Link>
          <Link className="text-eos-telemetry underline-offset-4 hover:underline" href="/dashboard">
            Dashboard
          </Link>
        </footer>
      ) : null}

      {snapshot.phase === "idle" ? <LocalHistory /> : null}
    </div>
  );
}

function ReadinessCard({
  readiness,
  recommendation,
  onOpen
}: {
  readiness: ReadinessView;
  recommendation: ReturnType<typeof recommendPlan>;
  onOpen: () => void;
}) {
  return (
    <BentoCard label="NOW" elevation="2" className="overflow-hidden">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="eos-headline text-4xl text-eos-voltline">
            {readiness.band ?? "STANDBY"}
          </p>
          <p className="mt-2 text-sm text-eos-on-surface-muted">{readiness.detail}</p>
          <p className="mt-4 text-sm">{recommendation.reason}</p>
        </div>
        <div className="rounded-2xl border border-eos-outline bg-eos-floor/60 p-4">
          <p className="eos-label-caps text-eos-connect">Recommended</p>
          <p className="mt-2 font-display text-xl">{recommendation.plan.title}</p>
          <p className="text-sm text-eos-on-surface-muted">
            {recommendation.plan.durationMin} min · {recommendation.plan.difficulty} ·{" "}
            {recommendation.adapted ? "adapted" : "catalog default"}
          </p>
          <PrimaryButton className="mt-4" onClick={onOpen}>
            Open prep
          </PrimaryButton>
        </div>
      </div>
    </BentoCard>
  );
}

function FilterBar(props: {
  sport: string;
  difficulty: string;
  location: string;
  equipment: string;
  trainingType: string;
  maxDuration?: number;
  onSport: (value: string) => void;
  onDifficulty: (value: string) => void;
  onLocation: (value: string) => void;
  onEquipment: (value: string) => void;
  onTrainingType: (value: string) => void;
  onDuration: (value: number | undefined) => void;
}) {
  return (
    <div className="space-y-3" role="search" aria-label="Filter workouts">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTER_CHIPS.map((chip) => (
          <FilterChip
            key={chip.id}
            active={props.sport === chip.id}
            onClick={() => props.onSport(chip.id)}
          >
            {chip.label}
          </FilterChip>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {["all", ...TRAIN_FILTERS.difficulties].map((item) => (
          <FilterChip
            key={item}
            active={props.difficulty === item}
            onClick={() => props.onDifficulty(item)}
          >
            {item}
          </FilterChip>
        ))}
        {["all", ...TRAIN_FILTERS.locations].map((item) => (
          <FilterChip
            key={`loc-${item}`}
            active={props.location === item}
            onClick={() => props.onLocation(item)}
          >
            {item}
          </FilterChip>
        ))}
        {["all", ...TRAIN_FILTERS.equipment].map((item) => (
          <FilterChip
            key={`eq-${item}`}
            active={props.equipment === item}
            onClick={() => props.onEquipment(item)}
          >
            {item === "all" ? "Any kit" : item}
          </FilterChip>
        ))}
        {["all", "warm-up", "cool-down"].map((item) => (
          <FilterChip
            key={`type-${item}`}
            active={props.trainingType === item}
            onClick={() => props.onTrainingType(item)}
          >
            {item}
          </FilterChip>
        ))}
        {[undefined, 15, 25, 35, 45].map((mins) => (
          <FilterChip
            key={String(mins)}
            active={props.maxDuration === mins}
            onClick={() => props.onDuration(mins)}
          >
            {mins ? `≤${mins}m` : "Any duration"}
          </FilterChip>
        ))}
      </div>
    </div>
  );
}

function WorkoutCard({
  plan,
  recommended,
  selected,
  onSelect
}: {
  plan: TrainPlan;
  recommended: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "rounded-glass border p-5 text-left transition duration-200 ease-out",
        "min-h-11 border-eos-outline bg-white/[0.04] hover:border-eos-voltline/50",
        selected && "border-eos-voltline ring-1 ring-eos-voltline/40"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="eos-label-caps text-eos-telemetry">{plan.sport}</p>
        {recommended ? <span className="eos-label-caps text-eos-voltline">REC</span> : null}
      </div>
      <h2 className="mt-2 font-display text-2xl">{plan.title}</h2>
      <p className="mt-2 text-sm text-eos-on-surface-muted">{plan.purpose}</p>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-xs uppercase tracking-wider text-eos-on-surface-muted">
        <div>
          <dt>Duration</dt>
          <dd className="font-mono text-eos-on-surface">{plan.durationMin} min</dd>
        </div>
        <div>
          <dt>Difficulty</dt>
          <dd className="font-mono text-eos-on-surface">{plan.difficulty}</dd>
        </div>
        <div>
          <dt>Equipment</dt>
          <dd className="font-mono text-eos-on-surface">{plan.equipment.join(", ")}</dd>
        </div>
        <div>
          <dt>Focus</dt>
          <dd className="font-mono text-eos-on-surface">{plan.muscleGroups.join(", ")}</dd>
        </div>
      </dl>
      <p className="mt-3 text-sm">{plan.outcome}</p>
    </button>
  );
}

function Briefing({
  plan,
  readiness,
  cues,
  onStart,
  onBack
}: {
  plan: TrainPlan;
  readiness: ReadinessView;
  cues: string[];
  onStart: () => void;
  onBack: () => void;
}) {
  const slots = buildSlots(plan);
  return (
    <BentoCard label="PREP" elevation="glass" data-testid="train-prep">
      <p className="eos-headline text-4xl sm:text-5xl">{plan.title}</p>
      <p className="mt-2 text-eos-on-surface-muted">{plan.purpose}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Metric label="Duration" value={`${plan.durationMin} min`} />
        <Metric label="Intensity" value={plan.plannedIntensity} hint="Planned, not measured" />
        <Metric
          label="Body"
          value={readiness.band ?? "—"}
          hint={readiness.available ? readiness.source : "No biometric source"}
        />
      </div>
      <ol className="mt-6 space-y-2">
        {plan.structure.map((step) => (
          <li key={step} className="text-sm">
            {step}
          </li>
        ))}
      </ol>
      <ul className="mt-4 space-y-2 text-sm text-eos-on-surface-muted">
        {slots.map((item) => (
          <li key={`${item.exerciseId}-${item.setNumber}`}>
            {item.name} · set {item.setNumber}/{item.targetSets}
            {item.weighted && item.targetLoadKg != null ? ` · ${item.targetLoadKg} kg` : ""}
            {item.targetTimeSec ? ` · ${item.targetTimeSec}s` : ""}
          </li>
        ))}
      </ul>
      <blockquote className="mt-6 border-l-2 border-eos-iris pl-4 text-sm">{cues[0]}</blockquote>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <PrimaryButton onClick={onStart} data-testid="train-start">
          Start session
        </PrimaryButton>
        <GhostButton onClick={onBack}>Back to catalog</GhostButton>
      </div>
    </BentoCard>
  );
}

function LiveBlock(props: {
  plan: TrainPlan;
  snapshot: TrainSnapshot;
  slot: NonNullable<ReturnType<typeof currentSlot>>;
  upcoming: ReturnType<typeof nextSlot>;
  previous: ReturnType<typeof previousSetForCurrent>;
  historyBest: ReturnType<typeof bestSetFromHistory>;
  progress: { done: number; total: number };
  elapsed: string;
  cues: string[];
  reps: string;
  load: string;
  rpe: number | null;
  onReps: (value: string) => void;
  onLoad: (value: string) => void;
  onRpe: (value: number) => void;
  onLog: () => void;
  onSkip: () => void;
  onPause: () => void;
  onFinish: () => void;
  onOpenSubstitution: () => void;
}) {
  const pct = props.progress.total
    ? Math.round((props.progress.done / props.progress.total) * 100)
    : 0;
  const liveLabel = props.snapshot.phase === "warmup" ? "WARM-UP" : "ACTIVE";
  return (
    <div className="space-y-4" data-testid="train-live">
      <ProgressRing percent={pct} label={`${props.progress.done}/${props.progress.total}`} elapsed={props.elapsed} />
      <SessionTimeline snapshot={props.snapshot} />
      <BentoCard label={`${liveLabel} · SET ${props.slot.setNumber}/${props.slot.targetSets}`} elevation="2">
        <p className="eos-headline text-4xl leading-none sm:text-6xl">{props.slot.name}</p>
        <p className="mt-3 text-sm text-eos-on-surface-muted">{props.slot.instructions}</p>
        <p className="mt-1 text-xs uppercase tracking-wider text-eos-telemetry">
          {props.slot.muscles.join(" · ")}
          {props.slot.tempo ? ` · tempo ${props.slot.tempo}` : ""}
        </p>
        {props.previous && !props.previous.skipped ? (
          <p className="mt-3 text-sm">
            Previous: {props.previous.reps ?? "—"}
            {props.previous.loadKg != null ? ` × ${props.previous.loadKg} kg` : ""}
            {props.previous.rpe != null ? ` · RPE ${props.previous.rpe}` : ""}
          </p>
        ) : props.historyBest ? (
          <p className="mt-3 text-sm">
            Last time on this device: {props.historyBest.reps ?? "—"}
            {props.historyBest.loadKg != null ? ` × ${props.historyBest.loadKg} kg` : ""}
          </p>
        ) : (
          <p className="mt-3 text-sm text-eos-on-surface-muted">No previous logged set for this movement.</p>
        )}
        {props.slot.mode !== "time" ? (
          <label className="mt-6 block text-sm">
            Reps
            <input
              className="mt-1 h-12 w-full rounded-xl border border-eos-outline bg-eos-floor px-3 font-mono text-2xl"
              inputMode="numeric"
              value={props.reps}
              onChange={(e) => props.onReps(e.target.value.replace(/[^\d]/g, ""))}
              aria-label="Reps"
            />
          </label>
        ) : (
          <p
            className="mt-6 font-mono text-5xl text-eos-telemetry motion-safe:transition-transform"
            aria-label="Timed remaining"
            aria-live="polite"
          >
            {formatTimer(props.snapshot.workRemainingSec || props.slot.targetTimeSec || 0)}
          </p>
        )}
        {props.slot.weighted ? (
          <label className="mt-4 block text-sm">
            Load (kg)
            <input
              className="mt-1 h-12 w-full rounded-xl border border-eos-outline bg-eos-floor px-3 font-mono text-2xl"
              inputMode="decimal"
              value={props.load}
              onChange={(e) => props.onLoad(e.target.value.replace(/[^\d.]/g, ""))}
              aria-label="Load in kilograms"
            />
          </label>
        ) : null}
        <p className="mt-4 text-sm">RPE (optional)</p>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => props.onRpe(value)}
              className={cn(
                "h-11 min-w-11 rounded-full border border-eos-outline font-mono",
                props.rpe === value && "border-eos-voltline bg-eos-voltline text-eos-floor"
              )}
              aria-pressed={props.rpe === value}
            >
              {value}
            </button>
          ))}
        </div>
        {props.slot.substitutions.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs uppercase tracking-wider text-eos-on-surface-muted">Cannot perform this?</p>
            <GhostButton className="mt-2" onClick={props.onOpenSubstitution} data-testid="train-open-sub">
              Substitute movement
            </GhostButton>
          </div>
        ) : null}
        <PrimaryButton className="mt-6" onClick={props.onLog} data-testid="train-log-set">
          Log set
        </PrimaryButton>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <GhostButton onClick={props.onPause}>Pause</GhostButton>
          <GhostButton onClick={props.onSkip}>Skip exercise</GhostButton>
        </div>
        <button
          type="button"
          onClick={props.onFinish}
          className="mt-3 min-h-11 w-full text-sm text-eos-alert"
        >
          Finish session
        </button>
        {props.upcoming ? (
          <p className="mt-4 text-sm text-eos-on-surface-muted">Next up: {props.upcoming.name}</p>
        ) : null}
        <p className="mt-4 text-sm text-eos-iris">{props.cues[props.cues.length - 1]}</p>
      </BentoCard>
    </div>
  );
}

function RestBlock(props: {
  snapshot: TrainSnapshot;
  upcoming: ReturnType<typeof currentSlot>;
  progress: { done: number; total: number };
  elapsed: string;
  cues: string[];
  onSkip: () => void;
  onPlus15: () => void;
  onPlus30: () => void;
  onPause: () => void;
}) {
  const pct = props.snapshot.restDurationSec
    ? Math.round(
        ((props.snapshot.restDurationSec - props.snapshot.restRemainingSec) /
          props.snapshot.restDurationSec) *
          100
      )
    : 0;
  return (
    <BentoCard label="REST" elevation="glass" data-testid="train-rest">
      <p
        className="eos-headline text-7xl text-eos-connect sm:text-8xl"
        aria-live="polite"
        aria-label={`Rest remaining ${formatTimer(props.snapshot.restRemainingSec)}`}
      >
        {formatTimer(props.snapshot.restRemainingSec)}
      </p>
      <ProgressRing percent={pct} label="REST" elapsed={props.elapsed} />
      <p className="mt-4 text-xl">
        Next up: {props.upcoming?.name ?? "Session complete"}
        {props.upcoming ? ` · set ${props.upcoming.setNumber}` : ""}
      </p>
      {props.upcoming ? (
        <p className="text-sm text-eos-on-surface-muted">{props.upcoming.instructions}</p>
      ) : null}
      <p className="mt-4 text-sm">
        Optional: inhale 4 · hold 4 · exhale 6. This is coaching copy, not a measured recovery
        signal.
      </p>
      <p className="mt-2 text-sm text-eos-on-surface-muted">
        {props.progress.done} / {props.progress.total} blocks logged
      </p>
      <div className="mt-6 grid grid-cols-2 gap-2">
        <PrimaryButton onClick={props.onSkip} data-testid="train-skip-rest">
          Skip rest
        </PrimaryButton>
        <GhostButton onClick={props.onPlus15}>+15 sec</GhostButton>
        <GhostButton onClick={props.onPlus30}>+30 sec</GhostButton>
        <GhostButton onClick={props.onPause}>Pause</GhostButton>
      </div>
    </BentoCard>
  );
}

function CompleteBlock({
  plan,
  snapshot,
  elapsed,
  ascendNote,
  prs,
  onRetry,
  onNew
}: {
  plan: TrainPlan;
  snapshot: TrainSnapshot;
  elapsed: string;
  ascendNote: string | null;
  prs: string[];
  onRetry: () => void;
  onNew: () => void;
}) {
  const history = listLocalHistory();
  const canRetry = snapshot.saveStatus === "failed" || snapshot.saveStatus === "local_only";
  return (
    <BentoCard label="COMPLETE" elevation="2" data-testid="train-complete">
      <p className="eos-headline text-5xl text-eos-voltline">Session in the book.</p>
      <p className="mt-2 text-eos-on-surface-muted">{plan.title}</p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Duration" value={elapsed} />
        <Metric label="Sets" value={String(snapshot.sets.filter((set) => !set.skipped).length)} />
        <Metric
          label="Volume"
          value={volumeKg(snapshot) > 0 ? `${Math.round(volumeKg(snapshot))} kg` : "—"}
        />
        <Metric
          label="Save"
          value={
            snapshot.saveStatus === "saved"
              ? "Cloud"
              : snapshot.saveStatus === "local_only"
                ? "Device"
                : snapshot.saveStatus === "save_pending"
                  ? "Saving"
                  : snapshot.saveStatus === "failed"
                    ? "Retry"
                    : "Ready"
          }
        />
      </div>
      {prs.length > 0 ? (
        <p className="mt-4 text-sm text-eos-performance">
          Device PRs vs your last logged sets: {prs.join(", ")}. Not a global ranking.
        </p>
      ) : null}
      <p className="mt-4 text-sm text-eos-on-surface-muted">
        Heart-rate zones, calories and cloud PRs stay hidden unless a connected source recorded them.
      </p>
      {ascendNote ? <p className="mt-2 text-sm">{ascendNote}</p> : null}
      {history[0] ? (
        <p className="mt-2 text-sm">Last saved locally: {plan.title} · {elapsed}</p>
      ) : null}
      {canRetry ? (
        <GhostButton className="mt-4 w-full" onClick={onRetry} data-testid="train-retry-save">
          Retry cloud save
        </GhostButton>
      ) : null}
      <PrimaryButton className="mt-6" onClick={onNew} data-testid="train-new">
        Back to TRAIN
      </PrimaryButton>
      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        <Link className="text-eos-telemetry underline-offset-4 hover:underline" href="/achievements">
          Open Ascend
        </Link>
        <Link className="text-eos-telemetry underline-offset-4 hover:underline" href="/recovery">
          Recovery context
        </Link>
      </div>
    </BentoCard>
  );
}

function SessionTimeline({ snapshot }: { snapshot: TrainSnapshot }) {
  if (!snapshot.planId) return null;
  const plan = getTrainPlan(snapshot.planId);
  if (!plan) return null;
  const slots = buildSlots(plan);
  return (
    <ol className="flex flex-wrap gap-1" aria-label="Session timeline">
      {slots.map((item, index) => {
        const done = index < snapshot.sets.length;
        const current =
          index === snapshot.slotIndex &&
          (snapshot.phase === "active" || snapshot.phase === "warmup");
        return (
          <li
            key={`${item.exerciseId}-${item.setNumber}-${index}`}
            className={
              done
                ? "h-2 w-6 rounded-full bg-eos-voltline"
                : current
                  ? "h-2 w-6 rounded-full bg-eos-telemetry"
                  : "h-2 w-6 rounded-full bg-white/10"
            }
            title={`${item.name} set ${item.setNumber}`}
          />
        );
      })}
    </ol>
  );
}

function LocalHistory() {
  const items = listLocalHistory();
  if (items.length === 0) return null;
  return (
    <BentoCard label="THIS DEVICE">
      <ul className="space-y-2 text-sm">
        {items.slice(0, 5).map((item) => (
          <li key={item.sessionId}>
            {getTrainPlan(item.planId)?.title ?? item.planId} · {formatTimer(Math.floor(item.durationMs / 1000))} ·{" "}
            {item.saveStatus}
          </li>
        ))}
      </ul>
    </BentoCard>
  );
}

function ProgressRing({
  percent,
  label,
  elapsed
}: {
  percent: number;
  label: string;
  elapsed: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="flex items-center gap-4">
      <div
        className="grid h-20 w-20 place-items-center rounded-full motion-reduce:[transition:none]"
        style={{
          background: `conic-gradient(var(--eos-voltline) ${clamped * 3.6}deg, rgba(255,255,255,0.08) 0deg)`
        }}
        aria-hidden
      >
        <span className="grid h-14 w-14 place-items-center rounded-full bg-eos-floor font-mono text-xs">
          {clamped}%
        </span>
      </div>
      <div>
        <p className="eos-label-caps">{label}</p>
        <p className="font-mono text-lg">{elapsed}</p>
      </div>
    </div>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <p className="eos-label-caps text-eos-on-surface-muted">{label}</p>
      <p className="font-mono text-xl">{value}</p>
      {hint ? <p className="text-xs text-eos-on-surface-muted">{hint}</p> : null}
    </div>
  );
}

function StatusChip({
  label,
  tone
}: {
  label: string;
  tone: "live" | "muted" | "warn";
}) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
        tone === "live" && "bg-eos-voltline/15 text-eos-voltline",
        tone === "muted" && "bg-white/5 text-eos-on-surface-muted",
        tone === "warn" && "bg-eos-recovery/15 text-eos-recovery"
      )}
    >
      {label}
    </span>
  );
}

function FilterChip({
  active,
  children,
  onClick
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-11 shrink-0 rounded-full border px-4 text-sm capitalize",
        active
          ? "border-eos-voltline bg-eos-voltline text-eos-floor"
          : "border-eos-outline text-eos-on-surface"
      )}
    >
      {children}
    </button>
  );
}

function PrimaryButton({
  children,
  onClick,
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-eos-voltline px-5 text-sm font-semibold text-eos-floor",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

function GhostButton({
  children,
  onClick,
  className
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-12 items-center justify-center rounded-2xl border border-eos-outline px-4 text-sm",
        className
      )}
    >
      {children}
    </button>
  );
}
