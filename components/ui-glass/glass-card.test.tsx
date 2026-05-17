import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GlassCard } from "./glass-card";

describe("<GlassCard />", () => {
  it("renders children inside a glass surface", () => {
    render(<GlassCard data-testid="g">hello</GlassCard>);
    const el = screen.getByTestId("g");
    expect(el).toHaveTextContent("hello");
    expect(el.className).toMatch(/backdrop-blur-/);
  });

  it("applies the live tone glow", () => {
    render(
      <GlassCard tone="live" data-testid="g">
        x
      </GlassCard>
    );
    expect(screen.getByTestId("g").className).toMatch(/shadow-volt-glow/);
  });
});
