import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLiveSession } from "./use-live-session";

describe("useLiveSession (athlete)", () => {
  it("start opens session, tick mutates state, end closes session", async () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    vi.useFakeTimers();
    const { result } = renderHook(() =>
      useLiveSession({ athleteId: "a-iris", intent: "z2" })
    );
    act(() => {
      result.current.start();
    });
    expect(result.current.isActive).toBe(true);
    act(() => {
      vi.advanceTimersByTime(3500);
    });
    expect(result.current.ticks.length).toBeGreaterThanOrEqual(2);
    act(() => {
      result.current.end();
    });
    expect(result.current.isActive).toBe(false);
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("does not synthesize heart rate when DEMO_MODE is off", () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "false");
    vi.useFakeTimers();
    const { result } = renderHook(() =>
      useLiveSession({ athleteId: "a-iris", intent: "z2" })
    );
    act(() => {
      result.current.start();
    });
    act(() => {
      vi.advanceTimersByTime(3500);
    });
    expect(result.current.ticks).toHaveLength(0);
    expect(result.current.hr).toBeNull();
    act(() => {
      result.current.end();
    });
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });
});
