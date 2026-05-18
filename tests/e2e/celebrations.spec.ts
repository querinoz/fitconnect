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

test("celebration overlay after ending a live session", async ({ browser }) => {
  const context = await browser.newContext();
  const athlete = await context.newPage();

  await signInDemo(athlete, "ines@fitconnect.local", "Athlete");
  await athlete.getByRole("button", { name: "Start" }).click();
  await expect(async () => {
    const txt = await athlete.getByTestId("live-hr").innerText();
    const n = Number.parseInt(txt.trim(), 10);
    expect(Number.isFinite(n) && n > 25).toBe(true);
  }).toPass({ timeout: 12_000 });

  await athlete.getByRole("button", { name: "End session" }).click();
  await expect(athlete.getByTestId("celebration-overlay")).toBeVisible({
    timeout: 15_000
  });

  await context.close();
});
