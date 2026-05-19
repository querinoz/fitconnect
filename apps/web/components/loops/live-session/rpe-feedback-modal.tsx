"use client";

import { useState } from "react";
import { VoltButton } from "@/components/ui-glass/volt-button";

type RpeFeedbackModalProps = {
  open: boolean;
  sessionTitle: string;
  onSubmit: (rpe: number, notes: string) => void;
  onClose: () => void;
};

export function RpeFeedbackModal({
  open,
  sessionTitle,
  onSubmit,
  onClose
}: RpeFeedbackModalProps) {
  const [rpe, setRpe] = useState(6);
  const [notes, setNotes] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-ink-800 bg-ink-900 p-6 shadow-xl">
        <p className="text-xs font-bold uppercase tracking-wider text-volt-500">Post-workout</p>
        <h2 className="mt-1 font-display text-xl font-bold text-ink-50">How hard was it?</h2>
        <p className="mt-1 text-sm text-ink-400">{sessionTitle}</p>

        <div className="mt-6">
          <label htmlFor="rpe-slider" className="text-sm font-medium text-ink-200">
            RPE (1–10): <span className="text-volt-400">{rpe}</span>
          </label>
          <input
            id="rpe-slider"
            type="range"
            min={1}
            max={10}
            value={rpe}
            onChange={(e) => setRpe(Number(e.target.value))}
            className="mt-2 w-full accent-volt-500"
          />
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes for your coach…"
          className="mt-4 w-full rounded-xl border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-ink-100 placeholder:text-ink-500"
          rows={3}
        />

        <div className="mt-6 flex gap-2">
          <VoltButton variant="subtle" className="flex-1" type="button" onClick={onClose}>
            Skip
          </VoltButton>
          <VoltButton
            className="flex-1"
            type="button"
            onClick={() => {
              onSubmit(rpe, notes);
              onClose();
            }}
          >
            Submit
          </VoltButton>
        </div>
      </div>
    </div>
  );
}
