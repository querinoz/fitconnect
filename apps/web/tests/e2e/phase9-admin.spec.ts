import { test, expect } from "@playwright/test";
import { signInDemo } from "./helpers/auth";

test("admin overview shows KPI cards", async ({ page }) => {
  await signInDemo(page, "Admin", "Admin");
  await page.goto("/admin");
  // Product copy (admin/page.tsx): heading "Overview", KPI "Paid athletes",
  // subscription volume label — not the legacy "Admin overview" / "MRR" strings.
  await expect(page.getByRole("heading", { name: /^Overview$/i })).toBeVisible();
  await expect(page.getByText("Paid athletes")).toBeVisible();
  await expect(page.getByText(/subscription volume|MRR/i)).toBeVisible();
});

test("admin can open coach verification queue", async ({ page }) => {
  await signInDemo(page, "Admin", "Admin");
  await page.goto("/admin/coach-verification");
  await expect(page.getByRole("heading", { name: "Coach verification" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Approve" }).first()).toBeVisible();
});
