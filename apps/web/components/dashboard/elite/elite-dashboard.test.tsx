import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Users } from "lucide-react";
import { EliteStatTile } from "./elite-stat-tile";

describe("Elite dashboard", () => {
  it("renders stat tile with label and metric", () => {
    render(
      <EliteStatTile
        icon={Users}
        label="Active athletes"
        value="34"
        change="+3"
        tone="performance"
      />
    );
    expect(screen.getByText("Active athletes")).toBeInTheDocument();
    expect(screen.getByText("34")).toBeInTheDocument();
    expect(screen.getByText(/\+3/)).toBeInTheDocument();
  });
});
