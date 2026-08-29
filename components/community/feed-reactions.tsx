"use client";

import { motion } from "framer-motion";
import { FITCONNECT_REACTIONS, type FitConnectReactionEmoji } from "@/lib/demo/feed-reactions";
import { cn } from "@/lib/utils";

type FeedReactionsProps = {
  counts: Record<string, number>;
  userReaction?: FitConnectReactionEmoji | null;
  onReact?: (emoji: FitConnectReactionEmoji) => void;
  compact?: boolean;
};

export function FeedReactions({
  counts,
  userReaction,
  onReact,
  compact = false
}: FeedReactionsProps) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className={cn("flex items-center gap-2", compact && "flex-wrap")}>
      {total > 0 && (
        <span className="text-[11px] font-mono text-ink-400 tabular-nums mr-1">
          {total}
        </span>
      )}
      {FITCONNECT_REACTIONS.map(({ emoji, label }) => {
        const count = counts[emoji] ?? 0;
        const active = userReaction === emoji;
        return (
          <motion.button
            key={emoji}
            type="button"
            aria-label={label}
            aria-pressed={active}
            whileTap={{ scale: 0.92 }}
            onClick={() => onReact?.(emoji)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-sm transition-colors",
              active
                ? "border-volt-500/50 bg-glass-volt text-volt-300"
                : "border-glass-border bg-glass-lo text-ink-300 hover:bg-glass-md hover:border-glass-edge/40"
            )}
          >
            <span aria-hidden>{emoji}</span>
            {count > 0 && (
              <span className="text-[10px] font-mono tabular-nums text-ink-400">
                {count}
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
