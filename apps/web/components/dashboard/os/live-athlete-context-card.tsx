"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BentoCard } from "@/components/elite-os/bento-card";
import { EliteButton } from "@/components/elite-os/elite-button";

type ContextPayload = {
  context?: {
    training: { phase: string; trainingLoadLabel: string | null; activeSessionId: string | null };
    recovery: { readinessScore: number | null; readinessState: string };
    device: { status: string; providers: string[] };
    metrics: {
      heartRate: { value: number | null; freshness: string; provenance: string } | null;
      hrv: { value: number | null; freshness: string; provenance: string } | null;
    };
    confidence: string;
    safety: { flags: string[]; note: string | null };
    lastUpdated: string;
  };
  trainingLoad?: {
    acwr: number | null;
    label: string;
    provenance: string;
    confidence: string;
  };
  adaptationSuggestion?: {
    action: string;
    what: string;
    why: string;
    data: string[];
    confidence: string;
    requiresConfirm: boolean;
  };
};

/** Live athlete context — never shows fabricated HR/HRV as LIVE. */
export function LiveAthleteContextCard() {
  const [data, setData] = useState<ContextPayload | null>(null);
  const [state, setState] = useState<"LOADING" | "AVAILABLE" | "UNAVAILABLE" | "ERROR">("LOADING");

  const load = useCallback(async () => {
    setState("LOADING");
    try {
      const res = await fetch("/api/v1/context", { credentials: "include" });
      if (!res.ok) {
        setData(null);
        setState(res.status === 401 || res.status === 403 ? "UNAVAILABLE" : "ERROR");
        return;
      }
      const body = (await res.json()) as ContextPayload;
      setData(body);
      setState("AVAILABLE");
    } catch {
      setData(null);
      setState("ERROR");
    }
  }, []);

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 15_000);
    return () => clearInterval(t);
  }, [load]);

  const ctx = data?.context;
  const hr = ctx?.metrics.heartRate;
  const showHr =
    hr && hr.value != null && hr.freshness !== "STALE" && hr.provenance === "REAL"
      ? hr
      : null;

  return (
    <BentoCard label="LIVE CONTEXT · V10" className="space-y-3" data-testid="live-athlete-context">
      {state === "LOADING" && <p className="text-sm text-eos-on-surface-muted">LOADING…</p>}
      {state === "UNAVAILABLE" && (
        <p className="text-sm text-eos-on-surface-muted">UNAVAILABLE — sign in required.</p>
      )}
      {state === "ERROR" && <p className="text-sm text-eos-alert">ERROR loading context.</p>}
      {state === "AVAILABLE" && ctx && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Meta label="TRAIN PHASE" value={ctx.training.phase} />
            <Meta
              label="READINESS"
              value={
                ctx.recovery.readinessScore != null
                  ? String(ctx.recovery.readinessScore)
                  : ctx.recovery.readinessState
              }
            />
            <Meta label="DEVICES" value={ctx.device.status} />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Meta
              label="HEART RATE"
              value={
                showHr
                  ? `${showHr.value} bpm · ${showHr.freshness}`
                  : hr?.value != null
                    ? `${hr.freshness}/${hr.provenance} — not LIVE`
                    : "MISSING"
              }
            />
            <Meta
              label="TRAINING LOAD (AUX)"
              value={
                data?.trainingLoad
                  ? `${data.trainingLoad.label}${data.trainingLoad.acwr != null ? ` · ACWR-lite ${data.trainingLoad.acwr}` : ""} · ${data.trainingLoad.provenance}`
                  : "MISSING"
              }
            />
            <Meta label="CONTEXT CONFIDENCE" value={ctx.confidence} />
          </div>
          <p className="text-[10px] uppercase tracking-wide text-eos-on-surface-subtle">
            ACWR-lite is an auxiliary training-load signal — not medical diagnosis or injury prediction.
          </p>
          {data?.adaptationSuggestion && data.adaptationSuggestion.action !== "NONE" ? (
            <div className="rounded-xl border border-eos-outline px-3 py-3 text-sm">
              <p className="font-semibold text-eos-voltline">{data.adaptationSuggestion.what}</p>
              <p className="mt-1 text-eos-on-surface-muted">WHY: {data.adaptationSuggestion.why}</p>
              <p className="mt-1 font-mono text-[10px] uppercase text-eos-on-surface-subtle">
                DATA: {data.adaptationSuggestion.data.join(" · ")} · confidence{" "}
                {data.adaptationSuggestion.confidence} · requires confirm
              </p>
            </div>
          ) : null}
          {ctx.safety.flags.length > 0 ? (
            <p className="text-xs text-eos-recovery">
              Safety: {ctx.safety.flags.join(", ")}
              {ctx.safety.note ? ` — ${ctx.safety.note}` : ""}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <EliteButton asChild size="sm">
              <Link href="/train">Open TRAIN</Link>
            </EliteButton>
            <EliteButton asChild size="sm" variant="ghost">
              <Link href="/profile">Devices</Link>
            </EliteButton>
            <EliteButton type="button" size="sm" variant="ghost" onClick={() => void load()}>
              Refresh
            </EliteButton>
          </div>
          <p className="font-mono text-[10px] uppercase text-eos-on-surface-subtle">
            Updated {ctx.lastUpdated}
          </p>
        </>
      )}
    </BentoCard>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-eos-outline-variant/30 px-3 py-2">
      <p className="text-[10px] uppercase tracking-widest text-eos-on-surface-subtle">{label}</p>
      <p className="mt-1 text-sm font-semibold text-eos-on-surface">{value}</p>
    </div>
  );
}
