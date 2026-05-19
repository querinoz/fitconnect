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

  it("does not render theme picker in the header", () => {
    render(
      <ThemeProvider forceThemeId="voltline">
        <TopBar greeting="Hi" name="Inês" avatarUrl="/a.png" />
      </ThemeProvider>
    );
    expect(
      screen.queryByRole("group", { name: /Theme picker/i })
    ).not.toBeInTheDocument();
  });
});
