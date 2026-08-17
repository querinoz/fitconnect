import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LanguageProvider } from "@/lib/i18n-provider";
import { SportsHub } from "./sports-hub";

describe("<SportsHub />", () => {
  it("renders readable sport tiles in a wrapping grid, not overlapping camelCase ids", () => {
    render(
      <LanguageProvider initialLang="en">
        <SportsHub />
      </LanguageProvider>
    );
    expect(screen.getByRole("heading", { name: /every sport/i })).toBeVisible();
    expect(screen.getByText("LOCAL_DEMO")).toBeVisible();
    expect(screen.getByText("MTB")).toBeVisible();
    expect(screen.getByText("E-MTB")).toBeVisible();
    expect(screen.getByText("E-Bike")).toBeVisible();
    expect(screen.getByText("SYS.MTB")).toBeVisible();
    expect(screen.queryByText("MountainBikeRide")).not.toBeInTheDocument();
    const card = screen.getAllByTestId("sports-hub-card")[0];
    expect(card?.className).toMatch(/min-w-0/);
    expect(card?.parentElement?.className).toMatch(/grid/);
  });
});
