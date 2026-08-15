import { fireEvent, screen } from "@testing-library/react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppearanceProvider } from "@/lib/theme/appearance-provider";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import { LanguageProvider } from "@/lib/i18n-provider";
import { EliteMobileCockpit } from "./elite-mobile-cockpit";

function renderCockpit() {
  return render(
    <LanguageProvider initialLang="en">
      <AppearanceProvider>
        <ThemeProvider>
          <EliteMobileCockpit />
        </ThemeProvider>
      </AppearanceProvider>
    </LanguageProvider>
  );
}

describe("<EliteMobileCockpit />", () => {
  it("mirrors Android tabs and starts LOCAL_DEMO monitoring", () => {
    renderCockpit();
    expect(screen.getByTestId("elite-mobile-frame")).toBeInTheDocument();
    expect(screen.getAllByText("LOCAL_DEMO").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: /start monitoring/i }));
    expect(screen.getByRole("button", { name: /^pause$/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /community/i }));
    expect(screen.getByText(/no posts in cache/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /iphone 390/i }));
    expect(screen.getByTestId("elite-mobile-frame")).toHaveAttribute("data-frame", "iphone");
  });
});
