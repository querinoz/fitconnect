import { describe, expect, it } from "vitest";
import { readConfiguredTestFlightUrl, readIosInstallPublicConfig } from "./config";
import { encodeInstallQr } from "./qr";

const JOIN = "https://testflight.apple.com/join/Ab12Cd34";

describe("iOS install public config", () => {
  it("hides the TestFlight join code from the public snapshot", () => {
    const cfg = readIosInstallPublicConfig({
      IOS_TESTFLIGHT_URL: JOIN,
      NEXT_PUBLIC_APP_URL: "https://fitconnect-phi.vercel.app"
    });
    expect(cfg.configured).toBe(true);
    expect(cfg.qrTarget).toBe("https://fitconnect-phi.vercel.app/ios/install");
    expect(JSON.stringify(cfg)).not.toContain("Ab12Cd34");
    expect(readConfiguredTestFlightUrl({ IOS_TESTFLIGHT_URL: JOIN })).toBe(JOIN);
  });

  it("is unconfigured when the install URL is missing or unsafe", () => {
    expect(readIosInstallPublicConfig({}).configured).toBe(false);
    expect(
      readIosInstallPublicConfig({
        NEXT_PUBLIC_IOS_INSTALL_URL: "https://evil.example/join/Ab12Cd34"
      }).configured
    ).toBe(false);
    expect(
      readIosInstallPublicConfig({
        IOS_TESTFLIGHT_URL: "http://testflight.apple.com/join/Ab12Cd34"
      }).qrTarget
    ).toBeNull();
  });

  it("omits placeholder version metadata", () => {
    const cfg = readIosInstallPublicConfig({
      IOS_VERSION: "xxxxxxxx",
      IOS_BUILD: " ",
      IOS_BETA_STATUS: "Not configured"
    });
    expect(cfg.version).toBeNull();
    expect(cfg.build).toBeNull();
    expect(cfg.betaStatus).toBeNull();
  });

  it("encodes an https QR and refuses empty or non-https payloads", () => {
    const matrix = encodeInstallQr("https://fitconnect-phi.vercel.app/ios/install");
    expect(matrix?.size).toBeGreaterThan(10);
    expect(encodeInstallQr("")).toBeNull();
    expect(encodeInstallQr("javascript:alert(1)")).toBeNull();
  });
});
