import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CombatDesk } from "./combat-desk";

describe("CombatDesk", () => {
  it("renders empty history instead of invented rounds", async () => {
    render(<CombatDesk />);
    expect(screen.getByTestId("combat-desk")).toBeInTheDocument();
    expect(await screen.findByText(/No combat sessions yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Official scores are never generated/i)).toBeInTheDocument();
  });
});
