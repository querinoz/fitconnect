"use client";

import type { Reaction } from "@/lib/realtime/types";

const EMOJIS: Reaction["emoji"][] = ["🔥", "⚡", "💪", "👏", "🚀"];

export function ReactionRow({
  onReact
}: {
  onReact: (e: Reaction["emoji"]) => void;
}) {
  return (
    <div className="flex gap-2">
      {EMOJIS.map((e) => (
        <button
          key={e}
          type="button"
          aria-label={e}
          onClick={() => onReact(e)}
          className="h-12 w-12 rounded-full bg-glass-md border border-glass-border text-xl hover:bg-glass-volt hover:border-volt-500/40 active:scale-95 transition-transform"
        >
          {e}
        </button>
      ))}
    </div>
  );
}
