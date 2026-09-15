import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StitchSessionsScreen } from "./stitch-screens";

vi.mock("@/lib/i18n-provider", () => ({
  useLocale: () => ({
    mobileApp: {
      sessions: {
        title: "Sessions",
        liveNow: "Live now",
        nextUp: "Next up",
        workoutTitle: "Lower body strength",
        workoutMeta: "45 min",
        hr: "HR",
        pace: "Pace",
        load: "Load",
        chartTitle: "Live strain curve",
        chartSubtitle: "HR",
        endSession: "End session",
        startLive: "Start live session",
        emptyTitle: "No workout queued",
        emptyBody: "Guided TRAIN runs on the Android app.",
        startTrain: "Open TRAIN",
        connectDevice: "Connect a device",
        findCoach: "Find a coach",
        waitingTelemetry: "Waiting for device"
      }
    }
  })
}));

describe("StitchSessionsScreen", () => {
  it("does not invent a queued workout or live HR on the product surface", () => {
    render(
      <StitchSessionsScreen
        sessionLive={false}
        empty
        onStart={() => undefined}
        onEnd={() => undefined}
      />
    );
    expect(screen.getByText("No workout queued")).toBeInTheDocument();
    expect(screen.queryByText("Lower body strength")).not.toBeInTheDocument();
    expect(screen.queryByText("142")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open train/i })).toHaveAttribute("href", "/train");
    expect(screen.getByRole("link", { name: /connect a device/i })).toHaveAttribute(
      "href",
      "/settings/wearables"
    );
  });
});
