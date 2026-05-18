import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StreakCard } from "./streak-card";

describe("<StreakCard />", () => {
  it("renders streak count + co-name", () => {
    render(<StreakCard days={47} coName="Marina" />);
    expect(screen.getByText("47")).toBeInTheDocument();
    expect(screen.getByText(/Marina/)).toBeInTheDocument();
  });
});
