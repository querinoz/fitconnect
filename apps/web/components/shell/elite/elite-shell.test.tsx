import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EliteMobileDock } from "./elite-mobile-dock";
import { EliteSideRail } from "./elite-side-rail";
import { Home, Inbox } from "lucide-react";
import { useShellStore } from "@/lib/shell/shell-store";

const items = [
  { href: "/dashboard", label: "Today", icon: Home },
  { href: "/inbox", label: "Inbox", icon: Inbox }
];

vi.mock("next/link", () => ({
  default ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
  } & Record<string, unknown>) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  }
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard"
}));

vi.mock("@/components/brand/brand-lockup", () => ({
  BrandLockup: ({ href }: { href?: string }) => <a href={href}>FitConnect</a>
}));

vi.mock("@/components/brand/brand-logo", () => ({
  BrandLogo: () => <span data-testid="brand-logo">Logo</span>
}));

describe("Elite OS app shell", () => {
  it("renders mobile dock with active state", () => {
    render(<EliteMobileDock items={items} active="/dashboard" activeLabel="Today" />);
    expect(screen.getByLabelText("Today")).toHaveAttribute("aria-current", "page");
    expect(screen.getAllByText("Today").length).toBeGreaterThan(0);
  });

  it("renders side rail navigation links", () => {
    render(<EliteSideRail items={items} roleHome="/dashboard" />);
    expect(screen.getAllByRole("link").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Today")).toBeInTheDocument();
  });

  it("closes mobile nav overlay on backdrop click", async () => {
    useShellStore.setState({ mobileNavOpen: true });
    const user = userEvent.setup();
    render(<EliteSideRail items={items} roleHome="/dashboard" />);

    await user.click(screen.getByLabelText("Close navigation overlay"));
    expect(useShellStore.getState().mobileNavOpen).toBe(false);
  });
});
