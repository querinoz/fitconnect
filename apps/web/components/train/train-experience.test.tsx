import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TrainExperience } from "./train-experience";

vi.mock("next/link", () => ({
  default({
    children,
    href
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  }
}));

vi.mock("@/lib/auth-store", () => ({
  useAuthStore: (selector: (s: { user: { id: string } | null }) => unknown) =>
    selector({ user: { id: "athlete" } })
}));

describe("TrainExperience", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo) => {
        const url = String(input);
        if (url.includes("/api/v1/readiness")) {
          return new Response(JSON.stringify({ score: null, source: "insufficient_data" }), {
            status: 200
          });
        }
        if (url.includes("/api/v1/workout-sessions")) {
          return new Response(JSON.stringify({ error: "persistence_not_configured" }), {
            status: 503
          });
        }
        return new Response("{}", { status: 404 });
      })
    );
  });

  it("completes a catalog session without inventing heart rate", async () => {
    const user = userEvent.setup();
    render(<TrainExperience />);

    expect(screen.getByText(/your session is about to begin/i)).toBeInTheDocument();
    expect(screen.getByText(/data unavailable/i)).toBeInTheDocument();
    expect(screen.queryByText(/142 bpm|\d+ kcal/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /restore session/i }));
    expect(screen.getByTestId("train-briefing")).toBeInTheDocument();
    await user.click(screen.getByTestId("train-start"));
    expect(screen.getByTestId("train-live")).toBeInTheDocument();
    expect(screen.queryByText(/heart-rate zone/i)).not.toBeInTheDocument();

    await user.click(screen.getByTestId("train-log-set"));
    const rest = await screen.findByTestId("train-rest").catch(() => null);
    if (rest) {
      await user.click(screen.getByTestId("train-skip-rest"));
    }
    const finish = screen.queryByRole("button", { name: /finish session/i });
    if (finish) await user.click(finish);
    const complete = await screen.findByTestId("train-complete").catch(() => null);
    if (!complete) {
      const stillLive = screen.queryByTestId("train-live");
      if (stillLive) {
        await user.click(screen.getByRole("button", { name: /finish session/i }));
      }
    }
    expect(await screen.findByTestId("train-complete")).toBeInTheDocument();
    expect(screen.getByText("Device")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(/not configured/i);
  });
});
