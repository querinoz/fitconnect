import { describe, expect, it } from "vitest";
import { isAllowedTestFlightUrl, parseAllowedTestFlightUrl } from "./allowlist";

const ok = "https://testflight.apple.com/join/Ab12Cd34";

describe("TestFlight install allowlist", () => {
  it("accepts a canonical https join URL", () => {
    expect(parseAllowedTestFlightUrl(ok)).toBe(ok);
    expect(isAllowedTestFlightUrl(ok)).toBe(true);
  });

  it("rejects missing, blank, and whitespace values", () => {
    expect(parseAllowedTestFlightUrl(undefined)).toBeNull();
    expect(parseAllowedTestFlightUrl("")).toBeNull();
    expect(parseAllowedTestFlightUrl("   ")).toBeNull();
    expect(parseAllowedTestFlightUrl("https://testflight.apple.com/join/Ab12Cd34 extra")).toBeNull();
  });

  it("trims a valid join URL", () => {
    expect(parseAllowedTestFlightUrl("  https://testflight.apple.com/join/Ab12Cd34")).toBe(
      "https://testflight.apple.com/join/Ab12Cd34"
    );
  });

  it("rejects non-https and dangerous schemes", () => {
    expect(parseAllowedTestFlightUrl("http://testflight.apple.com/join/Ab12Cd34")).toBeNull();
    expect(parseAllowedTestFlightUrl("javascript:alert(1)")).toBeNull();
    expect(parseAllowedTestFlightUrl("data:text/html,hi")).toBeNull();
    expect(parseAllowedTestFlightUrl("vbscript:msg")).toBeNull();
  });

  it("rejects localhost, private IPs, and open redirects", () => {
    expect(parseAllowedTestFlightUrl("https://localhost/join/Ab12Cd34")).toBeNull();
    expect(parseAllowedTestFlightUrl("https://127.0.0.1/join/Ab12Cd34")).toBeNull();
    expect(parseAllowedTestFlightUrl("https://10.0.0.8/join/Ab12Cd34")).toBeNull();
    expect(parseAllowedTestFlightUrl("https://192.168.1.2/join/Ab12Cd34")).toBeNull();
    expect(parseAllowedTestFlightUrl("https://172.16.1.2/join/Ab12Cd34")).toBeNull();
    expect(parseAllowedTestFlightUrl("https://testflight.apple.com.evil.example/join/Ab12Cd34")).toBeNull();
  });

  it("rejects query, hash, credentials, and extra paths", () => {
    expect(parseAllowedTestFlightUrl(`${ok}?next=https://evil.test`)).toBeNull();
    expect(parseAllowedTestFlightUrl(`${ok}#token`)).toBeNull();
    expect(parseAllowedTestFlightUrl("https://user:pass@testflight.apple.com/join/Ab12Cd34")).toBeNull();
    expect(parseAllowedTestFlightUrl("https://testflight.apple.com/join/Ab12Cd34/extra")).toBeNull();
    expect(parseAllowedTestFlightUrl("https://testflight.apple.com/join/../join/Ab12Cd34")).toBeNull();
  });

  it("rejects App Store URLs as the FitConnect install target", () => {
    expect(parseAllowedTestFlightUrl("https://apps.apple.com/app/testflight/id899247664")).toBeNull();
  });
});
