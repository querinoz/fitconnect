import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDemoLiveFeed } from "./use-demo-live-feed";
import { resetDemoFeedSequence } from "./demo-feed";

describe("useDemoLiveFeed", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetDemoFeedSequence();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("seeds initial demo posts when enabled in development", () => {
    const { result } = renderHook(() => useDemoLiveFeed({ enabled: true }));
    expect(result.current.demoMode).toBe(true);
    expect(result.current.posts.length).toBeGreaterThanOrEqual(3);
    expect(result.current.posts[0]?.demo).toBe(true);
  });

  it("appends a new post on interval tick", () => {
    const { result } = renderHook(() =>
      useDemoLiveFeed({ enabled: true, intervalMs: 4000 })
    );
    const initial = result.current.posts.length;

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(result.current.posts.length).toBe(initial + 1);
    expect(result.current.posts[0]?.eventId).toBeTruthy();
  });

  it("pauses and resumes timer", () => {
    const { result } = renderHook(() =>
      useDemoLiveFeed({ enabled: true, intervalMs: 4000 })
    );
    const initial = result.current.posts.length;

    act(() => {
      result.current.pause();
    });

    act(() => {
      vi.advanceTimersByTime(8000);
    });

    expect(result.current.posts.length).toBe(initial);
    expect(result.current.isLive).toBe(false);

    act(() => {
      result.current.resume();
    });

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(result.current.posts.length).toBe(initial + 1);
  });

  it("does not duplicate event IDs", () => {
    const { result } = renderHook(() =>
      useDemoLiveFeed({ enabled: true, intervalMs: 1000, maxPosts: 10 })
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    const ids = result.current.posts.map((p) => p.eventId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
