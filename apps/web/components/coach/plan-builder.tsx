"use client";

import { useMemo, useState } from "react";
import type { PlanBlock } from "@/lib/dashboard/types";
import {
  EXERCISE_LIBRARY,
  PLAN_DAYS,
  type Exercise,
  type ExerciseCategory,
  type PlanDay
} from "@/lib/coach/exercises";
import { useDashboardStore } from "@/lib/dashboard-store";
import { Button } from "@/components/ui/button";
import {
  AIInsight,
  ChartShell,
  PremiumCard,
  SectionHeader
} from "@/components/ui-glass/premium-system";
import { cn } from "@/lib/utils";
import { GripVertical, Plus, Save, Sparkles, Trash2 } from "lucide-react";

type PlanBuilderProps = {
  planId: string;
  athleteId: string;
  athleteName: string;
  initialBlocks: PlanBlock[];
  aiSuggestion: string;
};

export function PlanBuilder({
  planId,
  athleteId,
  athleteName,
  initialBlocks,
  aiSuggestion
}: PlanBuilderProps) {
  const setPlanBlocks = useDashboardStore((s) => s.setPlanBlocks);
  const updatePlanSuggestion = useDashboardStore((s) => s.updatePlanSuggestion);
  const applyPlanDiff = useDashboardStore((s) => s.applyPlanDiff);

  const [blocks, setBlocks] = useState<PlanBlock[]>(initialBlocks);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ExerciseCategory | "All">("All");
  const [draftSaved, setDraftSaved] = useState(false);
  const [published, setPublished] = useState(false);
  const [suggestionStatus, setSuggestionStatus] = useState<"pending" | "approved" | "rejected">(
    "pending"
  );
  const [dragBlockId, setDragBlockId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return EXERCISE_LIBRARY.filter((ex) => {
      if (category !== "All" && ex.category !== category) return false;
      if (!query.trim()) return true;
      return ex.name.toLowerCase().includes(query.toLowerCase());
    });
  }, [category, query]);

  const blocksByDay = useMemo(() => {
    const map = Object.fromEntries(PLAN_DAYS.map((d) => [d, [] as PlanBlock[]])) as Record<
      PlanDay,
      PlanBlock[]
    >;
    for (const b of blocks) {
      const day = PLAN_DAYS.includes(b.day as PlanDay) ? (b.day as PlanDay) : "Mon";
      map[day].push(b);
    }
    return map;
  }, [blocks]);

  function addExercise(ex: Exercise, day: PlanDay = "Mon") {
    const block: PlanBlock = {
      id: `blk-${Date.now()}-${ex.id}`,
      day,
      title: ex.name,
      detail: `${ex.muscles} · ${ex.equipment}`,
      intensity: ex.category === "Recovery" ? "RPE 3" : "RPE 6",
      completed: false
    };
    setBlocks((prev) => [...prev, block]);
    setDraftSaved(false);
    setPublished(false);
  }

  function removeBlock(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    setDraftSaved(false);
    setPublished(false);
  }

  function moveBlockToDay(blockId: string, day: PlanDay) {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, day } : b))
    );
    setDraftSaved(false);
    setPublished(false);
  }

  function saveDraft() {
    setPlanBlocks(planId, blocks);
    setDraftSaved(true);
    window.setTimeout(() => setDraftSaved(false), 2000);
  }

  function publishPlan() {
    setPlanBlocks(planId, blocks);
    setPublished(true);
    updatePlanSuggestion(planId, `Published plan for ${athleteName}`);
  }

  function approveSuggestion() {
    applyPlanDiff(planId, "lighter-day");
    setSuggestionStatus("approved");
  }

  return (
    <div className="space-y-6 pb-8">
      <SectionHeader
        eyebrow="Plan builder"
        title={`Weekly plan · ${athleteName}`}
        body="Drag sessions across days, pull from the exercise library, and publish when ready."
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <aside className="lg:col-span-4 space-y-3">
          <PremiumCard className="p-4 space-y-3">
            <h2 className="text-sm font-semibold text-ink-100">Exercise library</h2>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search exercises…"
              className="w-full rounded-xl border border-ink-800 bg-ink-950/60 px-3 py-2 text-sm"
              aria-label="Search exercises"
            />
            <div className="flex flex-wrap gap-1.5">
              {(["All", "Strength", "Cardio", "Mobility", "Recovery"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                    category === c
                      ? "border-plasma-400/50 bg-plasma-500/15 text-plasma-200"
                      : "border-ink-800 text-ink-500"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
            <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {filtered.map((ex) => (
                <li key={ex.id}>
                  <button
                    type="button"
                    onClick={() => addExercise(ex)}
                    className="flex w-full items-start justify-between gap-2 rounded-xl border border-ink-800 bg-ink-950/40 px-3 py-2 text-left hover:border-brand-400/40"
                  >
                    <span>
                      <span className="block text-sm font-medium text-ink-100">{ex.name}</span>
                      <span className="text-[10px] text-ink-500">
                        {ex.category} · {ex.equipment}
                      </span>
                    </span>
                    <Plus className="h-4 w-4 shrink-0 text-brand-300" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </PremiumCard>

          <AIInsight
            title="AI co-pilot"
            body={aiSuggestion}
            action={
              suggestionStatus === "pending" ? (
                <div className="mt-3 flex gap-2">
                  <Button type="button" size="sm" onClick={approveSuggestion}>
                    <Sparkles className="h-3.5 w-3.5" aria-hidden />
                    Approve
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setSuggestionStatus("rejected")}
                  >
                    Reject
                  </Button>
                </div>
              ) : (
                <p className="mt-2 text-xs text-ink-400 capitalize">{suggestionStatus}</p>
              )
            }
          />
        </aside>

        <div className="lg:col-span-8 space-y-4">
          <ChartShell title="Weekly planner" subtitle="Drag blocks between days">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
              {PLAN_DAYS.map((day) => (
                <div
                  key={day}
                  className="min-h-[140px] rounded-2xl border border-ink-800 bg-ink-950/40 p-2"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragBlockId) moveBlockToDay(dragBlockId, day);
                    setDragBlockId(null);
                  }}
                >
                  <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest text-ink-500">
                    {day}
                  </p>
                  <ul className="space-y-2">
                    {blocksByDay[day].map((block) => (
                      <li
                        key={block.id}
                        draggable
                        onDragStart={() => setDragBlockId(block.id)}
                        onDragEnd={() => setDragBlockId(null)}
                        className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-2 cursor-grab active:cursor-grabbing"
                      >
                        <div className="flex items-start gap-1">
                          <GripVertical className="h-3.5 w-3.5 shrink-0 text-ink-600" aria-hidden />
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-semibold text-ink-100 truncate">
                              {block.title}
                            </p>
                            <p className="text-[10px] text-ink-500">{block.intensity}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeBlock(block.id)}
                            className="text-ink-600 hover:text-signal-400"
                            aria-label={`Remove ${block.title}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </ChartShell>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={saveDraft}>
              <Save className="h-4 w-4" aria-hidden />
              {draftSaved ? "Draft saved" : "Save draft"}
            </Button>
            <Button type="button" variant="default" onClick={publishPlan}>
              Publish plan
            </Button>
            {published && (
              <span className="self-center text-sm text-accent-400">
                Published · athlete {athleteId} will see updates live
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
