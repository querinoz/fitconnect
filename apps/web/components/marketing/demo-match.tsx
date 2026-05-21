"use client";

import { Sparkles, Star } from "lucide-react";
import { TargetIcon } from "@/components/brand/icons";
import { cn } from "@/lib/utils";
import { formatMsg, useLocale } from "@/lib/i18n-provider";

export function DemoMatch({ className }: { className?: string }) {
  const w = useLocale().demoWidgets.match;

  return (
    <div
      className={cn(
        "rounded-3xl border border-ink-800 bg-ink-950/70 p-6 relative overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-widest text-plasma-300 font-bold">
          {w.header}
        </p>
        <p className="text-[10px] text-ink-500">{w.subheader}</p>
      </div>

      <div className="mt-3 h-1.5 w-full rounded-full bg-ink-800 overflow-hidden">
        <div className="fc-step-cycle h-full w-1/4 rounded-full bg-gradient-to-r from-volt-500 to-volt-400 origin-left" />
      </div>

      <div className="mt-5 overflow-hidden">
        <div className="flex w-[400%] fc-step-cycle">
          <Step
            stepLabel={formatMsg(w.stepOf, { n: 1 })}
            question={w.q1}
            options={[
              { label: w.optYoga, emoji: "🧘", chosen: false },
              { label: w.optStrength, emoji: "🏋️", chosen: true },
              { label: w.optSurf, emoji: "🏄", chosen: false }
            ]}
            pickedLabel={w.picked}
          />
          <Step
            stepLabel={formatMsg(w.stepOf, { n: 2 })}
            question={w.q2}
            options={[
              { label: w.optBuildStrength, emoji: "💪", chosen: true },
              { label: w.optLoseWeight, emoji: "⚖️", chosen: false },
              { label: w.optTrainEvent, emoji: "🏆", chosen: false }
            ]}
            pickedLabel={w.picked}
          />
          <Step
            stepLabel={formatMsg(w.stepOf, { n: 3 })}
            question={w.q3}
            options={[
              { label: w.optWeekdayAm, emoji: "🌅", chosen: true },
              { label: w.optWeekdayPm, emoji: "🌃", chosen: false },
              { label: w.optWeekends, emoji: "📅", chosen: false }
            ]}
            pickedLabel={w.picked}
          />
          <Result w={w} />
        </div>
      </div>
    </div>
  );
}

function Step({
  stepLabel,
  question,
  options,
  pickedLabel
}: {
  stepLabel: string;
  question: string;
  options: { label: string; emoji: string; chosen: boolean }[];
  pickedLabel: string;
}) {
  return (
    <div className="w-1/4 shrink-0 pr-4">
      <p className="text-[10px] uppercase tracking-widest text-ink-500">{stepLabel}</p>
      <h4 className="mt-1 font-display text-lg font-bold text-ink-50">{question}</h4>
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
                {pickedLabel}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Result({ w }: { w: ReturnType<typeof useLocale>["demoWidgets"]["match"] }) {
  return (
    <div className="w-1/4 shrink-0 pr-4">
      <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-accent-400 font-bold">
        <Sparkles className="h-3 w-3" /> {w.foundMatch}
      </div>
      <div className="mt-3 rounded-2xl border border-ink-800 bg-gradient-to-br from-brand-500/10 via-ink-950 to-accent-500/10 p-4">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-volt-500 to-volt-400 text-ink-950 ring-2 ring-brand-400/40">
            <TargetIcon className="h-5 w-5" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-ink-50 leading-tight">{w.coachName}</p>
            <p className="text-[11px] text-ink-400">{w.coachMeta}</p>
            <div className="mt-1 flex items-center gap-1 text-amber-400 text-[11px]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-current" />
              ))}
              <span className="ml-1 text-ink-200 font-semibold">4.97</span>
            </div>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-ink-300 leading-relaxed">{w.coachBio}</p>
        <div className="mt-3 flex gap-1.5">
          <span className="rounded-md bg-brand-500/15 text-brand-200 px-2 py-1 text-[10px] font-semibold">
            {w.tagStrength}
          </span>
          <span className="rounded-md bg-accent-500/15 text-accent-300 px-2 py-1 text-[10px] font-semibold">
            {w.tagAm}
          </span>
        </div>
      </div>
      <p className="mt-3 text-[10px] text-ink-500">{w.moreMatches}</p>
    </div>
  );
}
