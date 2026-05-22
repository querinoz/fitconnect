"use client";

import { useInEliteShell } from "@/lib/hooks/use-in-elite-shell";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard"
}));

vi.mock("@/lib/hooks/use-in-elite-shell", () => ({
  useInEliteShell: vi.fn()
}));

vi.mock("@/lib/auth-store", () => ({
  useAuthStore: (selector: (s: { user: null }) => unknown) =>
    selector({ user: null })
}));

vi.mock("@/lib/i18n-provider", () => ({
  useT: () => (ns: string, key: string) => `${ns}.${key}`
}));

vi.mock("@/components/nav", () => ({
  Nav: () => <div data-testid="legacy-nav" />
}));

vi.mock("@/components/footer", () => ({
  Footer: () => <div data-testid="legacy-footer" />
}));

describe("DashboardShell", () => {
  it("skips legacy nav and footer inside EliteAppShell", () => {
    vi.mocked(useInEliteShell).mockReturnValue(true);

    render(
      <DashboardShell>
        <p>Dashboard body</p>
      </DashboardShell>
    );

    expect(screen.getByText("Dashboard body")).toBeInTheDocument();
    expect(screen.queryByTestId("legacy-nav")).not.toBeInTheDocument();
    expect(screen.queryByTestId("legacy-footer")).not.toBeInTheDocument();
  });

  it("renders legacy nav and footer outside EliteAppShell", () => {
    vi.mocked(useInEliteShell).mockReturnValue(false);

    render(
      <DashboardShell>
        <p>Legacy dashboard</p>
      </DashboardShell>
    );

    expect(screen.getByTestId("legacy-nav")).toBeInTheDocument();
    expect(screen.getByTestId("legacy-footer")).toBeInTheDocument();
  });
});
