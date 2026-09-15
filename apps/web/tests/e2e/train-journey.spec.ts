import { test, expect } from "@playwright/test";

test("TRAIN is a first-class athlete destination", async ({ page }) => {
  const response = await page.goto("/train");
  expect(response).not.toBeNull();
  expect(response!.status()).toBeLessThan(500);
  await expect(page).toHaveURL(/\/(train|signin)/);
});

test("Martial Arts OS is a first-class athlete destination", async ({ page }) => {
  const response = await page.goto("/martial-arts");
  expect(response).not.toBeNull();
  expect(response!.status()).toBeLessThan(500);
  await expect(page).toHaveURL(/\/(martial-arts|signin)/);
});

test("Ascend and coach directory do not 500", async ({ page }) => {
  const ascend = await page.goto("/achievements");
  expect(ascend).not.toBeNull();
  expect(ascend!.status()).toBeLessThan(500);
  const coaches = await page.goto("/coaches");
  expect(coaches).not.toBeNull();
  expect(coaches!.status()).toBeLessThan(500);
});
