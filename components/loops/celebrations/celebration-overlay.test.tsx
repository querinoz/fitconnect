import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { CelebrationOverlay } from "./celebration-overlay";

describe("<CelebrationOverlay />", () => {
  it("auto-dismisses after the timeout", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    render(<CelebrationOverlay title="New PR" value="12 km" onClose={fn} />);
    expect(screen.getByText("12 km")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(2200);
    });
    expect(fn).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
