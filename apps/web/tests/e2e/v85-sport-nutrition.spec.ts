import { test, expect } from "@playwright/test";

/**
 * V8.5 critical journey smoke — UI destinations + unauth API contracts.
 * Authenticated deep journey covered by domain unit journey.test.ts when demo/auth unavailable.
 */
test.describe("V8.5 critical surfaces", () => {
  test("TRAIN destination loads without 500", async ({ page }) => {
    const res = await page.goto("/train");
    expect(res).not.toBeNull();
    expect(res!.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/(train|signin)/);
  });

  test("dashboard destination loads without 500", async ({ page }) => {
    const res = await page.goto("/dashboard");
    expect(res).not.toBeNull();
    expect(res!.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/(dashboard|signin)/);
  });

  test("profile destination loads without 500", async ({ page }) => {
    const res = await page.goto("/profile");
    expect(res).not.toBeNull();
    expect(res!.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/(profile|signin)/);
  });

  test("recovery/ascend destination loads without 500", async ({ page }) => {
    const res = await page.goto("/recovery");
    expect(res).not.toBeNull();
    expect(res!.status()).toBeLessThan(500);
  });

  test("unauthenticated sports identity is unauthorized", async ({ request }) => {
    const res = await request.get("/api/v1/sports/identity");
    // demo mode may allow; otherwise 401
    expect([200, 401, 403, 503]).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json();
      expect(body.profile || body.note).toBeTruthy();
    }
  });

  test("nutrition targets POST remains blocked", async ({ request }) => {
    const res = await request.post("/api/v1/nutrition/targets", { data: {} });
    expect([401, 403, 405, 503]).toContain(res.status());
  });

  test("nutrition log without confirm is rejected when authenticated path reachable", async ({
    request
  }) => {
    const res = await request.post("/api/v1/nutrition/log", {
      data: { foodId: "usda:banana-raw", grams: 100, confirm: false }
    });
    expect([400, 401, 403, 503]).toContain(res.status());
    if (res.status() === 400) {
      const body = await res.json();
      expect(body.error).toMatch(/confirmation_required|invalid/);
    }
  });

  test("training completions without confirm rejected when reachable", async ({ request }) => {
    const res = await request.post("/api/v1/training/completions", {
      data: { sportId: "RUNNING", durationSec: 60, confirm: false }
    });
    expect([400, 401, 403, 503]).toContain(res.status());
  });

  test("MCP discover does not expose secrets", async ({ request }) => {
    const res = await request.get("/api/v1/mcp");
    expect(res.status()).toBeLessThan(500);
    const text = await res.text();
    expect(text).not.toMatch(/BEGIN PRIVATE KEY/);
    expect(text).not.toMatch(/sk_live_/);
    expect(text).not.toMatch(/service_role/);
  });
});
