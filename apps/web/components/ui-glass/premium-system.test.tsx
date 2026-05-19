import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  AIInsight,
  ChartShell,
  MetricTile,
  PremiumCard,
  RealtimeBadge,
  SectionHeader
} from "./premium-system";

describe("premium ui-glass system", () => {
  it("renders premium card, metric, badge, chart shell and insight blocks", () => {
    render(
      <PremiumCard data-testid="card">
        <SectionHeader eyebrow="Live OS" title="Athlete intelligence" />
        <MetricTile label="Readiness" value="82" delta="+4" />
        <RealtimeBadge>Live sync</RealtimeBadge>
        <ChartShell title="Training load">
          <div>chart content</div>
        </ChartShell>
        <AIInsight title="AI recommendation" body="Move threshold to Thursday." />
      </PremiumCard>
    );

    expect(screen.getByText("Athlete intelligence")).toBeInTheDocument();
    expect(screen.getByText("82")).toBeInTheDocument();
    expect(screen.getByText("Live sync")).toBeInTheDocument();
    expect(screen.getByText("Training load")).toBeInTheDocument();
    expect(screen.getByText("Move threshold to Thursday.")).toBeInTheDocument();
    expect(screen.getByTestId("card").className).toContain("backdrop-blur");
  });
});
