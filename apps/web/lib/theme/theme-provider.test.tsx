import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "./theme-provider";
import { useTheme } from "./use-theme";

function Probe() {
  const { theme, setTheme, matchCoach, setMatchCoach } = useTheme();
  return (
    <div>
      <span data-testid="t">{theme}</span>
      <span data-testid="m">{String(matchCoach)}</span>
      <button type="button" onClick={() => setTheme("pulse")}>
        Pulse
      </button>
      <button type="button" onClick={() => setMatchCoach(true)}>
        Match
      </button>
    </div>
  );
}

describe("<ThemeProvider />", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("style");
    document.documentElement.removeAttribute("data-theme");
  });

  it("defaults to voltline after hydrate", async () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId("t").textContent).toBe("voltline");
    });
  });

  it("setTheme persists to localStorage", async () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    );
    await waitFor(() => expect(screen.getByTestId("t").textContent).toBe("voltline"));
    await userEvent.click(screen.getByText("Pulse"));
    expect(localStorage.getItem("fitconnect.theme")).toBe("pulse");
    expect(document.documentElement.dataset.theme).toBe("pulse");
  });

  it("matchCoach persists to localStorage", async () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    );
    await waitFor(() => expect(screen.getByTestId("t").textContent).toBe("voltline"));
    await userEvent.click(screen.getByText("Match"));
    expect(localStorage.getItem("fitconnect.theme.matchCoach")).toBe("1");
  });

  it("uses coachTheme when matchCoach is true", async () => {
    render(
      <ThemeProvider coachTheme="solar" forceMatchCoach forceThemeId="voltline">
        <Probe />
      </ThemeProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId("t").textContent).toBe("solar");
    });
  });
});
