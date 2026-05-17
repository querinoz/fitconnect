import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useInstallPrompt } from "./use-install-prompt";

describe("useInstallPrompt", () => {
  it("captures the deferred event and exposes prompt()", () => {
    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.canInstall).toBe(false);
    act(() => {
      const ev = new Event("beforeinstallprompt") as Event & {
        prompt?: () => Promise<void>;
        userChoice?: Promise<{ outcome: "accepted" | "dismissed" }>;
      };
      ev.prompt = () => Promise.resolve();
      ev.userChoice = Promise.resolve({ outcome: "dismissed" as const });
      window.dispatchEvent(ev);
    });
    expect(result.current.canInstall).toBe(true);
  });
});
