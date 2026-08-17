import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/lib/i18n-provider";
import { HeroGate, LANDING_BOOT_KEY } from "@/components/landing/hero-gate";

afterEach(() => {
  sessionStorage.clear();
  vi.unstubAllGlobals();
});

describe("HeroGate", () => {
  it("skips when the boot was already shown this session", async () => {
    sessionStorage.setItem(LANDING_BOOT_KEY, "1");
    const onComplete = vi.fn();
    render(
      <LanguageProvider initialLang="en">
        <HeroGate onComplete={onComplete} />
      </LanguageProvider>
    );
    await waitFor(() => expect(onComplete).toHaveBeenCalled());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
