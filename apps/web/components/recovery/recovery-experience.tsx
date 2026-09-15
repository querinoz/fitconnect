"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BentoCard } from "@/components/elite-os/bento-card";
import { recoveryFromReadinessPayload, type RecoveryView } from "@/lib/recovery/from-readiness";
import type { FitnessObservation } from "@/lib/health/observation";

async function loadRecovery(): Promise<RecoveryView> {
  try {
    const res = await fetch("/api/v1/readiness", { credentials: "include" });
    if (!res.ok) {
      return recoveryFromReadinessPayload({ score: null, source: res.status === 401 ? "unauthorized" : "unavailable" });
    }
    return recoveryFromReadinessPayload(await res.json());
  } catch {
    return recoveryFromReadinessPayload({ score: null, source: "offline" });
  }
}

export function RecoveryExperience() {
  const [view, setView] = useState<RecoveryView>(() =>
    recoveryFromReadinessPayload({ score: null, source: "pending" })
  );

  useEffect(() => {
    void loadRecovery().then(setView);
  }, []);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 pb-28" data-testid="recovery-experience">
      <header className="space-y-3">
        <p className="eos-label-caps text-eos-connect">RECOVERY</p>
        <h1 className="eos-headline text-4xl italic tracking-tight sm:text-6xl">What the body did.</h1>
        <p className="max-w-2xl text-sm text-eos-on-surface-muted">
          Sleep, HRV and resting heart rate appear only when a connected source measured them.
          Missing stays missing.
        </p>
      </header>

      <BentoCard label="WHAT HAPPENED" elevation="2">
        <p className="font-display text-2xl">{view.whatHappened}</p>
        <p className="mt-3 text-sm text-eos-on-surface-muted">{view.whatItMeans}</p>
        <p className="mt-4 text-sm">{view.whatToDo}</p>
      </BentoCard>

      <div className="grid gap-3 sm:grid-cols-2">
        <ObservationCard title="Readiness" observation={view.observations.readinessScore} />
        <ObservationCard title="HRV" observation={view.observations.hrvMs} />
        <ObservationCard title="Sleep" observation={view.observations.sleepHours} />
        <ObservationCard title="Resting HR" observation={view.observations.restingHrBpm} />
      </div>

      <footer className="flex flex-wrap gap-3 text-sm">
        <Link className="text-eos-telemetry underline-offset-4 hover:underline" href="/train">
          Open TRAIN
        </Link>
        <Link className="text-eos-telemetry underline-offset-4 hover:underline" href="/martial-arts">
          Martial Arts OS
        </Link>
        <Link className="text-eos-telemetry underline-offset-4 hover:underline" href="/settings/wearables">
          Device connections
        </Link>
        <Link className="text-eos-telemetry underline-offset-4 hover:underline" href="/dashboard">
          Dashboard
        </Link>
      </footer>
    </div>
  );
}

function ObservationCard({
  title,
  observation
}: {
  title: string;
  observation: FitnessObservation;
}) {
  const display =
    observation.value == null
      ? "—"
      : observation.unit
        ? `${observation.value} ${observation.unit}`
        : String(observation.value);
  return (
    <BentoCard label={title}>
      <p className="font-mono text-3xl">{display}</p>
      <p className="mt-2 text-xs uppercase tracking-wider text-eos-on-surface-muted">
        {observation.confidence} · {observation.provider}
      </p>
      <p className="mt-1 text-xs text-eos-on-surface-muted">
        Source {observation.source}
        {observation.measuredAt ? ` · ${observation.measuredAt}` : " · no timestamp"}
      </p>
    </BentoCard>
  );
}
