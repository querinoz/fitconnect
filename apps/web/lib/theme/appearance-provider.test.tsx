import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppearanceProvider } from "./appearance-provider";
import { useAppearance } from "./use-appearance";

function Probe() {
  const { colorMode, reduceMotion, highContrast, setReduceMotion, setColorMode } =
    useAppearance();
  return (
    <div>
      <span data-testid="color">{colorMode}</span>
      <span data-testid="motion">{String(reduceMotion)}</span>
      <span data-testid="contrast">{String(highContrast)}</span>
      <button type="button" onClick={() => setReduceMotion(true)}>
        Reduce
      </button>
      <button type="button" onClick={() => setReduceMotion(false)}>
        Full
      </button>
      <button type="button" onClick={() => setColorMode("light")}>
        Light
      </button>
    </div>
  );
}

describe("<AppearanceProvider />", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.dataset.motion = "full";
    document.documentElement.dataset.contrast = "normal";
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
  });

  it("should_default_to_dark_mode_and_full_motion_after_hydrate", async () => {
    render(
      <AppearanceProvider>
        <Probe />
      </AppearanceProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId("color").textContent).toBe("dark");
      expect(screen.getByTestId("motion").textContent).toBe("false");
    });
    expect(document.documentElement.dataset.motion).toBe("full");
  });

  it("should_persist_reduce_motion_to_localStorage_and_dataset", async () => {
    render(
      <AppearanceProvider>
        <Probe />
      </AppearanceProvider>
    );
    await userEvent.click(screen.getByText("Reduce"));
    expect(localStorage.getItem("fitconnect:motion")).toBe("reduced");
    expect(localStorage.getItem("fitconnect.reduceMotion")).toBe("1");
    expect(document.documentElement.dataset.motion).toBe("reduced");
    expect(screen.getByTestId("motion").textContent).toBe("true");
  });

  it("should_restore_full_motion_when_user_disables_reduce_motion", async () => {
    localStorage.setItem("fitconnect:motion", "reduced");
    localStorage.setItem("fitconnect.reduceMotion", "1");
    render(
      <AppearanceProvider>
        <Probe />
      </AppearanceProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId("motion").textContent).toBe("true");
    });
    await userEvent.click(screen.getByText("Full"));
    expect(localStorage.getItem("fitconnect:motion")).toBe("full");
    expect(localStorage.getItem("fitconnect.reduceMotion")).toBe("0");
    expect(document.documentElement.dataset.motion).toBe("full");
  });

  it("should_restore_color_mode_from_localStorage", async () => {
    localStorage.setItem("fitconnect.colorMode", "light");
    render(
      <AppearanceProvider>
        <Probe />
      </AppearanceProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId("color").textContent).toBe("light");
    });
    expect(document.documentElement.dataset.colorMode).toBe("light");
  });
});
