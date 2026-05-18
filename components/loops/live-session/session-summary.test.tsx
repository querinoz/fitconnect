import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SessionSummary } from "./session-summary";

describe("<SessionSummary />", () => {
  it("renders all stats", () => {
    render(
      <SessionSummary
        distanceKm={10.5}
        avgHr={142}
        maxHr={172}
        durationSec={3600}
      />
    );
    expect(screen.getByText("10.5")).toBeInTheDocument();
    expect(screen.getByText("142")).toBeInTheDocument();
    expect(screen.getByText("172")).toBeInTheDocument();
    expect(screen.getByText(/60:00/)).toBeInTheDocument();
  });
});
