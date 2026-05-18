import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FloatingDock, type DockItem } from "./floating-dock";
import { Home } from "lucide-react";

const items: DockItem[] = [
  { href: "/dashboard", label: "Today", icon: Home },
  { href: "/sessions", label: "Sessions", icon: Home },
  { href: "/coach", label: "Coach", icon: Home },
  { href: "/inbox", label: "Inbox", icon: Home },
  { href: "/profile", label: "Profile", icon: Home }
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

describe("<FloatingDock />", () => {
  it("renders 5 nav items with labels", () => {
    render(<FloatingDock items={items} active="/dashboard" />);
    expect(screen.getAllByRole("link").length).toBe(5);
    expect(screen.getByLabelText("Today")).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("non-active items are not aria-current", () => {
    render(<FloatingDock items={items} active="/dashboard" />);
    expect(screen.getByLabelText("Inbox")).not.toHaveAttribute("aria-current");
  });
});
