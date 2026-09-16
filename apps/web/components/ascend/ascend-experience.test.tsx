import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AscendExperience } from "./ascend-experience";

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

describe("AscendExperience", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("does not invent XP when cloud progression is unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo) => {
        const url = String(input);
        if (url.includes("/api/v1/readiness")) {
          return new Response(JSON.stringify({ score: null, source: "insufficient_data" }), {
            status: 200
          });
        }
        return new Response(JSON.stringify({ error: "persistence_not_configured" }), { status: 503 });
      })
    );
    render(<AscendExperience />);
    expect(await screen.findByText(/data unavailable/i)).toBeInTheDocument();
    expect(screen.queryByText(/120 XP/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open train/i })).toHaveAttribute("href", "/train");
    expect(await screen.findByTestId("ascend-readiness")).toHaveAttribute("data-state", "missing");
  });
});
