import { describe, it, expect, vi } from "vitest";
import { startTicker, generateTick } from "./synthetic";

describe("synthetic ticker", () => {
  it("generateTick increases elapsed and stays in band", () => {
    const t = generateTick({
      athleteId: "a1",
      elapsedSec: 100,
      lastHr: 140,
      intent: "z2"
    });
    expect(t.elapsedSec).toBe(101);
    expect(t.hr).toBeGreaterThanOrEqual(120);
    expect(t.hr).toBeLessThanOrEqual(160);
  });

  it("startTicker emits and stops", async () => {
    vi.useFakeTimers();
    const sent: unknown[] = [];
    const stop = startTicker({
      athleteId: "a1",
      intent: "z2",
      sendTick: (t) => sent.push(t),
      intervalMs: 100
    });
    vi.advanceTimersByTime(550);
    expect(sent.length).toBeGreaterThanOrEqual(5);
    stop();
    vi.advanceTimersByTime(500);
    const after = sent.length;
    vi.advanceTimersByTime(500);
    expect(sent.length).toBe(after);
    vi.useRealTimers();
  });
});
