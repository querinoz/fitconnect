import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MobileShell } from "./mobile-shell";
import { ThemeProvider } from "@/lib/theme/theme-provider";

vi.mock("next/image", () => ({
  default: ({ alt, priority: _p, ...props }: { alt: string; priority?: boolean }) => (
    <img {...props} alt={alt ?? ""} />
  )
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/feed"
}));

describe("<MobileShell />", () => {
  it("renders elite header, content, dock", async () => {
    render(
      <ThemeProvider forceThemeId="voltline">
        <MobileShell role="athlete" name="Inês" avatarUrl="/a.png">
          <div data-testid="content">x</div>
        </MobileShell>
      </ThemeProvider>
    );
    expect(screen.getByLabelText("FitConnect — home feed")).toBeInTheDocument();
    expect(screen.getByLabelText("Open settings")).toBeInTheDocument();
    expect(screen.getByTestId("content")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByLabelText("Home")).toBeInTheDocument();
    });
  });
});
