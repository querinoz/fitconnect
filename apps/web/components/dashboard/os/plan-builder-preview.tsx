"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, GripVertical, Plus, Save, Send, Sparkles, X } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

type Block = {
  id: string;
  name: string;
  type: "active" | "strength" | "recovery" | "endurance";
  duration: number;
  intensity: "low" | "moderate" | "high";
};

const INITIAL_BLOCKS: Record<(typeof DAYS)[number], Block[]> = {
  Mon: [{ id: "b1", name: "Vinyasa Flow", type: "active", duration: 60, intensity: "moderate" }],
  Tue: [{ id: "b2", name: "Strength Upper", type: "strength", duration: 45, intensity: "high" }],
  Wed: [{ id: "b3", name: "Active Recovery", type: "recovery", duration: 30, intensity: "low" }],
  Thu: [{ id: "b4", name: "Bouldering", type: "active", duration: 90, intensity: "high" }],
  Fri: [{ id: "b5", name: "Yoga Restore", type: "active", duration: 45, intensity: "low" }],
  Sat: [{ id: "b6", name: "Long Ride", type: "endurance", duration: 120, intensity: "moderate" }],
  Sun: []
};

const TYPE_STYLES: Record<Block["type"], string> = {
  active: "border-brand-400/35 bg-brand-400/8",
  strength: "border-lime-500/35 bg-lime-500/8",
  recovery: "border-plasma-500/35 bg-plasma-500/8",
  endurance: "border-amber-400/35 bg-amber-400/8"
};

const INTENSITY_STYLES: Record<Block["intensity"], string> = {
  low: "bg-lime-500/15 text-lime-400",
  moderate: "bg-brand-400/15 text-brand-400",
  high: "bg-signal-500/15 text-signal-500"
};

const AI_SUGGESTION = {
  day: "Thu" as const,
  block: {
    id: "ai1",
    name: "Light Mobility",
    type: "recovery" as const,
    duration: 30,
    intensity: "low" as const
  },
  reason:
    "Ines' HRV dropped 8ms overnight. Suggest swapping bouldering for mobility work."
};

export function PlanBuilderPreview({ athleteName }: { athleteName: string }) {
  const [blocks, setBlocks] = useState(INITIAL_BLOCKS);
  const [aiVisible, setAiVisible] = useState(true);
  const [saved, setSaved] = useState(false);

  const acceptAI = () => {
    setBlocks((prev) => ({ ...prev, Thu: [AI_SUGGESTION.block] }));
    setAiVisible(false);
  };

  const handleSave = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-6">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h3 className="font-display text-base font-bold text-ink-100">Weekly Plan</h3>
          <p className="mt-0.5 text-xs text-ink-500">
            {athleteName} · Week of May 19, 2026
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={handleSave}
            className={`gap-1.5 border-ink-700 text-xs transition-all ${
              saved ? "border-lime-500/40 bg-lime-500/10 text-lime-400" : "text-ink-400"
            }`}
          >
            {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            {saved ? "Saved" : "Save"}
          </Button>
          <Button
            size="sm"
            type="button"
            className="gap-1.5 bg-gradient-to-r from-brand-500 to-lime-500 text-xs font-bold text-ink-950"
          >
            <Send className="h-3.5 w-3.5" /> Publish
          </Button>
        </div>
      </div>

      {aiVisible ? (
        <div className="mb-5 overflow-hidden">
          <div className="flex items-start gap-3 rounded-xl border border-plasma-500/30 bg-plasma-500/6 p-4">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-plasma-500/20">
              <Sparkles className="h-4 w-4 text-plasma-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-plasma-500">
                AI Suggestion
              </p>
              <p className="text-xs leading-relaxed text-ink-300">{AI_SUGGESTION.reason}</p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <Button
                size="icon"
                type="button"
                variant="ghost"
                className="h-7 w-7 rounded-lg text-lime-400 hover:bg-lime-500/10"
                onClick={acceptAI}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                type="button"
                variant="ghost"
                className="h-7 w-7 rounded-lg text-signal-500 hover:bg-signal-500/10"
                onClick={() => setAiVisible(false)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-7 gap-2">
        {DAYS.map((day) => (
          <div key={day}>
            <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wider text-ink-500">
              {day}
            </p>
            <div className="min-h-[100px] space-y-2">
              {(blocks[day] ?? []).map((block) => (
                <div
                  key={block.id}
                  className={`cursor-grab rounded-lg border ${TYPE_STYLES[block.type]} p-2 active:cursor-grabbing`}
                >
                  <div className="mb-1.5 flex items-center gap-1">
                    <GripVertical className="h-3 w-3 shrink-0 text-ink-600" />
                    <p className="truncate text-[10px] font-semibold leading-tight text-ink-200">
                      {block.name}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold ${INTENSITY_STYLES[block.intensity]}`}
                    >
                      {block.intensity}
                    </span>
                    <span className="text-[8px] text-ink-600">{block.duration}m</span>
                  </div>
                </div>
              ))}
              {(!blocks[day] || blocks[day].length === 0) && (
                <div className="group flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-ink-800 hover:border-ink-700 hover:bg-ink-800/20">
                  <Plus className="h-3.5 w-3.5 text-ink-700 transition-colors group-hover:text-ink-500" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
