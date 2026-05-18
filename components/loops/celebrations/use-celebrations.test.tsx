import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCelebrations } from "./use-celebrations";

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

  addEventListener(_type: string, l: (e: MessageEvent) => void): void {
    if (_type !== "message") return;
    this.listeners.push(l);
  }

  removeEventListener(): void {}

  close(): void {
    this.closed = true;
  }
}

describe("useCelebrations", () => {
  beforeEach(() => {
    FakeBC.instances = [];
    (globalThis as { BroadcastChannel: typeof BroadcastChannel }).BroadcastChannel =
      FakeBC as unknown as typeof BroadcastChannel;
  });

  it("publishAchievement reaches listeners on athlete channel", () => {
    const author = renderHook(() => useCelebrations("a-iris"));
    const watcher = renderHook(() => useCelebrations("a-iris"));
    act(() => {
      author.result.current.publishAchievement({
        title: "New PR · Distance",
        metric: "distanceKm",
        value: 12
      });
    });
    expect(watcher.result.current.lastAchievement?.metric).toBe("distanceKm");
  });
});
