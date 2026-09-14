import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AiInsightsPanel } from "./ai-insights-panel";

describe("AiInsightsPanel", () => {
  it("does not invent HRV or sleep when telemetry is missing", () => {
    render(<AiInsightsPanel />);
    expect(screen.getByText(/never invent/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /connect a device/i })).toHaveAttribute(
      "href",
      "/settings/wearables"
    );
    expect(screen.queryByText(/\+4 ms/i)).not.toBeInTheDocument();
  });

  it("offers accept / keep / why when recovery data is present", async () => {
    const user = userEvent.setup();
    render(
      <AiInsightsPanel
        telemetry={{
          hrvMs: 40,
          baselineHrvMs: 70,
          sleepHours: 4.5,
          strainScore: 90,
          plannedHighIntensity: true
        }}
      />
    );
    expect(screen.getByRole("button", { name: /accept adjustment/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /why/i }));
    expect(screen.getByText(/not a medical diagnosis/i)).toBeInTheDocument();
  });

  it("forwards Accept to the plan callback", async () => {
    const user = userEvent.setup();
    const onAccept = vi.fn();
    render(
      <AiInsightsPanel
        onAccept={onAccept}
        telemetry={{
          hrvMs: 40,
          baselineHrvMs: 70,
          sleepHours: 4.5,
          strainScore: 90,
          plannedHighIntensity: true
        }}
      />
    );
    await user.click(screen.getByRole("button", { name: /accept adjustment/i }));
    expect(onAccept).toHaveBeenCalled();
    expect(screen.getByText(/adjustment accepted/i)).toBeInTheDocument();
  });
});
