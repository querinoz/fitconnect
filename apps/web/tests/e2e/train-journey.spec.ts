import { test, expect } from "@playwright/test";

test("TRAIN is a first-class athlete destination", async ({ page }) => {
  const response = await page.goto("/train");
  expect(response).not.toBeNull();
  expect(response!.status()).toBeLessThan(500);
  await expect(page).toHaveURL(/\/(train|signin)/);
});
