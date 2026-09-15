import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "../../app/(marketing)/ios/install/route";

describe("/ios/install redirect", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 404 when TestFlight is not configured", () => {
    vi.stubEnv("IOS_TESTFLIGHT_URL", "");
    vi.stubEnv("IOS_INSTALL_URL", "");
    vi.stubEnv("NEXT_PUBLIC_IOS_INSTALL_URL", "");
    const res = GET();
    expect(res.status).toBe(404);
    expect(res.headers.get("X-Robots-Tag")).toMatch(/noindex/);
    expect(res.headers.get("Location")).toBeNull();
  });

  it("redirects only to an allowlisted TestFlight join URL", () => {
    vi.stubEnv("IOS_TESTFLIGHT_URL", "https://testflight.apple.com/join/Ab12Cd34");
    const res = GET();
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("https://testflight.apple.com/join/Ab12Cd34");
    expect(res.headers.get("Cache-Control")).toMatch(/no-store/);
  });

  it("refuses open redirects", () => {
    vi.stubEnv("IOS_TESTFLIGHT_URL", "https://evil.example/join/Ab12Cd34");
    const res = GET();
    expect(res.status).toBe(404);
    expect(res.headers.get("Location")).toBeNull();
  });
});
