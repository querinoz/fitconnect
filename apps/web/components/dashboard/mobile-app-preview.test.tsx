import { fireEvent, screen, waitFor } from "@testing-library/react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppearanceProvider } from "@/lib/theme/appearance-provider";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import { LanguageProvider } from "@/lib/i18n-provider";
import { MobileAppPreview } from "./mobile-app-preview";

function renderPreview() {
  return render(
    <LanguageProvider initialLang="en">
      <AppearanceProvider>
        <ThemeProvider>
          <MobileAppPreview initialRole="athlete" />
        </ThemeProvider>
      </AppearanceProvider>
    </LanguageProvider>
  );
}

describe("<MobileAppPreview />", () => {
  it("navigates between app screens and updates session state", async () => {
    renderPreview();

    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("AI Readiness")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /sessions/i }));
    await waitFor(() =>
      expect(screen.getByText("Lower body strength")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole("button", { name: /start live session/i }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /end session/i })).toBeInTheDocument()
    );
    expect(screen.getAllByText("Live now").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /coach/i }));
    await waitFor(() =>
      expect(screen.getAllByText("Coach Diego").length).toBeGreaterThan(0)
    );

    fireEvent.click(screen.getByRole("button", { name: /inbox/i }));
    await waitFor(() =>
      expect(screen.getByText("Plan update approved")).toBeInTheDocument()
    );
  });
});
