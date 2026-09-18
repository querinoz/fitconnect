"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BentoCard } from "@/components/elite-os/bento-card";
import { EliteButton } from "@/components/elite-os/elite-button";
import { EliteInput } from "@/components/elite-os/elite-input";

type GroceryLine = {
  foodId: string;
  name: string;
  source: string;
  quantityNeeded: number;
  unit: string;
  category: string;
  pantryQuantity: number;
  remainingQuantity: number;
  shoppingPriority: "high" | "medium" | "low";
};

type FoodHit = {
  foodId: string;
  name: string;
  source: string;
};

type LoadState = "LOADING" | "AVAILABLE" | "EMPTY" | "UNAVAILABLE" | "ERROR";

/** Grocery list reconciled from meal plan − pantry. Check-off/add/remove are session-local. */
export function GroceryExperience() {
  const [lines, setLines] = useState<GroceryLine[]>([]);
  const [state, setState] = useState<LoadState>("LOADING");
  const [note, setNote] = useState("");
  const [purchased, setPurchased] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [addQuery, setAddQuery] = useState("");
  const [addHits, setAddHits] = useState<FoodHit[]>([]);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setState("LOADING");
    setMessage(null);
    try {
      const res = await fetch(
        "/api/v1/nutrition/targets?view=meal-plan&sport=RUNNING&day=moderate&durationMin=45&goal=PERFORMANCE&locale=pt-PT",
        { credentials: "include" }
      );
      if (!res.ok) {
        setLines([]);
        setState(res.status === 401 || res.status === 403 ? "UNAVAILABLE" : "ERROR");
        return;
      }
      const body = (await res.json()) as { grocery?: GroceryLine[]; note?: string };
      const list = body.grocery ?? [];
      setLines(list);
      setNote(body.note ?? "");
      setPurchased({});
      setState(list.length ? "AVAILABLE" : "EMPTY");
    } catch {
      setLines([]);
      setState("ERROR");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const remaining = useMemo(
    () => lines.filter((l) => !purchased[l.foodId]),
    [lines, purchased]
  );

  const byCategory = useMemo(() => {
    const map = new Map<string, GroceryLine[]>();
    for (const line of remaining) {
      const bucket = map.get(line.category) ?? [];
      bucket.push(line);
      map.set(line.category, bucket);
    }
    return [...map.entries()];
  }, [remaining]);

  async function searchAdd(e: React.FormEvent) {
    e.preventDefault();
    const q = addQuery.trim();
    if (!q) return;
    setAdding(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/v1/nutrition/foods?q=${encodeURIComponent(q)}&locale=pt-PT`, {
        credentials: "include"
      });
      if (!res.ok) {
        setAddHits([]);
        setMessage(res.status === 401 ? "Sign in required." : "Food search failed.");
        return;
      }
      const body = (await res.json()) as { foods?: FoodHit[] };
      setAddHits((body.foods ?? []).slice(0, 6));
      if (!(body.foods ?? []).length) setMessage("EMPTY — no foods for add query.");
    } catch {
      setAddHits([]);
      setMessage("Network error searching foods.");
    } finally {
      setAdding(false);
    }
  }

  function addLine(hit: FoodHit) {
    setLines((prev) => {
      if (prev.some((l) => l.foodId === hit.foodId)) {
        setMessage("Already on list — not duplicated.");
        return prev;
      }
      setState("AVAILABLE");
      setMessage(`Added ${hit.name} to this shopping session (plan unchanged).`);
      return [
        ...prev,
        {
          foodId: hit.foodId,
          name: hit.name,
          source: hit.source,
          quantityNeeded: 1,
          unit: "serving",
          category: "other",
          pantryQuantity: 0,
          remainingQuantity: 1,
          shoppingPriority: "low"
        }
      ];
    });
    setAddHits([]);
    setAddQuery("");
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6" data-testid="grocery-experience">
      <header className="space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-eos-telemetry">
          GROCERY · FROM PLAN
        </p>
        <h1 className="font-display text-3xl text-eos-on-surface">Shopping list</h1>
        <p className="text-sm text-eos-on-surface-muted">
          Aggregated from meal-plan servings minus pantry. Check-off / add / remove are session-local;
          regenerate reconciles with a fresh plan.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <EliteButton asChild size="sm" variant="ghost">
            <Link href="/nutrition">Nutrition hub</Link>
          </EliteButton>
          <EliteButton asChild size="sm" variant="ghost">
            <Link href="/nutrition/meals">Meals</Link>
          </EliteButton>
          <EliteButton asChild size="sm" variant="ghost">
            <Link href="/nutrition/recipes">Recipes</Link>
          </EliteButton>
          <EliteButton
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => void load()}
            data-testid="grocery-regenerate"
          >
            Regenerate
          </EliteButton>
        </div>
      </header>

      <BentoCard label="ADD ITEM · FOOD SEARCH" data-testid="grocery-add">
        <form onSubmit={searchAdd} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label
              htmlFor="grocery-add-q"
              className="mb-1 block text-[10px] uppercase tracking-widest text-eos-on-surface-subtle"
            >
              Search to add
            </label>
            <EliteInput
              id="grocery-add-q"
              value={addQuery}
              onChange={(e) => setAddQuery(e.target.value)}
              placeholder="arroz, banana…"
              autoComplete="off"
            />
          </div>
          <EliteButton type="submit" size="sm" loading={adding} disabled={!addQuery.trim()}>
            Search
          </EliteButton>
        </form>
        {addHits.length > 0 ? (
          <ul className="mt-3 space-y-2" role="list">
            {addHits.map((hit) => (
              <li key={hit.foodId} className="flex items-center justify-between gap-2">
                <span className="text-sm text-eos-on-surface">
                  {hit.name}
                  <span className="ml-2 font-mono text-[10px] uppercase text-eos-on-surface-subtle">
                    {hit.source}
                  </span>
                </span>
                <EliteButton
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => addLine(hit)}
                  data-testid={`grocery-add-${hit.foodId}`}
                >
                  Add
                </EliteButton>
              </li>
            ))}
          </ul>
        ) : null}
      </BentoCard>

      <BentoCard label="REMAINING" data-testid="grocery-remaining">
        {state === "LOADING" && <p className="text-sm text-eos-on-surface-muted">LOADING…</p>}
        {state === "UNAVAILABLE" && (
          <p className="text-sm text-eos-on-surface-muted">UNAVAILABLE — sign in required.</p>
        )}
        {state === "ERROR" && <p className="text-sm text-eos-alert">ERROR loading grocery.</p>}
        {state === "EMPTY" && remaining.length === 0 && (
          <p className="text-sm text-eos-on-surface-muted">
            EMPTY — pantry covers plan or no plan servings.
          </p>
        )}
        {state === "AVAILABLE" && remaining.length === 0 && (
          <p className="text-sm text-eos-performance">All checked — shopping session complete.</p>
        )}
        {byCategory.length > 0 && (
          <div className="space-y-4">
            {byCategory.map(([category, items]) => (
              <div key={category}>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-eos-on-surface-subtle">
                  {category}
                </p>
                <ul className="space-y-2" role="list">
                  {items.map((line) => (
                    <li
                      key={line.foodId}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-eos-outline px-3 py-3"
                      data-testid={`grocery-line-${line.foodId}`}
                    >
                      <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-1 h-5 w-5 accent-[var(--eos-voltline)]"
                          checked={Boolean(purchased[line.foodId])}
                          onChange={() =>
                            setPurchased((prev) => ({
                              ...prev,
                              [line.foodId]: !prev[line.foodId]
                            }))
                          }
                          aria-label={`Purchased ${line.name}`}
                        />
                        <span>
                          <span className="block font-medium text-eos-on-surface">{line.name}</span>
                          <span className="mt-1 block font-mono text-[10px] uppercase text-eos-on-surface-subtle">
                            {line.remainingQuantity} {line.unit} · need {line.quantityNeeded} · pantry{" "}
                            {line.pantryQuantity} · {line.shoppingPriority} · {line.source}
                          </span>
                        </span>
                      </label>
                      <EliteButton
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setLines((prev) => prev.filter((l) => l.foodId !== line.foodId));
                          setPurchased((prev) => {
                            const next = { ...prev };
                            delete next[line.foodId];
                            return next;
                          });
                          setMessage("Removed from this shopping session (plan unchanged).");
                        }}
                      >
                        Remove
                      </EliteButton>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {note ? <p className="text-xs text-eos-on-surface-muted">{note}</p> : null}
          </div>
        )}
      </BentoCard>

      {Object.values(purchased).some(Boolean) ? (
        <BentoCard label="CHECKED OFF" data-testid="grocery-purchased">
          <ul className="space-y-1">
            {lines
              .filter((l) => purchased[l.foodId])
              .map((l) => (
                <li
                  key={l.foodId}
                  className="font-mono text-xs text-eos-on-surface-muted line-through"
                >
                  {l.name}
                </li>
              ))}
          </ul>
          <EliteButton
            type="button"
            size="sm"
            variant="ghost"
            className="mt-3"
            onClick={() => {
              setPurchased((prev) => {
                const next = { ...prev };
                for (const id of Object.keys(next)) {
                  if (next[id]) next[id] = false;
                }
                return next;
              });
              setMessage("Unchecked all items.");
            }}
          >
            Uncheck all
          </EliteButton>
        </BentoCard>
      ) : null}

      {message ? (
        <p className="text-sm text-eos-telemetry" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
