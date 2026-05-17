import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemePicker } from "./theme-picker";
import { ThemeProvider } from "@/lib/theme/theme-provider";

describe("<ThemePicker />", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("style");
    document.documentElement.removeAttribute("data-theme");
  });

  it("dock variant renders 5 dots", async () => {
    render(
      <ThemeProvider>
        <ThemePicker variant="dock" />
      </ThemeProvider>
    );
    await waitFor(() => {
      expect(screen.getByRole("group", { name: /Theme picker/i })).toBeInTheDocument();
    });
    expect(screen.getAllByRole("button").length).toBe(5);
  });

  it("clicking a dot changes the theme", async () => {
    render(
      <ThemeProvider>
        <ThemePicker variant="dock" />
      </ThemeProvider>
    );
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe("voltline"));
    await userEvent.click(screen.getByRole("button", { name: /pulse/i }));
    expect(document.documentElement.dataset.theme).toBe("pulse");
  });

  it("settings variant shows label + description", async () => {
    render(
      <ThemeProvider>
        <ThemePicker variant="settings" />
      </ThemeProvider>
    );
    await waitFor(() => {
      expect(screen.getByText("Voltline")).toBeInTheDocument();
    });
    expect(screen.getByText(/electric lime/i)).toBeInTheDocument();
  });
});
