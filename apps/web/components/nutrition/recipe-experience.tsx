"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BentoCard } from "@/components/elite-os/bento-card";
import { EliteButton } from "@/components/elite-os/elite-button";

type Recipe = {
  recipeId: string;
  name: string;
  locale: string;
  servings: number;
  preparation: string;
  ingredients: Array<{ foodId: string; grams: number }>;
  mealTiming: string[];
  sportSuitability: string[];
  allergens: string[];
  dietTags: string[];
  prepTimeMin: number;
  costEstimate: "low" | "medium" | "high" | null;
};

type RecipeNutrition = {
  recipeId: string;
  perServing: {
    kcal: number;
    proteinG: number;
    carbohydrateG: number;
    fatG: number;
    fiberG: number;
  };
  missingFoodIds: string[];
  confidence: string;
};

type LoadState = "LOADING" | "AVAILABLE" | "EMPTY" | "UNAVAILABLE" | "ERROR";

/** Recipe list + detail. Cook/log/favorite are confirm-gated; no silent diary writes. */
export function RecipeExperience() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [state, setState] = useState<LoadState>("LOADING");
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [nutrition, setNutrition] = useState<RecipeNutrition | null>(null);
  const [servings, setServings] = useState(1);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setState("LOADING");
    setMessage(null);
    try {
      const res = await fetch(
        "/api/v1/nutrition/targets?view=recipes&sportKey=endurance",
        { credentials: "include" }
      );
      if (!res.ok) {
        setRecipes([]);
        setState(res.status === 401 || res.status === 403 ? "UNAVAILABLE" : "ERROR");
        return;
      }
      const body = (await res.json()) as { recipes?: Recipe[] };
      const list = body.recipes ?? [];
      setRecipes(list);
      setState(list.length ? "AVAILABLE" : "EMPTY");
    } catch {
      setRecipes([]);
      setState("ERROR");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function openRecipe(recipe: Recipe) {
    setSelected(recipe);
    setServings(recipe.servings);
    setNutrition(null);
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/v1/nutrition/targets?view=recipes&id=${encodeURIComponent(recipe.recipeId)}`,
        { credentials: "include" }
      );
      if (!res.ok) {
        setMessage(res.status === 401 ? "Sign in required." : "Could not load recipe nutrition.");
        return;
      }
      const body = (await res.json()) as {
        recipe?: Recipe | null;
        nutrition?: RecipeNutrition | null;
      };
      if (body.recipe) setSelected(body.recipe);
      setNutrition(body.nutrition ?? null);
    } catch {
      setMessage("Network error loading recipe.");
    } finally {
      setBusy(false);
    }
  }

  async function logRecipe() {
    if (!selected || !selected.ingredients[0]) {
      setMessage("EMPTY — recipe has no ingredients to log.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const factor = servings / Math.max(1, selected.servings);
      const first = selected.ingredients[0];
      const res = await fetch("/api/v1/nutrition/log", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodId: first.foodId,
          grams: Math.max(1, Math.round(first.grams * factor)),
          confirm: true,
          slot: "lunch",
          note: `Recipe ${selected.recipeId} · ${servings} serving(s)`
        })
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setMessage(body.error ?? `Log failed (${res.status})`);
        return;
      }
      setMessage(
        `Logged first ingredient of ${selected.name} · ${servings} serving(s). Full multi-ingredient recipe log is confirm-gated per food.`
      );
    } catch {
      setMessage("Network error while logging.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6" data-testid="recipe-experience">
      <header className="space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-eos-telemetry">
          RECIPES · SPORT CONTEXT
        </p>
        <h1 className="font-display text-3xl text-eos-on-surface">Cook with context</h1>
        <p className="text-sm text-eos-on-surface-muted">
          Ingredients, servings, allergens, and nutrition from source-tagged foods. Logging requires
          confirm.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <EliteButton asChild size="sm" variant="ghost">
            <Link href="/nutrition">Nutrition hub</Link>
          </EliteButton>
          <EliteButton asChild size="sm" variant="ghost">
            <Link href="/nutrition/meals">Meals</Link>
          </EliteButton>
          <EliteButton asChild size="sm" variant="ghost">
            <Link href="/nutrition/grocery">Grocery</Link>
          </EliteButton>
          <EliteButton type="button" size="sm" variant="secondary" onClick={() => void load()}>
            Refresh
          </EliteButton>
        </div>
      </header>

      <BentoCard label="RECIPE LIST" data-testid="recipe-list">
        {state === "LOADING" && <p className="text-sm text-eos-on-surface-muted">LOADING…</p>}
        {state === "UNAVAILABLE" && (
          <p className="text-sm text-eos-on-surface-muted">UNAVAILABLE — sign in required.</p>
        )}
        {state === "ERROR" && <p className="text-sm text-eos-alert">ERROR loading recipes.</p>}
        {state === "EMPTY" && (
          <p className="text-sm text-eos-on-surface-muted">EMPTY — no recipes for this sport key.</p>
        )}
        {state === "AVAILABLE" && (
          <ul className="space-y-2" role="list">
            {recipes.map((recipe) => (
              <li key={recipe.recipeId}>
                <button
                  type="button"
                  onClick={() => void openRecipe(recipe)}
                  className={`w-full rounded-xl border px-3 py-3 text-left ${
                    selected?.recipeId === recipe.recipeId
                      ? "border-eos-voltline bg-eos-voltline/10"
                      : "border-eos-outline"
                  }`}
                  data-testid={`recipe-card-${recipe.recipeId}`}
                >
                  <span className="block font-medium text-eos-on-surface">{recipe.name}</span>
                  <span className="mt-1 block font-mono text-[10px] uppercase text-eos-on-surface-subtle">
                    {recipe.prepTimeMin} min · {recipe.servings} servings ·{" "}
                    {recipe.costEstimate ?? "cost n/a"} · {recipe.dietTags.join(", ") || "no diet tags"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </BentoCard>

      {selected ? (
        <BentoCard label="RECIPE DETAIL" data-testid="recipe-detail">
          <p className="text-lg font-semibold text-eos-on-surface">{selected.name}</p>
          <p className="mt-2 text-sm text-eos-on-surface-muted">{selected.preparation}</p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-eos-on-surface-subtle">
            Timing: {selected.mealTiming.join(" · ")} · Sports: {selected.sportSuitability.join(" · ")}
          </p>
          {selected.allergens.length > 0 ? (
            <p className="mt-2 text-xs text-eos-alert">Allergens: {selected.allergens.join(", ")}</p>
          ) : (
            <p className="mt-2 text-xs text-eos-on-surface-muted">Allergens: none declared</p>
          )}

          <label
            htmlFor="recipe-servings"
            className="mt-4 block text-[10px] uppercase tracking-widest text-eos-on-surface-subtle"
          >
            Servings
          </label>
          <input
            id="recipe-servings"
            type="number"
            min={1}
            value={servings}
            onChange={(e) => setServings(Math.max(1, Number(e.target.value) || 1))}
            className="mt-1 w-24 rounded-lg border border-eos-outline bg-transparent px-3 py-2 text-eos-on-surface"
          />

          <p className="mt-4 text-[10px] uppercase tracking-widest text-eos-on-surface-subtle">
            Ingredients
          </p>
          <ul className="mt-2 space-y-1" role="list">
            {selected.ingredients.map((ing) => (
              <li key={`${ing.foodId}-${ing.grams}`} className="font-mono text-xs text-eos-on-surface">
                {ing.foodId} · {Math.round(ing.grams * (servings / Math.max(1, selected.servings)))}g
              </li>
            ))}
          </ul>

          {busy && !nutrition ? (
            <p className="mt-3 text-sm text-eos-on-surface-muted">LOADING nutrition…</p>
          ) : null}
          {nutrition ? (
            <div className="mt-3 rounded-xl border border-eos-outline px-3 py-3" data-testid="recipe-nutrition">
              <p className="font-mono text-sm text-eos-voltline">
                ~{nutrition.perServing.kcal} kcal / serving · P {nutrition.perServing.proteinG}g · C{" "}
                {nutrition.perServing.carbohydrateG}g · F {nutrition.perServing.fatG}g
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase text-eos-on-surface-subtle">
                confidence {nutrition.confidence}
                {nutrition.missingFoodIds.length
                  ? ` · missing ${nutrition.missingFoodIds.join(", ")}`
                  : ""}
              </p>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <EliteButton
              type="button"
              size="sm"
              loading={busy}
              onClick={() => void logRecipe()}
              data-testid="recipe-log"
            >
              Confirm log (first ingredient)
            </EliteButton>
            <EliteButton
              type="button"
              size="sm"
              variant="secondary"
              onClick={() =>
                setFavorites((prev) => ({
                  ...prev,
                  [selected.recipeId]: !prev[selected.recipeId]
                }))
              }
              data-testid="recipe-favorite"
            >
              {favorites[selected.recipeId] ? "Unfavorite" : "Favorite"}
            </EliteButton>
            <EliteButton asChild size="sm" variant="ghost">
              <Link href="/nutrition/meals">Swap into meal plan</Link>
            </EliteButton>
            <EliteButton
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setSelected(null);
                setNutrition(null);
              }}
            >
              Close
            </EliteButton>
          </div>
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
