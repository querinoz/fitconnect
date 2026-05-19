import { test, expect } from "@playwright/test";
import { signInDemo } from "./helpers/auth";

test("admin overview shows KPI cards", async ({ page }) => {
  await signInDemo(page, "Admin", "Admin");
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Admin overview" })).toBeVisible();
  await expect(page.getByText("Paid athletes")).toBeVisible();
  await expect(page.getByText("MRR")).toBeVisible();
});

test("admin can open coach verification queue", async ({ page }) => {
  await signInDemo(page, "Admin", "Admin");
  await page.goto("/admin/coach-verification");
  await expect(page.getByRole("heading", { name: "Coach verification" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Approve" }).first()).toBeVisible();
});
