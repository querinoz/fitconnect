import { describe, it, expect, beforeEach } from "vitest";
import {
  BroadcastChannelTransport,
  resetBroadcastTransportForTests
} from "./broadcast-transport";

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

describe("BroadcastChannelTransport", () => {
  beforeEach(() => {
    FakeBC.instances = [];
    resetBroadcastTransportForTests();
    (globalThis as { BroadcastChannel: typeof BroadcastChannel }).BroadcastChannel =
      FakeBC as unknown as typeof BroadcastChannel;
  });

  it("delivers messages between subscribers on the same channel", () => {
    const transport = new BroadcastChannelTransport();
    const received: string[] = [];
    transport.subscribe("athlete:a1", (m) => {
      if (m.kind === "nudge") received.push(m.variant);
    });
    transport.publish("athlete:a1", {
      kind: "nudge",
      athleteId: "a1",
      coachId: "c1",
      variant: "push",
      at: new Date().toISOString()
    });
    expect(received).toEqual(["push"]);
  });

  it("isolates channels", () => {
    const transport = new BroadcastChannelTransport();
    const a: string[] = [];
    const b: string[] = [];
    transport.subscribe("athlete:a1", () => a.push("x"));
    transport.subscribe("athlete:a2", () => b.push("x"));
    transport.publish("athlete:a1", {
      kind: "nudge",
      athleteId: "a1",
      coachId: "c1",
      variant: "push",
      at: new Date().toISOString()
    });
    expect(a.length).toBe(1);
    expect(b.length).toBe(0);
  });
});
