import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ActiveExperienceSwitcher } from "./active-experience-switcher";
import { useAuthStore } from "@/lib/auth-store";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn() })
}));

describe("ActiveExperienceSwitcher", () => {
  beforeEach(() => {
    push.mockReset();
    vi.unstubAllEnvs();
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    useAuthStore.setState({
      user: {
        id: "athlete",
        username: "Athlete",
        name: "Inês M.",
        email: "ines@fitconnect.local",
        role: "athlete",
        athleteId: "a-ines"
      },
      registered: []
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo, init?: RequestInit) => {
        const url = String(input);
        if (url.includes("/api/v1/identity/active-mode") && init?.method === "PUT") {
          return {
            ok: true,
            json: async () => ({
              activeMode: "coach",
              capabilities: ["athlete", "coach"],
              demo: true
            })
          };
        }
        return { ok: false, json: async () => ({}) };
      })
    );
  });

  it("switches athlete → coach without clearing the session", async () => {
    const user = userEvent.setup();
    render(<ActiveExperienceSwitcher />);
    expect(screen.getByTestId("active_experience_switcher")).toBeInTheDocument();
    await user.click(screen.getByTestId("mode_option_coach"));
    await waitFor(() => {
      expect(useAuthStore.getState().user?.role).toBe("coach");
    });
    expect(useAuthStore.getState().user?.id).toBe("athlete");
    expect(push).toHaveBeenCalledWith("/coach/dashboard");
  });
});
