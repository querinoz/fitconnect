import type { LiveTick } from "./types";

type Intent = "z2" | "intervals" | "recovery";

const BAND: Record<Intent, [number, number]> = {
  z2: [120, 160],
  intervals: [140, 185],
  recovery: [95, 125]
};

export function generateTick(opts: {
  athleteId: string;
  elapsedSec: number;
  lastHr: number;
  intent: Intent;
}): LiveTick {
  const [lo, hi] = BAND[opts.intent];
  const target = (lo + hi) / 2;
  const drift = (Math.random() - 0.5) * 6;
  const pull = (target - opts.lastHr) * 0.15;
  const next = Math.round(
    Math.max(lo, Math.min(hi, opts.lastHr + drift + pull))
  );
  return {
    kind: "live-tick",
    athleteId: opts.athleteId,
    hr: next,
    pace: 4.2 + (Math.random() - 0.5) * 0.4,
    cadence: 168 + Math.round((Math.random() - 0.5) * 6),
    elapsedSec: opts.elapsedSec + 1,
    at: new Date().toISOString()
  };
}

export function startTicker(opts: {
  athleteId: string;
  intent: Intent;
  intervalMs?: number;
  sendTick: (t: LiveTick) => void;
}): () => void {
  let elapsedSec = 0;
  let lastHr = (BAND[opts.intent][0] + BAND[opts.intent][1]) / 2;
  const id = setInterval(() => {
    const t = generateTick({
      athleteId: opts.athleteId,
      elapsedSec,
      lastHr,
      intent: opts.intent
    });
    elapsedSec = t.elapsedSec;
    lastHr = t.hr;
    opts.sendTick(t);
  }, opts.intervalMs ?? 1500);
  return () => clearInterval(id);
}
