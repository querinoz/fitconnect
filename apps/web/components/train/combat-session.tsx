"use client";

import { useEffect, useRef } from "react";
import { BentoCard } from "@/components/elite-os/bento-card";
import { formatClock } from "@/lib/combat/round-engine";
import type { CombatPlanMeta, TrainSnapshot } from "@/lib/train/types";
import { currentSlot, nextSlot } from "@/lib/train/machine";
import { cn } from "@/lib/utils";

function beep(muted: boolean, freq: number, ms = 120) {
  if (muted || typeof window === "undefined") return;
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    gain.gain.value = 0.05;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    window.setTimeout(() => {
      osc.stop();
      void ctx.close();
    }, ms);
  } catch {
    // Audio is optional.
  }
}

export function CombatLiveBlock(props: {
  combat: CombatPlanMeta;
  snapshot: TrainSnapshot;
  elapsed: string;
  cues: string[];
  muted: boolean;
  onMute: (muted: boolean) => void;
  onPause: () => void;
  onSkipRest: () => void;
  onFinish: () => void;
  rpe: number | null;
  onRpe: (value: number) => void;
}) {
  const slot = currentSlot(props.snapshot);
  const upcoming = nextSlot(props.snapshot);
  const work = props.snapshot.phase === "active" || props.snapshot.phase === "warmup";
  const rest = props.snapshot.phase === "rest";
  const remaining = work ? props.snapshot.workRemainingSec : rest ? props.snapshot.restRemainingSec : 0;
  const warning = work && remaining > 0 && remaining <= props.combat.warningSec;
  const roundNumber = slot?.setNumber ?? props.snapshot.sets.length + 1;
  const prevRemaining = useRef<number | null>(null);

  useEffect(() => {
    if (props.muted) return;
    if (work && remaining === props.combat.roundDurationSec) beep(false, 880, 160);
    if (warning && remaining === props.combat.warningSec) beep(false, 520, 180);
    if (rest && remaining === props.combat.restDurationSec) beep(false, 240, 200);
    if (prevRemaining.current !== 0 && remaining === 0) beep(false, 180, 280);
    prevRemaining.current = remaining;
  }, [remaining, work, rest, warning, props.muted, props.combat]);

  return (
    <div className="space-y-4" data-testid="combat-live">
      <BentoCard
        label={rest ? "REST" : warning ? "WARNING" : `ROUND ${roundNumber}`}
        elevation="glass"
        className={cn(warning && "ring-1 ring-eos-voltline/60")}
      >
        <p className="eos-label-caps text-eos-voltline">FIGHT MODE</p>
        <p className="mt-2 text-sm uppercase tracking-wider text-eos-telemetry">
          {props.combat.disciplineId.replace(/_/g, " ")} · {props.combat.sessionMode.replace(/_/g, " ")}
        </p>
        <p
          className={cn(
            "mt-4 font-mono text-7xl leading-none sm:text-8xl",
            rest ? "text-eos-connect" : warning ? "text-eos-voltline" : "text-eos-on-surface"
          )}
          aria-live="polite"
          aria-label={`${rest ? "Rest" : "Round"} remaining ${formatClock(remaining)}`}
        >
          {formatClock(remaining)}
        </p>
        <p className="mt-4 text-sm text-eos-on-surface-muted">
          {work
            ? props.combat.focus
            : upcoming
              ? `NEXT: ${upcoming.name}`
              : "Last rest — session will close."}
        </p>
        <p className="mt-2 font-mono text-xs uppercase tracking-wider text-eos-on-surface-muted">
          {roundNumber}/{props.combat.roundCount} · elapsed {props.elapsed} · no invented force
        </p>
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
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="min-h-11 rounded-full bg-eos-voltline px-5 font-display text-eos-floor"
            onClick={props.onPause}
          >
            Pause
          </button>
          {rest ? (
            <button
              type="button"
              className="min-h-11 rounded-full border border-eos-outline px-5"
              onClick={props.onSkipRest}
            >
              Skip rest
            </button>
          ) : null}
          <button
            type="button"
            className="min-h-11 rounded-full border border-eos-outline px-5"
            onClick={() => props.onMute(!props.muted)}
          >
            {props.muted ? "Unmute cues" : "Mute cues"}
          </button>
        </div>
        <button type="button" onClick={props.onFinish} className="mt-3 min-h-11 w-full text-sm text-eos-alert">
          Finish session
        </button>
        <p className="mt-4 text-sm text-eos-iris">{props.cues[props.cues.length - 1]}</p>
      </BentoCard>
    </div>
  );
}

export function CombatBriefing(props: {
  combat: CombatPlanMeta;
  title: string;
  purpose: string;
  equipment: string[];
  cues: string[];
  onStart: () => void;
  onBack: () => void;
}) {
  return (
    <BentoCard label="FIGHT MODE" elevation="glass" data-testid="combat-prep">
      <p className="eos-headline text-4xl sm:text-5xl">{props.title}</p>
      <p className="mt-2 text-eos-on-surface-muted">{props.purpose}</p>
      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="eos-label-caps text-eos-telemetry">Sport</dt>
          <dd className="font-display text-2xl capitalize">{props.combat.disciplineId.replace(/_/g, " ")}</dd>
        </div>
        <div>
          <dt className="eos-label-caps text-eos-telemetry">Session</dt>
          <dd className="font-display text-2xl">
            {props.combat.roundCount} × {Math.round(props.combat.roundDurationSec / 60)} min
          </dd>
        </div>
        <div>
          <dt className="eos-label-caps text-eos-telemetry">Focus</dt>
          <dd className="text-sm">{props.combat.focus}</dd>
        </div>
        <div>
          <dt className="eos-label-caps text-eos-telemetry">Equipment</dt>
          <dd className="text-sm">{props.equipment.join(" · ") || "none required"}</dd>
        </div>
      </dl>
      <p className="mt-4 text-sm text-eos-on-surface-muted">
        Intensity is an RPE target you choose. Force, HR and accuracy stay blank without a real sensor.
      </p>
      <blockquote className="mt-4 border-l-2 border-eos-iris pl-4 text-sm">{props.cues[0]}</blockquote>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          data-testid="train-start"
          onClick={props.onStart}
          className="min-h-11 rounded-full bg-eos-voltline px-6 font-display text-eos-floor"
        >
          Start session
        </button>
        <button type="button" onClick={props.onBack} className="min-h-11 rounded-full border border-eos-outline px-6">
          Back to catalog
        </button>
      </div>
    </BentoCard>
  );
}
