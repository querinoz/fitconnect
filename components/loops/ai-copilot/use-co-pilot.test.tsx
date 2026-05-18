import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act, render } from "@testing-library/react";
import { useEffect } from "react";
import { useDashboardStore } from "@/lib/dashboard-store";
import { useCoPilot } from "./use-co-pilot";

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

function AthleteChannelRecorder({
  athleteId,
  sent
}: {
  athleteId: string;
  sent: unknown[];
}) {
  useEffect(() => {
    const ch = new BroadcastChannel(`athlete:${athleteId}`);
    ch.addEventListener("message", (e: MessageEvent) => {
      sent.push(e.data);
    });
    return () => ch.close();
  }, [athleteId, sent]);
  return null;
}

describe("useCoPilot.approve", () => {
  beforeEach(() => {
    FakeBC.instances = [];
    useDashboardStore.getState().resetDemo();
    (globalThis as { BroadcastChannel: typeof BroadcastChannel }).BroadcastChannel =
      FakeBC as unknown as typeof BroadcastChannel;
  });

  it("sends a plan-update with origin co-pilot to the athlete channel", () => {
    const sent: unknown[] = [];
    render(<AthleteChannelRecorder athleteId="a-ines" sent={sent} />);
    const planId = useDashboardStore.getState().plans.find(
      (p) => p.athleteId === "a-ines"
    )!.id;
    const { result } = renderHook(() => useCoPilot("t-002"));
    act(() => {
      result.current.approve({
        kind: "ai-alert",
        id: "alert-x",
        coachId: "t-002",
        athleteId: "a-ines",
        rule: "hrv-down",
        recommendation: "swap-z2",
        body: "x",
        at: new Date().toISOString()
      });
    });
    expect(
      sent.some(
        (m) =>
          (m as { kind?: string; origin?: string; planId?: string }).kind ===
            "plan-update" &&
          (m as { origin?: string }).origin === "co-pilot" &&
          (m as { planId?: string }).planId === planId
      )
    ).toBe(true);
    expect(
      useDashboardStore.getState().aiAlerts.some((x) => x.id === "alert-x")
    ).toBe(false);
  });
});
