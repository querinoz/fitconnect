import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReactionRow } from "./reaction-row";

describe("<ReactionRow />", () => {
  it("emits selected emoji", async () => {
    const fn = vi.fn();
    render(<ReactionRow onReact={fn} />);
    await userEvent.click(screen.getByRole("button", { name: "🔥" }));
    expect(fn).toHaveBeenCalledWith("🔥");
  });
  it("renders 5 emoji choices", () => {
    render(<ReactionRow onReact={() => {}} />);
    expect(screen.getAllByRole("button").length).toBe(5);
  });
});
