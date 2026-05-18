import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useChannel } from "./use-channel";

class FakeBC {
  static instances: FakeBC[] = [];

  listeners: Array<(e: MessageEvent) => void> = [];

  closed = false;

  constructor(public name: string) {
    FakeBC.instances.push(this);
  }

  postMessage(data: unknown) {
    for (const i of FakeBC.instances) {
      if (i === this || i.name !== this.name || i.closed) continue;
      for (const l of i.listeners) {
        l(new MessageEvent("message", { data }));
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

describe("useChannel", () => {
  beforeEach(() => {
    FakeBC.instances = [];
    (globalThis as { BroadcastChannel: typeof BroadcastChannel }).BroadcastChannel =
      FakeBC as unknown as typeof BroadcastChannel;
  });

  it("delivers messages to all subscribers on the same channel", () => {
    const a = renderHook(() => useChannel("athlete:a1"));
    const b = renderHook(() => useChannel("athlete:a1"));
    act(() => {
      a.result.current.send({
        kind: "nudge",
        athleteId: "a1",
        coachId: "c1",
        variant: "push",
        at: new Date().toISOString()
      });
    });
    expect(b.result.current.messages.at(-1)?.kind).toBe("nudge");
  });

  it("isolates messages across channels", () => {
    const a = renderHook(() => useChannel("athlete:a1"));
    const b = renderHook(() => useChannel("athlete:a2"));
    act(() => {
      a.result.current.send({
        kind: "nudge",
        athleteId: "a1",
        coachId: "c1",
        variant: "push",
        at: new Date().toISOString()
      });
    });
    expect(b.result.current.messages.length).toBe(0);
  });
});
