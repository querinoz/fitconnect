import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { LanguageProvider } from "@/lib/i18n-provider";
import { LandingEcosystemAct } from "@/components/landing/landing-ecosystem-act";
import { LandingOsNav } from "@/components/landing/landing-os-nav";
import { LandingProblemAct } from "@/components/landing/landing-problem-act";
import { PullQuote } from "@/components/landing/pull-quote";
import { HeroEliteOs } from "@/components/marketing/landing-v2/hero-elite-os";
import { AppDemoSection } from "@/components/marketing/landing-v2/app-demo-section";
import { ScrollStory } from "@/components/marketing/landing-v2/scroll-story";

function wrap(ui: ReactElement) {
  return render(<LanguageProvider initialLang="en">{ui}</LanguageProvider>);
}

describe("landing OS narrative", () => {
  it("exposes working nav destinations", () => {
    wrap(<LandingOsNav />);
    expect(screen.getByRole("link", { name: /enter elite os/i })).toHaveAttribute("href", "/signup");
    expect(screen.getByRole("link", { name: /telemetry/i })).toHaveAttribute("href", "#demo");
    expect(screen.getByRole("link", { name: /ecosystem/i })).toHaveAttribute("href", "#ecosystem");
  });

  it("states wearable support honestly", () => {
    wrap(<LandingEcosystemAct />);
    expect(screen.getByText(/watchos/i)).toBeInTheDocument();
    expect(screen.getByText("COMING SOON")).toBeInTheDocument();
    expect(screen.getByText("UNSUPPORTED")).toBeInTheDocument();
    expect(screen.getAllByText(/LOCAL_DEMO/).length).toBeGreaterThan(0);
  });

  it("states the fragmented-fitness problem", () => {
    wrap(<LandingProblemAct />);
    expect(screen.getByRole("heading", { name: /fragmented fitness/i })).toBeInTheDocument();
  });

  it("keeps the hero headline and CTAs visible without GSAP premium", () => {
    wrap(<HeroEliteOs />);
    const heading = screen.getByRole("heading", { name: /elite human performance os/i });
    expect(heading).toBeVisible();
    expect(heading).not.toHaveStyle({ opacity: "0" });
    expect(screen.getByRole("link", { name: /enter elite os/i })).toBeVisible();
    expect(screen.getByRole("link", { name: /explore system/i })).toBeVisible();
    expect(screen.getAllByText(/local demo/i).length).toBeGreaterThan(0);
  });

  it("keeps the pull quote fully readable beside the mark", () => {
    wrap(
      <PullQuote
        text="I had access to data once reserved for Olympic athletes."
        attribution="Inês C. · FitConnect Athlete"
      />
    );
    const quote = screen.getByText(/I had access to data once reserved for Olympic athletes/i);
    expect(quote).toBeVisible();
    expect(quote).not.toHaveStyle({ opacity: "0" });
    expect(quote.className).toMatch(/text-eos-on-surface/);
    expect(quote.closest("blockquote")?.className).toMatch(/grid/);
    expect(screen.getByText(/Inês C/i)).toBeVisible();
  });

  it("places athlete and coach chapters beside 3D phone mockups", () => {
    wrap(<ScrollStory />);
    expect(screen.getByRole("heading", { name: /for athletes/i })).toBeVisible();
    expect(screen.getByRole("heading", { name: /for coaches/i })).toBeVisible();
    expect(screen.getByTestId("landing-phone-athlete")).toBeVisible();
    expect(screen.getByTestId("landing-phone-coach")).toBeVisible();
    expect(screen.getByTestId("landing-phone-together")).toBeVisible();
    expect(screen.getByRole("link", { name: /open athlete os/i })).toHaveAttribute(
      "href",
      "/dashboard?demo=athlete"
    );
    expect(screen.getByRole("link", { name: /open coach os/i })).toHaveAttribute(
      "href",
      "/coach/dashboard?demo=coach"
    );
    expect(screen.getAllByText(/local demo/i).length).toBeGreaterThan(0);
  });

  it("keeps the preview phone and coaches roster inside a two-column frame", () => {
    wrap(<AppDemoSection />);
    expect(screen.getByText(/ines martins/i)).toBeVisible();
    expect(screen.getByText(/diego alvarez/i)).toBeVisible();
    expect(screen.getByTestId("elite-mobile-frame").className).toMatch(/max-w-\[min\(100%,340px\)\]/);
  });
});
