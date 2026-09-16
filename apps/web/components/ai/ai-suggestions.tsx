"use client";

import { cn } from "@/lib/utils";

export type AiSuggestion = {
  prompt: string;
  label?: string;
};

type AISuggestionsProps = {
  items: AiSuggestion[];
  onSelect: (prompt: string) => void;
  heading?: string;
  className?: string;
};

/**
 * Suggestion chips for FitConnect AI.
 * Pattern reference: 21st AI Chat "Suggestions" — Zenith-native implementation.
 */
export function AISuggestions({ items, onSelect, heading, className }: AISuggestionsProps) {
  if (items.length === 0) return null;
  return (
    <div className={cn("pt-2", className)} data-testid="ai-suggestions">
      {heading ? (
        <p className="mb-2 text-[11px] uppercase tracking-widest text-eos-on-surface-subtle">
          {heading}
        </p>
      ) : null}
      <ul className="space-y-1.5">
        {items.map((c) => (
          <li key={c.prompt}>
            <button
              type="button"
              onClick={() => onSelect(c.prompt)}
              className="w-full rounded-xl border border-eos-outline bg-eos-elevated/60 px-3 py-2 text-left text-sm text-eos-on-surface transition-colors hover:border-eos-voltline/40 hover:bg-eos-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eos-voltline/60"
            >
              {c.label ?? c.prompt}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
