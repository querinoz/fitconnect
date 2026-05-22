import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { EliteAppPage, EliteAppPageHeader } from "./elite-app-page";

describe("EliteAppPage", () => {
  it("renders header and children", () => {
    render(
      <EliteAppPage eyebrow="Recovery" title="Wearables" subtitle="Connect devices">
        <p>Panel body</p>
      </EliteAppPage>
    );

    expect(screen.getByText("Recovery")).toBeInTheDocument();
    expect(screen.getByText("Wearables")).toBeInTheDocument();
    expect(screen.getByText("Connect devices")).toBeInTheDocument();
    expect(screen.getByText("Panel body")).toBeInTheDocument();
  });

  it("renders standalone header with action slot", () => {
    render(
      <EliteAppPageHeader
        eyebrow="Coach OS"
        title="Roster"
        action={<span>Live</span>}
      />
    );

    expect(screen.getByText("Coach OS")).toBeInTheDocument();
    expect(screen.getByText("Roster")).toBeInTheDocument();
    expect(screen.getByText("Live")).toBeInTheDocument();
  });
});
