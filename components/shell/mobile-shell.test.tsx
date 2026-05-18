import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MobileShell } from "./mobile-shell";
import { ThemeProvider } from "@/lib/theme/theme-provider";

vi.mock("next/image", () => ({
  default: (props: { alt: string }) => <img {...props} alt={props.alt ?? ""} />
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard"
}));

describe("<MobileShell />", () => {
  it("renders top bar, content, dock", async () => {
    render(
      <ThemeProvider forceThemeId="voltline">
        <MobileShell role="athlete" name="Inês" avatarUrl="/a.png">
          <div data-testid="content">x</div>
        </MobileShell>
      </ThemeProvider>
    );
    expect(screen.getByText("Inês")).toBeInTheDocument();
    expect(screen.getByTestId("content")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByLabelText("Today")).toBeInTheDocument();
    });
  });
});
