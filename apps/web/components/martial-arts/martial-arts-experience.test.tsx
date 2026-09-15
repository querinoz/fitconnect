import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MartialArtsExperience } from "./martial-arts-experience";

describe("MartialArtsExperience", () => {
  it("lets an athlete identify boxing, capoeira, and judo as distinct disciplines", async () => {
    const user = userEvent.setup();
    render(<MartialArtsExperience />);
    expect(screen.getByTestId("martial-arts-os")).toBeInTheDocument();
    expect(screen.getByTestId("fight-mode-cta")).toHaveAttribute("href", "/train?sport=martial_arts");
    expect(screen.getByRole("button", { name: "Boxing" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Capoeira" }));
    expect(screen.getByText(/UNESCO ICH 00892/i)).toBeInTheDocument();
    expect(screen.getAllByText(/roda is community ritual/i).length).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: "Judo" }));
    expect(screen.getAllByText(/Ippon/i).length).toBeGreaterThan(0);
  });
});
