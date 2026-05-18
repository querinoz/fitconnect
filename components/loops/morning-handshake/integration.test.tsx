import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCoachBroadcaster } from "./use-coach-broadcaster";
import { useAthleteListener } from "./use-athlete-listener";

class FakeBC {
  static instances: FakeBC[] = [];

  listeners: Array<(e: MessageEvent) => void> = [];

  closed = false;

  constructor(public name: string) {
    FakeBC.instances.push(this);
  }

  postMessage(d: unknown) {
    for (const i of FakeBC.instances) {
      if (i === this || i.name !== this.name || i.closed) continue;
      for (const l of i.listeners) {
        l(new MessageEvent("message", { data: d }));
      }
    }
  }

  addEventListener(type: string, l: (e: MessageEvent) => void): void {
    if (type !== "message") return;
    this.listeners.push(l);
  }

  removeEventListener(): void {}

  close(): void {
    this.closed = true;
  }
}

describe("morning handshake integration", () => {
  beforeEach(() => {
    FakeBC.instances = [];
    (globalThis as { BroadcastChannel: typeof BroadcastChannel }).BroadcastChannel =
      FakeBC as unknown as typeof BroadcastChannel;
  });

  it("athlete sees the diff coach published", () => {
    const coach = renderHook(() => useCoachBroadcaster("c-marina"));
    const athlete = renderHook(() => useAthleteListener("a-iris"));
    act(() => {
      coach.result.current.publishDiff({
        planId: "p-1",
        athleteId: "a-iris",
        diff: "lighter-day"
      });
    });
    expect(athlete.result.current.pendingDiff?.diff).toBe("lighter-day");
  });
});
