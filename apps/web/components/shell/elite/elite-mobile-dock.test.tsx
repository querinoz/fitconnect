import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Home, Trophy, UserRound, Activity } from "lucide-react";
import { EliteMobileDock } from "./elite-mobile-dock";
import type { ShellNavItem } from "@/lib/shell/nav-config";

const items: ShellNavItem[] = [
  { href: "/dashboard", label: "Today", icon: Home },
  { href: "/insights", label: "Analysis", icon: Activity },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/profile", label: "Profile", icon: UserRound }
];

vi.mock("next/link", () => ({
  default({
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

describe("<EliteMobileDock />", () => {
  it("keeps four destinations and adds a Train FAB", () => {
    render(
      <EliteMobileDock
        items={items}
        active="/dashboard"
        trainHref="/sessions"
        trainLabel="Train"
      />
    );
    expect(screen.getByLabelText("Today")).toHaveAttribute("aria-current", "page");
    expect(screen.getByLabelText("Train")).toHaveAttribute("href", "/sessions");
    expect(screen.getAllByRole("link")).toHaveLength(5);
  });

  it("does not add Train when trainHref is omitted", () => {
    render(<EliteMobileDock items={items} active="/profile" />);
    expect(screen.queryByLabelText("Train")).not.toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(4);
  });
});
