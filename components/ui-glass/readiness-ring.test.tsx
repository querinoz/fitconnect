import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReadinessRing } from "./readiness-ring";

describe("<ReadinessRing />", () => {
  it("renders the percentage label", () => {
    render(<ReadinessRing percent={82} label="Readiness" />);
    expect(screen.getByText("82")).toBeInTheDocument();
    expect(screen.getByText("Readiness")).toBeInTheDocument();
  });

  it("clamps percent into 0..100", () => {
    render(<ReadinessRing percent={140} label="x" />);
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("marks low readiness with coral track", () => {
    render(<ReadinessRing percent={30} label="x" data-testid="r" />);
    expect(screen.getByTestId("r").getAttribute("data-track")).toBe("coral");
  });
});
