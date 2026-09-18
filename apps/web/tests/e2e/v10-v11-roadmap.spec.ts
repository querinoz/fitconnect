import { test, expect } from "@playwright/test";

test.describe("V10-V11 roadmap API smoke", () => {
  test("context endpoint never 500", async ({ request }) => {
    const res = await request.get("/api/v1/context");
    expect(res.status()).toBeLessThan(500);
  });

  test("events POST invalid type is 4xx when auth allows", async ({ request }) => {
    const res = await request.post("/api/v1/events", {
      data: { type: "NOT_A_REAL_EVENT", payload: {} }
    });
    expect([400, 401, 403, 422]).toContain(res.status());
  });

  test("devices status never 500", async ({ request }) => {
    const res = await request.get("/api/v1/devices/status");
    expect(res.status()).toBeLessThan(500);
    if (res.status() === 200) {
      const body = await res.json();
      expect(body).toHaveProperty("devices");
    }
  });

  test("agent router never 500", async ({ request }) => {
    const res = await request.post("/api/v1/ai/route-agent", {
      data: { query: "What should I train today?" }
    });
    expect(res.status()).toBeLessThan(500);
  });

  test("network spots never 500", async ({ request }) => {
    const res = await request.get("/api/v1/network?view=spots");
    expect(res.status()).toBeLessThan(500);
  });

  test("dashboard loads with live context mount path", async ({ page }) => {
    const res = await page.goto("/dashboard");
    expect(res).not.toBeNull();
    expect(res!.status()).toBeLessThan(500);
  });
});
