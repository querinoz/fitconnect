import { test, expect } from "@playwright/test";

test.describe("iOS installation hub", () => {
  test("/ios renders heading, CTA, and setup without claiming a fake TestFlight", async ({
    page
  }) => {
    await page.goto("/ios");
    await expect(page).toHaveTitle(/FitConnect™ for iPhone/i);
    await expect(page.getByRole("heading", { level: 1, name: /Install FitConnect on iPhone/i })).toBeVisible();
    await expect(page.locator("#ios-qr")).toBeVisible();
    await expect(page.getByRole("heading", { name: /iPhone 14 Pro Setup/i })).toBeVisible();
    await expect(page.getByText(/Open your iPhone camera/i)).toBeVisible();
    const html = await page.content();
    expect(html).not.toMatch(/BEGIN PRIVATE KEY/);
    expect(html).not.toMatch(/sk_live_/);
  });

  test("unconfigured install redirect does not open an arbitrary location", async ({ request }) => {
    const res = await request.get("/ios/install", { maxRedirects: 0 });
    expect(res.status()).toBe(404);
    expect(res.headers()["location"] ?? res.headers()["Location"]).toBeFalsy();
    expect(await res.text()).toMatch(/TESTFLIGHT LINK NOT CONFIGURED/i);
  });
});
