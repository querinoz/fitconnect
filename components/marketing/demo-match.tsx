"use client";

import { Sparkles, Star } from "lucide-react";
import { TargetIcon } from "@/components/brand/icons";
import { cn } from "@/lib/utils";

/**
 * Coach-finder match demo.
 *
 * Four panels (3 questions + 1 result card) live on a horizontally
 * sliding track. The track loops through them via the `.fc-step-cycle`
 * keyframe (defined in globals.css).
 *
 * Reduced-motion freezes the track on the first question.
 */
export function DemoMatch({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-ink-800 bg-ink-950/70 p-6 relative overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-widest text-plasma-300 font-bold">
          Coach finder · 60 seconds
        </p>
        <p className="text-[10px] text-ink-500">3 questions · result</p>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 w-full rounded-full bg-ink-800 overflow-hidden">
        <div className="fc-step-cycle h-full w-1/4 rounded-full bg-gradient-to-r from-brand-400 to-accent-500 origin-left" />
      </div>

      <div className="mt-5 overflow-hidden">
        <div className="flex w-[400%] fc-step-cycle">
          <Step
            number={1}
            question="What's your sport?"
            options={[
              { label: "Yoga", emoji: "🧘", chosen: false },
              { label: "Strength", emoji: "🏋️", chosen: true },
              { label: "Surf", emoji: "🏄", chosen: false }
            ]}
          />
          <Step
            number={2}
            question="What's the goal?"
            options={[
              { label: "Build strength", emoji: "💪", chosen: true },
              { label: "Lose weight", emoji: "⚖️", chosen: false },
              { label: "Train for an event", emoji: "🏆", chosen: false }
            ]}
          />
          <Step
            number={3}
            question="When can you train?"
            options={[
              { label: "Weekday mornings", emoji: "🌅", chosen: true },
              { label: "Weekday evenings", emoji: "🌃", chosen: false },
              { label: "Weekends only", emoji: "📅", chosen: false }
            ]}
          />
          <Result />
        </div>
      </div>
    </div>
  );
}

function Step({
  number,
  question,
  options
}: {
  number: number;
  question: string;
  options: { label: string; emoji: string; chosen: boolean }[];
}) {
  return (
    <div className="w-1/4 shrink-0 pr-4">
      <p className="text-[10px] uppercase tracking-widest text-ink-500">
        Step {number} of 3
      </p>
      <h4 className="mt-1 font-display text-lg font-bold text-ink-50">
        {question}
      </h4>
      <ul className="mt-3 space-y-2">
        {options.map((o) => (
          <li
            key={o.label}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors",
              o.chosen
                ? "border-brand-400/60 bg-brand-500/10 text-ink-50"
                : "border-ink-800 bg-ink-950/40 text-ink-300"
            )}
          >
            <span className="text-lg">{o.emoji}</span>
            <span className="flex-1">{o.label}</span>
            {o.chosen && (
              <span className="text-[10px] uppercase tracking-widest text-brand-300 font-bold">
                Picked
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Result() {
  return (
    <div className="w-1/4 shrink-0 pr-4">
      <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-accent-400 font-bold">
        <Sparkles className="h-3 w-3" /> We found your match
      </div>
      <div className="mt-3 rounded-2xl border border-ink-800 bg-gradient-to-br from-brand-500/10 via-ink-950 to-accent-500/10 p-4">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-accent-500 text-ink-950 ring-2 ring-brand-400/40">
            <TargetIcon className="h-5 w-5" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-ink-50 leading-tight">
              Tomás Aguiar
            </p>
            <p className="text-[11px] text-ink-400">
              S&amp;C · Lisbon · €55 / h
            </p>
            <div className="mt-1 flex items-center gap-1 text-amber-400 text-[11px]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-current" />
              ))}
              <span className="ml-1 text-ink-200 font-semibold">4.97</span>
            </div>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-ink-300 leading-relaxed">
          Programs around your readiness. Free 15-min intro available
          tomorrow at 07:30.
        </p>
        <div className="mt-3 flex gap-1.5">
          <span className="rounded-md bg-brand-500/15 text-brand-200 px-2 py-1 text-[10px] font-semibold">
            Strength match
          </span>
          <span className="rounded-md bg-accent-500/15 text-accent-300 px-2 py-1 text-[10px] font-semibold">
            AM availability
          </span>
        </div>
      </div>
      <p className="mt-3 text-[10px] text-ink-500">
        Plus 2 more matches in your inbox.
      </p>
    </div>
  );
}
