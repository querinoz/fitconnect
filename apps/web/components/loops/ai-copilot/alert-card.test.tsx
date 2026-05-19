import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AICoPilotAlert } from "@/lib/realtime/types";
import { AlertCard } from "./alert-card";

const alert: AICoPilotAlert = {
  kind: "ai-alert",
  id: "x",
  coachId: "c-marina",
  athleteId: "a-iris",
  rule: "hrv-down",
  recommendation: "swap-z2",
  body: "Iris's HRV is down 18%. Suggest Z2.",
  at: new Date().toISOString()
};

describe("<AlertCard />", () => {
  it("approve calls onApprove with the alert", async () => {
    const fn = vi.fn();
    render(
      <AlertCard
        alert={alert}
        athleteName="Iris"
        onApprove={fn}
        onOpenAthlete={() => {}}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /Approve/i }));
    expect(fn).toHaveBeenCalledWith(alert);
  });
  it("Open athlete calls onOpenAthlete with id", async () => {
    const fn = vi.fn();
    render(
      <AlertCard
        alert={alert}
        athleteName="Iris"
        onApprove={() => {}}
        onOpenAthlete={fn}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /Open athlete/i }));
    expect(fn).toHaveBeenCalledWith("a-iris");
  });
});
