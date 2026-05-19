import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StravaBrandedCard } from "./strava-branded-card";

const baseProps = {
  athleteName: "Inês Carvalho",
  activityName: "Morning Threshold Run",
  sportType: "Run",
  distanceKm: 12.4,
  durationSec: 3720,
  avgHr: 158,
  maxHr: 176,
  elevationM: 214,
  readinessScore: 94,
  coachName: "Tomás Mendes",
  date: "2025-05-19T07:30:00Z"
};

describe("<StravaBrandedCard />", () => {
  it("renders activity hero metrics on dark branded layout", () => {
    render(<StravaBrandedCard {...baseProps} />);

    expect(screen.getByText("Morning Threshold Run")).toBeInTheDocument();
    expect(screen.getByText("12.4")).toBeInTheDocument();
    expect(screen.getByText("94")).toBeInTheDocument();
    expect(screen.getByText(/Coach Tomás/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Morning Threshold Run share card/)).toHaveClass("bg-[#07080b]");
  });

  it("share button copies formatted text when Web Share is unavailable", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true
    });

    render(<StravaBrandedCard {...baseProps} showShare />);
    await user.click(screen.getByRole("button", { name: /share to feed/i }));

    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining("Morning Threshold Run · Run")
    );
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("Readiness 94"));
  });
});
