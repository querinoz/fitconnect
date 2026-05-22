import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminShell } from "./admin-shell";

vi.mock("@/components/nav/marketing-nav", () => ({
  MarketingNav: () => <div data-testid="marketing-nav" />
}));

vi.mock("@/components/demo-banner", () => ({
  DemoBanner: () => <div data-testid="demo-banner" />
}));

vi.mock("@/components/admin/admin-nav", () => ({
  AdminNav: () => <nav data-testid="admin-nav">Admin nav</nav>
}));

describe("AdminShell", () => {
  it("renders admin chrome and children", () => {
    render(
      <AdminShell>
        <p>Admin panel</p>
      </AdminShell>
    );

    expect(screen.getByTestId("demo-banner")).toBeInTheDocument();
    expect(screen.getByTestId("marketing-nav")).toBeInTheDocument();
    expect(screen.getByTestId("admin-nav")).toBeInTheDocument();
    expect(screen.getByText("Admin panel")).toBeInTheDocument();
  });
});
