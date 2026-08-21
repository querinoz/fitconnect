import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InsightsWorkspace } from "./insights-workspace";
import { LanguageProvider } from "@/lib/i18n-provider";
import * as demo from "@/lib/dashboard/insights-demo";

vi.mock("@/lib/dashboard/insights-demo", async () => {
  const actual = await vi.importActual<typeof import("@/lib/dashboard/insights-demo")>(
    "@/lib/dashboard/insights-demo"
  );
  return { ...actual, downloadCsv: vi.fn() };
});

function wrap() {
  window.localStorage.setItem("fitconnect.lang", "en");
  return render(
    <LanguageProvider initialLang="en">
      <InsightsWorkspace />
    </LanguageProvider>
  );
}

describe("InsightsWorkspace", () => {
  it("renders LOCAL_DEMO load summary and session banner", () => {
    wrap();
    expect(screen.getByText(/chronic load rises from 42 to 56/i)).toBeInTheDocument();
    expect(screen.getByText("Session running on the watch")).toBeInTheDocument();
    expect(screen.getByText("WATCH")).toBeInTheDocument();
    expect(screen.getByText("LOCAL_DEMO")).toBeInTheDocument();
  });

  it("transfers ownership to the browser without a second START", async () => {
    const user = userEvent.setup();
    wrap();
    await user.click(screen.getByRole("button", { name: /transfer to this browser/i }));
    expect(screen.getByText("You own this session in this browser")).toBeInTheDocument();
    expect(screen.getByText("WEB")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /transfer to this browser/i })).not.toBeInTheDocument();
  });

  it("shows empty QA copy instead of zeroed physiology", async () => {
    const user = userEvent.setup();
    wrap();
    await user.click(screen.getByRole("button", { name: "Empty" }));
    expect(screen.getByText(/42 days of sessions with TSS/i)).toBeInTheDocument();
    expect(screen.queryByText(/chronic load rises/i)).not.toBeInTheDocument();
  });

  it("exports a real CSV from visible history rows", async () => {
    const user = userEvent.setup();
    wrap();
    await user.click(screen.getByRole("button", { name: "History" }));
    await user.click(screen.getByRole("button", { name: /export csv/i }));
    expect(demo.downloadCsv).toHaveBeenCalled();
    const [, csv] = vi.mocked(demo.downloadCsv).mock.calls[0]!;
    expect(csv.startsWith("date,sport,duration,origin,tss")).toBe(true);
    expect(csv).toContain("WATCH");
  });
});
