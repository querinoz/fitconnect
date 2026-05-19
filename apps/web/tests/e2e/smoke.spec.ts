import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/FitConnect/i);
});

test("health endpoint returns ok", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.ok()).toBeTruthy();
  const body = (await res.json()) as { status: string; dependencies: unknown[] };
  expect(body.status).toMatch(/ok|degraded/);
  expect(body.dependencies.length).toBeGreaterThan(0);
});
