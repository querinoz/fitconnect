import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

async function signInDemo(page: Page, identifier: string, password: string) {
  await page.goto("/signin");
  await page.locator("#identifier").fill(identifier);
  await page.locator("#password").fill(password);
  await page.locator('form button[type="submit"]').click();
  await page.waitForURL(/\/dashboard/);
}

test("appearance page sets data-theme via Aurora preset", async ({ page }) => {
  await signInDemo(page, "ines@fitconnect.local", "Athlete");

  await page.goto("/settings/appearance");
  // Native radio is opacity:0 (custom orbit UI). Click the settings label row.
  await page.locator(".fc-theme-radio-label").filter({ hasText: "Aurora" }).first().click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "aurora");
});
