import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VoltButton } from "./volt-button";

describe("<VoltButton />", () => {
  it("calls onClick", async () => {
    const fn = vi.fn();
    render(<VoltButton onClick={fn}>Go</VoltButton>);
    await userEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("has lime fill by default", () => {
    render(<VoltButton>Go</VoltButton>);
    expect(screen.getByRole("button").className).toMatch(/bg-volt-500/);
  });
});
