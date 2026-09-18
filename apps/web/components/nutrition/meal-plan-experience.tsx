"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BentoCard } from "@/components/elite-os/bento-card";
import { EliteButton } from "@/components/elite-os/elite-button";

type FoodLite = {
  foodId: string;
  name: string;
  source: string;
  kcal: number;
  proteinG: number;
  carbohydrateG?: number;
  fatG?: number;
  caveat?: string | null;
};

type PlannedSlot = {
  slot: string;
  label: string;
  foodIds: string[];
  why: string[];
  foods: FoodLite[];
};

type PlanDay = {
  dateISO: string;
  trainingContext: string;
  slots: PlannedSlot[];
};

type MealPlan = {
  weekStartISO: string;
  days: PlanDay[];
  evidenceConfigVersion?: string;
};

type SwapOption = {
  foodId: string;
  name: string;
  why: string[];
  source: string;
};

type LoadState = "LOADING" | "AVAILABLE" | "EMPTY" | "UNAVAILABLE" | "ERROR";

/** Today meal plan with confirm-gated swap. Diary is never silently mutated. */
export function MealPlanExperience() {
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [state, setState] = useState<LoadState>("LOADING");
  const [note, setNote] = useState("");
  const [activeSlot, setActiveSlot] = useState<{ dayIdx: number; slotIdx: number } | null>(null);
  const [swapOptions, setSwapOptions] = useState<SwapOption[]>([]);
  const [swapPreview, setSwapPreview] = useState<SwapOption | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [detailSlot, setDetailSlot] = useState<{ dayIdx: number; slotIdx: number } | null>(null);

  const loadPlan = useCallback(async () => {
    setState("LOADING");
    setMessage(null);
    try {
      const res = await fetch(
        "/api/v1/nutrition/targets?view=meal-plan&sport=RUNNING&day=moderate&durationMin=45&goal=PERFORMANCE&locale=pt-PT",
        { credentials: "include" }
      );
      if (!res.ok) {
        setPlan(null);
        setState(res.status === 401 || res.status === 403 ? "UNAVAILABLE" : "ERROR");
        return;
      }
      const body = (await res.json()) as { plan?: MealPlan; note?: string };
      const next = body.plan ?? null;
      setPlan(next);
      setNote(body.note ?? "");
      const hasSlots = Boolean(next?.days?.some((d) => d.slots.length));
      setState(!next ? "EMPTY" : hasSlots ? "AVAILABLE" : "EMPTY");
    } catch {
      setPlan(null);
      setState("ERROR");
    }
  }, []);

  useEffect(() => {
    void loadPlan();
  }, [loadPlan]);

  const today = plan?.days[0] ?? null;

  async function openSwap(dayIdx: number, slotIdx: number) {
    if (!plan) return;
    const slot = plan.days[dayIdx]?.slots[slotIdx];
    if (!slot) return;
    setActiveSlot({ dayIdx, slotIdx });
    setSwapPreview(null);
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/v1/nutrition/meal-swap", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "suggest", slot, locale: "pt-PT" })
      });
      if (!res.ok) {
        setSwapOptions([]);
        setMessage(res.status === 401 ? "Sign in required." : "Could not load swap options.");
        return;
      }
      const body = (await res.json()) as { options?: SwapOption[] };
      setSwapOptions(body.options ?? []);
    } catch {
      setSwapOptions([]);
      setMessage("Network error loading swaps.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmSwap() {
    if (!plan || !activeSlot || !swapPreview) return;
    const slot = plan.days[activeSlot.dayIdx]?.slots[activeSlot.slotIdx];
    if (!slot) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/v1/nutrition/meal-swap", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "apply",
          confirm: true,
          nextFoodId: swapPreview.foodId,
          slot,
          locale: "pt-PT"
        })
      });
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        slot?: PlannedSlot;
      };
      if (!res.ok) {
        setMessage(body.error ?? `Apply failed (${res.status})`);
        return;
      }
      if (body.slot) {
        setPlan((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            days: prev.days.map((d, di) =>
              di !== activeSlot.dayIdx
                ? d
                : {
                    ...d,
                    slots: d.slots.map((s, si) =>
                      si === activeSlot.slotIdx ? { ...s, ...body.slot! } : s
                    )
                  }
            )
          };
        });
        setMessage(
          `Swapped to ${swapPreview.name}. Diary unchanged until you confirm a food log.`
        );
      }
      setActiveSlot(null);
      setSwapOptions([]);
      setSwapPreview(null);
    } catch {
      setMessage("Network error applying swap.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6" data-testid="meal-plan-experience">
      <header className="space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-eos-telemetry">
          MEALS · TODAY
        </p>
        <h1 className="font-display text-3xl text-eos-on-surface">What should I eat?</h1>
        <p className="text-sm text-eos-on-surface-muted">
          Sport-aware suggestion. Swap = preview → confirm. Food logging stays a separate confirm
          gate.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <EliteButton asChild size="sm" variant="ghost">
            <Link href="/nutrition">Nutrition hub</Link>
          </EliteButton>
          <EliteButton asChild size="sm" variant="ghost">
            <Link href="/nutrition/grocery">Grocery</Link>
          </EliteButton>
          <EliteButton asChild size="sm" variant="ghost">
            <Link href="/nutrition/recipes">Recipes</Link>
          </EliteButton>
          <EliteButton asChild size="sm" variant="ghost">
            <Link href="/train">TRAIN</Link>
          </EliteButton>
          <EliteButton type="button" size="sm" variant="secondary" onClick={() => void loadPlan()}>
            Regenerate
          </EliteButton>
        </div>
      </header>

      <BentoCard label="TODAY PLAN" data-testid="meal-plan-today">
        {state === "LOADING" && <p className="text-sm text-eos-on-surface-muted">LOADING…</p>}
        {state === "UNAVAILABLE" && (
          <p className="text-sm text-eos-on-surface-muted">UNAVAILABLE — sign in required.</p>
        )}
        {state === "ERROR" && <p className="text-sm text-eos-alert">ERROR loading meal plan.</p>}
        {state === "EMPTY" && (
          <p className="text-sm text-eos-on-surface-muted">EMPTY — no slots generated.</p>
        )}
        {state === "AVAILABLE" && today && (
          <div className="space-y-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-eos-on-surface-subtle">
              {today.dateISO} · {today.trainingContext}
            </p>
            <ul className="space-y-3" role="list">
              {today.slots.map((slot, slotIdx) => (
                <li
                  key={`${slot.slot}-${slotIdx}`}
                  className="rounded-xl border border-eos-outline px-3 py-3"
                  data-testid={`meal-slot-${slot.slot}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => setDetailSlot({ dayIdx: 0, slotIdx })}
                      data-testid={`meal-detail-${slot.slot}`}
                    >
                      <p className="font-medium text-eos-on-surface">{slot.label}</p>
                      <p className="mt-1 text-sm text-eos-on-surface">
                        {slot.foods?.map((f) => f.name).join(", ") || slot.foodIds.join(", ")}
                      </p>
                      <p className="mt-1 text-xs text-eos-on-surface-muted">
                        {slot.why.slice(0, 2).join(" · ")}
                      </p>
                    </button>
                    <div className="flex flex-wrap gap-2">
                      <EliteButton
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setDetailSlot({ dayIdx: 0, slotIdx })}
                      >
                        Detail
                      </EliteButton>
                      <EliteButton
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => void openSwap(0, slotIdx)}
                        data-testid={`meal-swap-${slot.slot}`}
                      >
                        Swap
                      </EliteButton>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {note ? <p className="text-xs text-eos-on-surface-muted">{note}</p> : null}
          </div>
        )}
      </BentoCard>

      {detailSlot && plan ? (
        <BentoCard label="MEAL DETAIL · BREAKDOWN" data-testid="meal-detail-panel">
          {(() => {
            const slot = plan.days[detailSlot.dayIdx]?.slots[detailSlot.slotIdx];
            if (!slot) {
              return <p className="text-sm text-eos-on-surface-muted">EMPTY — slot unavailable.</p>;
            }
            const foods = slot.foods ?? [];
            const kcal = foods.reduce((s, f) => s + (f.kcal ?? 0), 0);
            const protein = foods.reduce((s, f) => s + (f.proteinG ?? 0), 0);
            const carbs = foods.reduce((s, f) => s + (f.carbohydrateG ?? 0), 0);
            const fat = foods.reduce((s, f) => s + (f.fatG ?? 0), 0);
            return (
              <div className="space-y-3">
                <p className="font-medium text-eos-on-surface">
                  {slot.label} · {slot.slot}
                </p>
                <p className="font-mono text-sm text-eos-voltline">
                  ~{kcal} kcal · P {protein}g · C {carbs}g · F {fat}g
                </p>
                <ul className="space-y-2" role="list">
                  {foods.map((f) => (
                    <li key={f.foodId} className="rounded-lg border border-eos-outline px-3 py-2">
                      <span className="block text-sm text-eos-on-surface">{f.name}</span>
                      <span className="font-mono text-[10px] uppercase text-eos-on-surface-subtle">
                        {f.source} · {f.kcal} kcal · P {f.proteinG}g
                        {f.caveat ? ` · ${f.caveat}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-eos-on-surface-muted">{slot.why.join(" · ")}</p>
                <div className="flex flex-wrap gap-2">
                  <EliteButton
                    type="button"
                    size="sm"
                    onClick={() => void openSwap(detailSlot.dayIdx, detailSlot.slotIdx)}
                  >
                    Swap this meal
                  </EliteButton>
                  <EliteButton asChild size="sm" variant="ghost">
                    <Link href="/nutrition/recipes">Open recipes</Link>
                  </EliteButton>
                  <EliteButton
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setDetailSlot(null)}
                  >
                    Close
                  </EliteButton>
                </div>
              </div>
            );
          })()}
        </BentoCard>
      ) : null}

      {activeSlot ? (
        <BentoCard label="SWAP · PREVIEW → CONFIRM" data-testid="meal-swap-panel">
          {busy && swapOptions.length === 0 ? (
            <p className="text-sm text-eos-on-surface-muted">LOADING options…</p>
          ) : null}
          {!busy && swapOptions.length === 0 ? (
            <p className="text-sm text-eos-on-surface-muted">EMPTY — no safe candidates.</p>
          ) : null}
          <ul className="space-y-2" role="listbox" aria-label="Swap options">
            {swapOptions.map((opt) => (
              <li key={opt.foodId}>
                <button
                  type="button"
                  role="option"
                  aria-selected={swapPreview?.foodId === opt.foodId}
                  onClick={() => setSwapPreview(opt)}
                  className={`w-full rounded-xl border px-3 py-3 text-left ${
                    swapPreview?.foodId === opt.foodId
                      ? "border-eos-voltline bg-eos-voltline/10"
                      : "border-eos-outline"
                  }`}
                >
                  <span className="block font-medium text-eos-on-surface">{opt.name}</span>
                  <span className="mt-1 block font-mono text-[10px] uppercase text-eos-on-surface-subtle">
                    {opt.source} · {opt.why.join(" · ")}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <EliteButton
              type="button"
              size="sm"
              loading={busy}
              disabled={!swapPreview}
              onClick={() => void confirmSwap()}
              data-testid="meal-swap-confirm"
            >
              Confirm swap
            </EliteButton>
            <EliteButton
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setActiveSlot(null);
                setSwapOptions([]);
                setSwapPreview(null);
              }}
            >
              Cancel
            </EliteButton>
          </div>
        </BentoCard>
      ) : null}

      {message ? (
        <p className="text-sm text-eos-telemetry" role="status">
          {message}
        </p>
      ) : null}

      {plan && plan.days.length > 1 ? (
        <BentoCard label="WEEK OVERVIEW" data-testid="meal-plan-week">
          <ul className="space-y-2">
            {plan.days.slice(1).map((d) => (
              <li key={d.dateISO} className="font-mono text-xs text-eos-on-surface-muted">
                {d.dateISO} · {d.trainingContext} · {d.slots.length} slots
              </li>
            ))}
          </ul>
        </BentoCard>
      ) : null}
    </div>
  );
}
