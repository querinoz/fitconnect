import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BentoCard, EliteButton, EliteChip, LabelCaps, MetricDisplay } from "@/components/elite-os";

describe("Elite OS design system", () => {
  it("renders bento card with telemetry label", () => {
    render(
      <BentoCard label="Readiness" elevation="1">
        <MetricDisplay value="82" unit="%" delta="+4 vs 7d" />
      </BentoCard>
    );
    expect(screen.getByText("Readiness")).toBeInTheDocument();
    expect(screen.getByText("82")).toBeInTheDocument();
  });

  it("renders primary elite button", () => {
    render(<EliteButton>Start session</EliteButton>);
    expect(screen.getByRole("button", { name: "Start session" })).toBeInTheDocument();
  });

  it("renders status chip tones", () => {
    render(<EliteChip tone="telemetry" as="span">Live HRV</EliteChip>);
    expect(screen.getByText("Live HRV")).toBeInTheDocument();
  });

  it("renders label caps typography", () => {
    render(<LabelCaps>Telemetry</LabelCaps>);
    expect(screen.getByText("Telemetry")).toHaveClass("eos-label-caps");
  });
});
