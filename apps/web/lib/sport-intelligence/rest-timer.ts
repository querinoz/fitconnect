/** Wall-clock rest timer — not a fragile per-second counter alone. */

export type RestTimerState = {
  durationSec: number;
  endsAtMs: number | null;
  pausedRemainingSec: number | null;
};

export function startRest(durationSec: number, nowMs = Date.now()): RestTimerState {
  const d = Math.max(0, Math.floor(durationSec));
  return { durationSec: d, endsAtMs: nowMs + d * 1000, pausedRemainingSec: null };
}

export function remainingSec(state: RestTimerState, nowMs = Date.now()): number {
  if (state.pausedRemainingSec != null) return Math.max(0, state.pausedRemainingSec);
  if (state.endsAtMs == null) return state.durationSec;
  return Math.max(0, Math.ceil((state.endsAtMs - nowMs) / 1000));
}

export function adjustRest(state: RestTimerState, deltaSec: number, nowMs = Date.now()): RestTimerState {
  const rem = remainingSec(state, nowMs) + deltaSec;
  const next = Math.max(0, rem);
  if (state.pausedRemainingSec != null) {
    return { ...state, durationSec: next, pausedRemainingSec: next };
  }
  return { durationSec: next, endsAtMs: nowMs + next * 1000, pausedRemainingSec: null };
}

export function pauseRest(state: RestTimerState, nowMs = Date.now()): RestTimerState {
  return {
    ...state,
    pausedRemainingSec: remainingSec(state, nowMs),
    endsAtMs: null
  };
}

export function resumeRest(state: RestTimerState, nowMs = Date.now()): RestTimerState {
  const rem = state.pausedRemainingSec ?? remainingSec(state, nowMs);
  return { durationSec: rem, endsAtMs: nowMs + rem * 1000, pausedRemainingSec: null };
}

export function skipRest(): RestTimerState {
  return { durationSec: 0, endsAtMs: null, pausedRemainingSec: 0 };
}
