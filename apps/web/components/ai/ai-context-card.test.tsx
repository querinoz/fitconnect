import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AIContextCard } from "./ai-context-card";
import { datumFromScore } from "@/lib/telemetry/states";

vi.mock("next/link", () => ({
  default({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  }
}));

describe("AIContextCard", () => {
  it("does not invent readiness when missing", () => {
    render(
      <AIContextCard readiness={datumFromScore("Readiness", null, { source: "insufficient_data" })} />
    );
    expect(screen.getByTestId("ai-context-card")).toBeInTheDocument();
    expect(screen.getByText(/will not invent/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /connect a device/i })).toHaveAttribute(
      "href",
      "/settings/wearables"
    );
  });

  it("does not push connect CTA while loading", () => {
    render(
      <AIContextCard
        readiness={{
          ...datumFromScore("Readiness", null),
          state: "loading",
          detail: "Loading training context…"
        }}
      />
    );
    expect(screen.getByText(/loading training context/i)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /connect a device/i })).not.toBeInTheDocument();
  });
});
