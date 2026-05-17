import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Pill } from "./pill";

describe("<Pill />", () => {
  it("renders volt by default", () => {
    render(<Pill>Live</Pill>);
    expect(screen.getByText("Live").className).toMatch(/bg-volt-500/);
  });

  it("supports coral variant", () => {
    render(<Pill variant="coral">Hot</Pill>);
    expect(screen.getByText("Hot").className).toMatch(/bg-coral-500/);
  });
});
