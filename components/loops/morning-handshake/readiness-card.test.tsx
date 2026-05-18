import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReadinessCard } from "./readiness-card";

describe("<ReadinessCard />", () => {
  const props = {
    percent: 78,
    hrv: 64,
    hrvDelta: +4,
    sleepHours: "7h 22m",
    coachName: "Marina",
    intent: "Z2 base · 45 min"
  };
  it("renders the readiness ring", () => {
    render(<ReadinessCard {...props} />);
    expect(screen.getByText("78")).toBeInTheDocument();
    expect(screen.getByText("Readiness")).toBeInTheDocument();
  });
  it("shows HRV delta with sign", () => {
    render(<ReadinessCard {...props} />);
    expect(screen.getByText(/\+4/)).toBeInTheDocument();
  });
  it("references coach name", () => {
    render(<ReadinessCard {...props} />);
    expect(screen.getByText(/Marina/i)).toBeInTheDocument();
  });
});
