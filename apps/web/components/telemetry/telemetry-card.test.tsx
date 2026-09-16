import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TelemetryCard } from "./telemetry-card";
import { datumFromScore } from "@/lib/telemetry/states";

describe("TelemetryCard", () => {
  it("shows dash and connect link when missing", () => {
    render(
      <TelemetryCard
        datum={datumFromScore("Readiness", null, { source: "insufficient_data" })}
        href="/settings/wearables"
        data-testid="tc"
      />
    );
    expect(screen.getByTestId("telemetry-status")).toHaveAttribute("data-state", "missing");
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /connect devices/i })).toHaveAttribute(
      "href",
      "/settings/wearables"
    );
  });

  it("renders metric when ready", () => {
    render(
      <TelemetryCard datum={datumFromScore("Readiness", 72, { source: "profile" })} data-testid="tc" />
    );
    expect(screen.getByTestId("telemetry-status")).toHaveAttribute("data-state", "ready");
    expect(screen.getByTestId("tc-value")).toHaveTextContent("72");
  });
});
