import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RosterHeatmap } from "./roster-heatmap";

const athletes = [
  { id: "a1", name: "Iris", readiness: 82, hrvDelta: +4 },
  { id: "a2", name: "João", readiness: 58, hrvDelta: -2 },
  { id: "a3", name: "Sofia", readiness: 28, hrvDelta: -10 }
];

describe("<RosterHeatmap />", () => {
  it("renders one tile per athlete", () => {
    render(<RosterHeatmap athletes={athletes} onSelect={() => {}} />);
    expect(screen.getAllByRole("button").length).toBe(3);
  });
  it("calls onSelect with the id", async () => {
    const fn = vi.fn();
    render(<RosterHeatmap athletes={athletes} onSelect={fn} />);
    await userEvent.click(screen.getByRole("button", { name: /Iris/ }));
    expect(fn).toHaveBeenCalledWith("a1");
  });
  it("shows red tile for low readiness", () => {
    render(<RosterHeatmap athletes={athletes} onSelect={() => {}} />);
    const sofia = screen.getByRole("button", { name: /Sofia/ });
    expect(sofia.className).toMatch(/bg-coral-500/);
  });
});
