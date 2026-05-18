import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

async function signInDemo(page: Page, identifier: string, password: string) {
  await page.goto("/signin");
  await page.locator("#identifier").fill(identifier);
  await page.locator("#password").fill(password);
  await page.locator('form button[type="submit"]').click();
  await page.waitForURL(/\/(dashboard|coach\/)/);
}

test.describe.configure({ mode: "serial" });

test("coach QuickDiff reaches athlete plan banner", async ({ browser }) => {
  const context = await browser.newContext();
  const coach = await context.newPage();
  const athlete = await context.newPage();

  await Promise.all([
    signInDemo(athlete, "ines@fitconnect.local", "Athlete"),
    signInDemo(coach, "tomas@fitconnect.local", "Coach")
  ]);

  await coach.goto("/coach/athletes/a-ines");

  await coach.getByRole("button", { name: "Swap to Z2" }).click();

  await expect(athlete.getByRole("button", { name: "Apply" })).toBeVisible({
    timeout: 8000
  });

  await context.close();
});
