import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLiveSession } from "./use-live-session";

describe("useLiveSession (athlete)", () => {
  it("start opens session, tick mutates state, end closes session", async () => {
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
  });
});
