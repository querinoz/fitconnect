import { test, expect } from "@playwright/test";
import { signInDemo, signUpAthlete } from "./helpers/auth";

test("athlete sign-in reaches dashboard", async ({ page }) => {
  await signInDemo(page, "Athlete", "Athlete");
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("button", { name: "Book session" })).toBeVisible();
});

test("signup starts athlete onboarding wizard", async ({ page }) => {
  const email = `e2e-${Date.now()}@fitconnect.local`;
  await signUpAthlete(page, email);
  await expect(page.getByRole("heading", { name: "What do you train?" })).toBeVisible();
  await page.getByRole("button", { name: "Running" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Your 90-day goal" })).toBeVisible();
});

test("coach sign-in reaches coach dashboard", async ({ page }) => {
  await signInDemo(page, "Coach", "Coach");
  await expect(page).toHaveURL(/\/coach\/dashboard/);
});
