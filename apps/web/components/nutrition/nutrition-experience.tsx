"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BentoCard } from "@/components/elite-os/bento-card";
import { EliteButton } from "@/components/elite-os/elite-button";
import { EliteInput } from "@/components/elite-os/elite-input";
import type { FoodRecord } from "@/lib/nutrition/types";

type TargetsView = {
  kcal: number | null;
  proteinG: number | null;
  carbohydrateG: number | null;
  fatG: number | null;
  confidence: string;
  estimateKind: string;
  safetyFlags?: string[];
} | null;

type LogEntry = {
  id: string;
  foodId: string;
  grams: number;
  dateISO: string;
};

/**
 * Nutrition command surface — ESTIMATE targets, food search, confirm-gated log.
 * No silent writes. No fabricated macros.
 */
export function NutritionExperience() {
  const [targets, setTargets] = useState<TargetsView>(null);
  const [targetsState, setTargetsState] = useState<"LOADING" | "AVAILABLE" | "UNAVAILABLE" | "ERROR">(
    "LOADING"
  );
  const [query, setQuery] = useState("");
  const [foods, setFoods] = useState<FoodRecord[]>([]);
  const [lookupNote, setLookupNote] = useState("");
  const [lookupState, setLookupState] = useState<string>("");
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<FoodRecord | null>(null);
  const [grams, setGrams] = useState(100);
  const [confirming, setConfirming] = useState(false);
  const [logMessage, setLogMessage] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logsState, setLogsState] = useState<"LOADING" | "AVAILABLE" | "EMPTY" | "UNAVAILABLE">(
    "LOADING"
  );

  const loadTargets = useCallback(async () => {
    setTargetsState("LOADING");
    try {
      const res = await fetch(
        "/api/v1/nutrition/targets?sport=RUNNING&day=moderate&durationMin=45&goal=PERFORMANCE",
        { credentials: "include" }
      );
      if (!res.ok) {
        setTargets(null);
        setTargetsState(res.status === 401 || res.status === 403 ? "UNAVAILABLE" : "ERROR");
        return;
      }
      const body = (await res.json()) as { targets?: TargetsView };
      setTargets(body.targets ?? null);
      setTargetsState(body.targets ? "AVAILABLE" : "UNAVAILABLE");
    } catch {
      setTargets(null);
      setTargetsState("ERROR");
    }
  }, []);

  const loadLogs = useCallback(async () => {
    setLogsState("LOADING");
    try {
      const res = await fetch("/api/v1/nutrition/log", { credentials: "include" });
      if (!res.ok) {
        setLogs([]);
        setLogsState("UNAVAILABLE");
        return;
      }
      const body = (await res.json()) as { logs?: LogEntry[] };
      const list = body.logs ?? [];
      setLogs(list);
      setLogsState(list.length ? "AVAILABLE" : "EMPTY");
    } catch {
      setLogs([]);
      setLogsState("UNAVAILABLE");
    }
  }, []);

  useEffect(() => {
    void loadTargets();
    void loadLogs();
  }, [loadTargets, loadLogs]);

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setLogMessage(null);
    try {
      const res = await fetch(`/api/v1/nutrition/foods?q=${encodeURIComponent(q)}&locale=pt-PT`, {
        credentials: "include"
      });
      if (!res.ok) {
        setFoods([]);
        setLookupState("ERROR");
        setLookupNote(res.status === 401 ? "Sign in required." : "Lookup failed.");
        return;
      }
      const body = (await res.json()) as {
        foods?: FoodRecord[];
        state?: string;
        note?: string;
      };
      setFoods(body.foods ?? []);
      setLookupState(body.state ?? "AVAILABLE");
      setLookupNote(body.note ?? "");
    } catch {
      setFoods([]);
      setLookupState("ERROR");
      setLookupNote("Network error.");
    } finally {
      setSearching(false);
    }
  }

  async function onConfirmLog() {
    if (!selected) return;
    setConfirming(true);
    setLogMessage(null);
    try {
      const res = await fetch("/api/v1/nutrition/log", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodId: selected.foodId,
          grams,
          confirm: true,
          slot: "snack"
        })
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string; ok?: boolean };
      if (!res.ok) {
        setLogMessage(body.error ?? `Log failed (${res.status})`);
        return;
      }
      setLogMessage(`Logged ${selected.name} · ${grams}g`);
      setSelected(null);
      await loadLogs();
    } catch {
      setLogMessage("Network error while logging.");
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6" data-testid="nutrition-experience">
      <header className="space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-eos-telemetry">
          NUTRITION · PERFORMANCE
        </p>
        <h1 className="font-display text-3xl text-eos-on-surface">Fuel the session</h1>
        <p className="text-sm text-eos-on-surface-muted">
          Targets are ESTIMATE until body metrics + confirmed logs exist. Food writes require explicit
          confirm.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <EliteButton asChild size="sm" variant="ghost">
            <Link href="/dashboard">Dashboard</Link>
          </EliteButton>
          <EliteButton asChild size="sm" variant="ghost">
            <Link href="/train">TRAIN</Link>
          </EliteButton>
          <EliteButton asChild size="sm" variant="ghost">
            <Link href="/nutrition/meals">Meals</Link>
          </EliteButton>
          <EliteButton asChild size="sm" variant="ghost">
            <Link href="/nutrition/grocery">Grocery</Link>
          </EliteButton>
          <EliteButton asChild size="sm" variant="ghost">
            <Link href="/nutrition/recipes">Recipes</Link>
          </EliteButton>
          <EliteButton asChild size="sm" variant="ghost">
            <Link href="/profile">Sport identity</Link>
          </EliteButton>
        </div>
      </header>

      <BentoCard label="TARGETS · ESTIMATE" data-testid="nutrition-targets">
        {targetsState === "LOADING" && (
          <p className="text-sm text-eos-on-surface-muted">LOADING…</p>
        )}
        {targetsState === "UNAVAILABLE" && (
          <p className="text-sm text-eos-on-surface-muted">UNAVAILABLE — sign in or set profile.</p>
        )}
        {targetsState === "ERROR" && (
          <p className="text-sm text-eos-alert">ERROR loading targets.</p>
        )}
        {targetsState === "AVAILABLE" && targets && (
          <div className="space-y-2">
            <p className="font-mono text-2xl text-eos-voltline">
              ~{targets.kcal ?? "—"} kcal
            </p>
            <p className="text-sm text-eos-on-surface">
              P {targets.proteinG ?? "—"}g · C {targets.carbohydrateG ?? "—"}g · F {targets.fatG ?? "—"}g
            </p>
            <p className="text-[10px] uppercase tracking-widest text-eos-on-surface-subtle">
              {targets.estimateKind} · {targets.confidence}
            </p>
            {targets.safetyFlags && targets.safetyFlags.length > 0 && (
              <p className="text-xs text-eos-recovery">Safety: {targets.safetyFlags.join(", ")}</p>
            )}
          </div>
        )}
      </BentoCard>

      <BentoCard label="FOOD SEARCH · PORTFIR / USDA / OFF" data-testid="nutrition-food-search">
        <form onSubmit={onSearch} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="nutrition-q" className="mb-1 block text-[10px] uppercase tracking-widest text-eos-on-surface-subtle">
              Query
            </label>
            <EliteInput
              id="nutrition-q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="banana, arroz, whey…"
              autoComplete="off"
            />
          </div>
          <EliteButton type="submit" size="sm" loading={searching} disabled={!query.trim()}>
            Search
          </EliteButton>
        </form>
        {lookupNote && (
          <p className="mt-2 text-xs text-eos-on-surface-muted">
            {lookupState}: {lookupNote}
          </p>
        )}
        {foods.length === 0 && lookupState && lookupState !== "ERROR" && !searching && (
          <p className="mt-3 text-sm text-eos-on-surface-muted">No foods for this query.</p>
        )}
        <ul className="mt-3 space-y-2" role="list">
          {foods.map((f) => (
            <li key={f.foodId}>
              <button
                type="button"
                onClick={() => {
                  setSelected(f);
                  setGrams(Math.round(f.grams) || 100);
                  setLogMessage(null);
                }}
                className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                  selected?.foodId === f.foodId
                    ? "border-eos-voltline bg-eos-voltline/10"
                    : "border-eos-outline hover:border-eos-telemetry/50"
                }`}
              >
                <span className="block font-medium text-eos-on-surface">{f.name}</span>
                <span className="mt-1 block font-mono text-[10px] uppercase tracking-wide text-eos-on-surface-subtle">
                  {f.source} · {f.confidence} · {f.kcal} kcal / {f.grams}g
                  {f.caveat ? ` · ${f.caveat}` : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </BentoCard>

      {selected && (
        <BentoCard label="CONFIRM LOG" data-testid="nutrition-confirm-log">
          <p className="text-sm text-eos-on-surface">{selected.name}</p>
          <label htmlFor="nutrition-grams" className="mt-3 block text-[10px] uppercase tracking-widest text-eos-on-surface-subtle">
            Grams
          </label>
          <EliteInput
            id="nutrition-grams"
            type="number"
            min={1}
            value={grams}
            onChange={(e) => setGrams(Number(e.target.value) || 0)}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <EliteButton
              type="button"
              size="sm"
              loading={confirming}
              disabled={!grams || grams <= 0}
              onClick={() => void onConfirmLog()}
            >
              Confirm log
            </EliteButton>
            <EliteButton type="button" size="sm" variant="ghost" onClick={() => setSelected(null)}>
              Cancel
            </EliteButton>
          </div>
          <p className="mt-2 text-xs text-eos-on-surface-muted">
            Requires confirm:true — silent mutation blocked by API.
          </p>
        </BentoCard>
      )}

      {logMessage && (
        <p className="text-sm text-eos-telemetry" role="status">
          {logMessage}
        </p>
      )}

      <BentoCard label="TODAY LOG" data-testid="nutrition-diary">
        {logsState === "LOADING" && <p className="text-sm text-eos-on-surface-muted">LOADING…</p>}
        {logsState === "UNAVAILABLE" && (
          <p className="text-sm text-eos-on-surface-muted">UNAVAILABLE</p>
        )}
        {logsState === "EMPTY" && (
          <p className="text-sm text-eos-on-surface-muted">EMPTY — no confirmed logs yet.</p>
        )}
        {logsState === "AVAILABLE" && (
          <ul className="space-y-2">
            {logs.map((l) => (
              <li key={l.id} className="font-mono text-xs text-eos-on-surface">
                {l.dateISO} · {l.foodId} · {l.grams}g
              </li>
            ))}
          </ul>
        )}
      </BentoCard>
    </div>
  );
}
