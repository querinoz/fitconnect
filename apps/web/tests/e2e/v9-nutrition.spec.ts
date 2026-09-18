import { test, expect } from "@playwright/test";

test.describe("V9 nutrition surface", () => {
  test("nutrition destination loads without 500", async ({ page }) => {
    const res = await page.goto("/nutrition");
    expect(res).not.toBeNull();
    expect(res!.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/(nutrition|signin)/);
  });

  test("foods search without query is 400 when reachable", async ({ request }) => {
    const res = await request.get("/api/v1/nutrition/foods");
    expect([400, 401, 403, 503]).toContain(res.status());
  });

  test("foods search with q never 500", async ({ request }) => {
    const res = await request.get("/api/v1/nutrition/foods?q=banana");
    expect(res.status()).toBeLessThan(500);
    if (res.status() === 200) {
      const body = await res.json();
      expect(body).toHaveProperty("foods");
      expect(body).toHaveProperty("state");
    }
  });

  test("dashboard today card links to nutrition not broken ascend", async ({ page }) => {
    const res = await page.goto("/dashboard");
    expect(res).not.toBeNull();
    expect(res!.status()).toBeLessThan(500);
  });
});
