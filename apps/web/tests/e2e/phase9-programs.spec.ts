import { test, expect } from "@playwright/test";

test("program detail shows enroll CTA", async ({ page }) => {
  await page.goto("/programs/p-iron-arc");
  await expect(page.getByRole("heading", { name: "The Iron Arc" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Enroll · Stripe test mode/i })
  ).toBeVisible();
});

test("programs index lists signature programs", async ({ page }) => {
  await page.goto("/programs");
  await expect(page.getByRole("link", { name: /The Iron Arc/i }).first()).toBeVisible();
});
