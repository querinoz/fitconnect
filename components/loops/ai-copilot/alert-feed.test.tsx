import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import type { AICoPilotAlert } from "@/lib/realtime/types";
import { AlertFeed } from "./alert-feed";

const alerts: AICoPilotAlert[] = [
  {
    kind: "ai-alert",
    id: "1",
    coachId: "c",
    athleteId: "a",
    rule: "hrv-down",
    recommendation: "swap-z2",
    body: "Iris HRV",
    at: new Date().toISOString()
  },
  {
    kind: "ai-alert",
    id: "2",
    coachId: "c",
    athleteId: "b",
    rule: "sleep-low",
    recommendation: "recovery-day",
    body: "João sleep",
    at: new Date().toISOString()
  }
];

describe("<AlertFeed />", () => {
  it("renders one card per alert", () => {
    render(
      <AlertFeed
        alerts={alerts}
        athleteNameFor={(id) => id}
        onApprove={() => {}}
        onOpenAthlete={() => {}}
      />
    );
    expect(screen.getAllByRole("button", { name: /Approve/i }).length).toBe(2);
  });
  it("shows empty state when no alerts", () => {
    render(
      <AlertFeed
        alerts={[]}
        athleteNameFor={() => ""}
        onApprove={() => {}}
        onOpenAthlete={() => {}}
      />
    );
    expect(screen.getByText(/No co-pilot alerts/i)).toBeInTheDocument();
  });
});
