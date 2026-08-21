import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommandPalette } from "./command-palette";
import { LanguageProvider } from "@/lib/i18n-provider";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, back: vi.fn(), forward: vi.fn(), refresh: vi.fn(), replace: vi.fn() })
}));

function wrap(ui: React.ReactNode) {
  return render(<LanguageProvider initialLang="en">{ui}</LanguageProvider>);
}

describe("CommandPalette", () => {
  beforeEach(() => push.mockClear());

  it("filters navigation items by query", async () => {
    const user = userEvent.setup();
    wrap(<CommandPalette role="athlete" open onOpenChange={() => {}} />);
    expect(screen.getByText("Go to dashboard")).toBeInTheDocument();
    expect(screen.getByText("Load dashboards")).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText(/search commands/i), "session");
    expect(screen.getByText("Go to sessions")).toBeInTheDocument();
    expect(screen.queryByText("Go to dashboard")).not.toBeInTheDocument();
  });
});
