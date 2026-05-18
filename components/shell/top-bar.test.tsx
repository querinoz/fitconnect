import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TopBar } from "./top-bar";
import { ThemeProvider } from "@/lib/theme/theme-provider";

vi.mock("next/image", () => ({
  default: (props: { alt: string }) => <img {...props} alt={props.alt ?? ""} />
}));

describe("<TopBar />", () => {
  it("greets the user", () => {
    render(
      <ThemeProvider>
        <TopBar greeting="Good morning" name="Inês" avatarUrl="/a.png" />
      </ThemeProvider>
    );
    expect(screen.getByText("Good morning")).toBeInTheDocument();
    expect(screen.getByText("Inês")).toBeInTheDocument();
  });

  it("renders the dock-variant theme picker", async () => {
    render(
      <ThemeProvider forceThemeId="voltline">
        <TopBar greeting="Hi" name="Inês" avatarUrl="/a.png" />
      </ThemeProvider>
    );
    expect(screen.getByRole("group", { name: /Theme picker/i })).toBeInTheDocument();
  });
});
