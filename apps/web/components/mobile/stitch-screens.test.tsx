import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StitchTodayScreen } from "./stitch-screens";

vi.mock("@/lib/i18n-provider", () => ({
  useLocale: () => ({
    mobileApp: {
      today: {
        readiness: "AI Readiness",
        trainHard: "Train hard",
        startSession: "Start session",
        returnToLive: "Return to live",
        hrv: "HRV Status",
        streak: "Streak",
        personalBest: "Personal best",
        sleep: "Sleep Performance",
        sleepQuality: "quality",
        load: "Load",
        sevenDay: "7-day",
        weeklyLoad: "Weekly load",
        onTarget: "On target",
        athleteAiSuggest: "AI suggests a lighter block today.",
        basedOnSignals: "Based on HRV and sleep.",
        planApproved: "Plan approved",
        approveUpdate: "Approve update",
        rosterGreen: "Roster green",
        amberAlerts: "amber alerts",
        coachAiFlag: "Coach AI flag"
      }
    }
  })
}));

describe("StitchTodayScreen", () => {
  it("renders stitch native today layout with prime ring and session CTA", () => {
    render(
      <StitchTodayScreen
        readinessScore={82}
        hrvMs={68}
        baselineHrvMs={64}
        streakDays={35}
        sleepHours="7h42"
        sleepEfficiency={92}
        sessionLive={false}
        planApproved={false}
        onStartSession={vi.fn()}
        onApprovePlan={vi.fn()}
      />
    );

    expect(screen.getByText("Peak Readiness")).toBeInTheDocument();
    expect(screen.getByText("82")).toBeInTheDocument();
    expect(screen.getByText("Primed")).toBeInTheDocument();
    expect(screen.getByText("HRV Status")).toBeInTheDocument();
    expect(screen.getByText("Day Strain")).toBeInTheDocument();
    expect(screen.getByText("Sleep Performance")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /start session/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ai coach/i })).toBeInTheDocument();
  });
});
