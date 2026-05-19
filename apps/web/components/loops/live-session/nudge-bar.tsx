"use client";

import { ArrowDown, ArrowUp, Sparkles } from "lucide-react";
import type { Nudge } from "@/lib/realtime/types";

export function NudgeBar({
  onNudge
}: {
  onNudge: (v: Nudge["variant"]) => void;
}) {
  const opts: Array<{
    key: Nudge["variant"];
    label: string;
    Icon: typeof ArrowDown;
  }> = [
    { key: "slow-down", label: "Slow down", Icon: ArrowDown },
    { key: "push", label: "Push", Icon: ArrowUp },
    { key: "great-work", label: "Great work", Icon: Sparkles }
  ];
  return (
    <div className="flex gap-2">
      {opts.map(({ key, label, Icon }) => (
        <button
          key={key}
          type="button"
          aria-label={label}
          onClick={() => onNudge(key)}
          className="flex-1 h-12 rounded-full bg-glass-md border border-glass-border hover:bg-glass-volt hover:border-volt-500/40 inline-flex items-center justify-center gap-2 font-semibold"
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
