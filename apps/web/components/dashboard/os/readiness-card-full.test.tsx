import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  READINESS_GAUGE,
  ReadinessCardFull,
  readinessArcPath,
  readinessTrackPath
} from "./readiness-card-full";

describe("readiness gauge geometry", () => {
  it("keeps the track as a semicircle inside the viewBox", () => {
    const d = readinessTrackPath();
    expect(d).toContain(`M${READINESS_GAUGE.cx - READINESS_GAUGE.r},${READINESS_GAUGE.cy}`);
    expect(d).toContain(`${READINESS_GAUGE.cx + READINESS_GAUGE.r},${READINESS_GAUGE.cy}`);
  });

  it("ends the 100 score at the right cap and 50 near the apex", () => {
    const full = readinessArcPath(100);
    const half = readinessArcPath(50);
    expect(full).toContain(` ${READINESS_GAUGE.cx + READINESS_GAUGE.r},${READINESS_GAUGE.cy}`);
    expect(half).toContain(` ${READINESS_GAUGE.cx},`);
  });
});

describe("<ReadinessCardFull />", () => {
  it("places the score inside the gauge and keeps How it works in document flow", () => {
    render(
      <ReadinessCardFull
        readiness={85}
        hrv={71}
        baselineHrv={68}
        sleepHours="7.5h"
        headerAction={<button type="button">How it works</button>}
      />
    );
    const gauge = screen.getByTestId("readiness-gauge");
    const score = screen.getByTestId("readiness-score");
    expect(gauge).toContainElement(score);
    expect(score).toHaveTextContent("85");
    expect(score.className).toMatch(/tabular-nums/);
    expect(screen.getByRole("button", { name: /how it works/i }).className).not.toMatch(
      /absolute/
    );
    expect(screen.getByText(/intense training recommended/i)).toBeInTheDocument();
  });
});
