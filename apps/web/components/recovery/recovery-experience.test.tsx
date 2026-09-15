import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RecoveryExperience } from "./recovery-experience";

vi.mock("next/link", () => ({
  default({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  }
}));

describe("RecoveryExperience", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ score: null, source: "insufficient_data" }), { status: 200 }))
    );
  });

  it("renders an honest empty recovery surface without fabricated HRV", async () => {
    render(<RecoveryExperience />);
    expect(await screen.findByTestId("recovery-experience")).toBeInTheDocument();
    expect(await screen.findByText(/no recovery telemetry/i)).toBeInTheDocument();
    expect(screen.queryByText(/142 bpm|\d+\s*kcal/i)).not.toBeInTheDocument();
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });
});
