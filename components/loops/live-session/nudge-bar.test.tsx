import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NudgeBar } from "./nudge-bar";

describe("<NudgeBar />", () => {
  it("calls onNudge with the variant", async () => {
    const fn = vi.fn();
    render(<NudgeBar onNudge={fn} />);
    await userEvent.click(screen.getByRole("button", { name: /Push/i }));
    expect(fn).toHaveBeenCalledWith("push");
  });
});
