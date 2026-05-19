import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LiveMetrics } from "./live-metrics";

describe("<LiveMetrics />", () => {
  it("renders current HR and elapsed", () => {
    render(
      <LiveMetrics
        hr={142}
        pace={4.6}
        cadence={170}
        elapsedSec={1234}
        ticks={[140, 141, 142]}
      />
    );
    expect(screen.getByText("142")).toBeInTheDocument();
    expect(screen.getByText(/20:34/)).toBeInTheDocument();
  });
  it("renders pace with 1 decimal", () => {
    render(
      <LiveMetrics hr={140} pace={4.563} cadence={170} elapsedSec={0} ticks={[140]} />
    );
    expect(screen.getByText("4.6")).toBeInTheDocument();
  });
});
