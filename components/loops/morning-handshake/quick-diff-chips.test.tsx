import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuickDiffChips } from "./quick-diff-chips";

describe("<QuickDiffChips />", () => {
  it("emits the chosen diff key", async () => {
    const fn = vi.fn();
    render(<QuickDiffChips onPick={fn} />);
    await userEvent.click(screen.getByRole("button", { name: /Lighter day/i }));
    expect(fn).toHaveBeenCalledWith("lighter-day");
  });

  it("renders all 3 chips", () => {
    render(<QuickDiffChips onPick={() => {}} />);
    expect(screen.getAllByRole("button").length).toBe(3);
  });
});
