import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IosInstallPage } from "./ios-install-page";
import type { IosInstallPublicConfig, IosQrPath } from "@/lib/ios-install/types";
import { encodeInstallQr, qrModulesToPath } from "@/lib/ios-install/qr";

vi.mock("@/lib/ios-install/track", () => ({
  trackIosInstallEvent: vi.fn()
}));

const baseConfig: IosInstallPublicConfig = {
  configured: false,
  qrTarget: null,
  installPath: "/ios/install",
  installAbsoluteUrl: "https://fitconnect-phi.vercel.app/ios/install",
  testflightAppUrl: "https://apps.apple.com/app/testflight/id899247664",
  version: null,
  build: null,
  betaStatus: null,
  distributionLabel: "TestFlight"
};

const qr: IosQrPath = qrModulesToPath(
  encodeInstallQr("https://fitconnect-phi.vercel.app/ios/install")!
);

describe("IosInstallPage", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
  });

  it("renders the hub heading and unconfigured fallback without a QR", () => {
    render(<IosInstallPage config={baseConfig} qr={null} qrFailed={false} />);
    expect(screen.getByRole("heading", { level: 1, name: /Install FitConnect on iPhone/i })).toBeInTheDocument();
    expect(screen.getByText(/TestFlight link not configured/i)).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /QR code/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /install unavailable/i })).toBeDisabled();
    expect(screen.getByText(/BUILD INFORMATION NOT CONFIGURED/i)).toBeInTheDocument();
    expect(screen.getByText(/iPhone 14 Pro Setup/i)).toBeInTheDocument();
    expect(document.body.innerHTML).not.toMatch(/BEGIN PRIVATE KEY/);
    expect(document.body.innerHTML).not.toMatch(/sk_live/);
    expect(document.body.innerHTML).not.toMatch(/testflight\.apple\.com\/join\//);
  });

  it("renders QR and install CTA when a URL is configured", () => {
    render(
      <IosInstallPage
        config={{ ...baseConfig, configured: true, qrTarget: baseConfig.installAbsoluteUrl }}
        qr={qr}
        qrFailed={false}
      />
    );
    expect(screen.getByRole("img", { name: /QR code to install FitConnect on iPhone/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /install on iphone/i })).toHaveAttribute("href", "/ios/install");
    expect(screen.getByRole("link", { name: /Get TestFlight on the App Store/i })).toHaveAttribute(
      "href",
      "https://apps.apple.com/app/testflight/id899247664"
    );
  });

  it("copies the public install link", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(
      <IosInstallPage
        config={{ ...baseConfig, configured: true, qrTarget: baseConfig.installAbsoluteUrl }}
        qr={qr}
        qrFailed={false}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /copy install link/i }));
    expect(writeText).toHaveBeenCalledWith("https://fitconnect-phi.vercel.app/ios/install");
    expect(await screen.findByRole("button", { name: /copied/i })).toBeInTheDocument();
  });

  it("shows QR generation failure without crashing", () => {
    render(
      <IosInstallPage
        config={{ ...baseConfig, configured: true, qrTarget: baseConfig.installAbsoluteUrl }}
        qr={null}
        qrFailed
      />
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/QR generation failure/i);
  });
});
