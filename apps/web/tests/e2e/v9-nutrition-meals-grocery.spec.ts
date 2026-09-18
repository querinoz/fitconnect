import { test, expect } from "@playwright/test";

test.describe("V9 nutrition meal · grocery · recipes", () => {
  test("meals destination loads without 500", async ({ page }) => {
    const res = await page.goto("/nutrition/meals");
    expect(res).not.toBeNull();
    expect(res!.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/(nutrition\/meals|signin)/);
  });

  test("grocery destination loads without 500", async ({ page }) => {
    const res = await page.goto("/nutrition/grocery");
    expect(res).not.toBeNull();
    expect(res!.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/(nutrition\/grocery|signin)/);
  });

  test("recipes destination loads without 500", async ({ page }) => {
    const res = await page.goto("/nutrition/recipes");
    expect(res).not.toBeNull();
    expect(res!.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/(nutrition\/recipes|signin)/);
  });

  test("meal-plan view never 500", async ({ request }) => {
    const res = await request.get(
      "/api/v1/nutrition/targets?view=meal-plan&sport=RUNNING&day=moderate&durationMin=45&goal=PERFORMANCE&locale=pt-PT"
    );
    expect(res.status()).toBeLessThan(500);
    if (res.status() === 200) {
      const body = await res.json();
      expect(body).toHaveProperty("plan");
      expect(body).toHaveProperty("grocery");
      expect(body.plan).toHaveProperty("days");
      expect(Array.isArray(body.grocery)).toBeTruthy();
    }
  });

  test("recipes view never 500", async ({ request }) => {
    const res = await request.get("/api/v1/nutrition/targets?view=recipes&sportKey=endurance");
    expect(res.status()).toBeLessThan(500);
    if (res.status() === 200) {
      const body = await res.json();
      expect(body).toHaveProperty("recipes");
      expect(Array.isArray(body.recipes)).toBeTruthy();
    }
  });

  test("meal-swap without confirm is rejected when auth allows", async ({ request }) => {
    const planRes = await request.get(
      "/api/v1/nutrition/targets?view=meal-plan&sport=RUNNING&day=moderate&durationMin=45"
    );
    if (planRes.status() !== 200) {
      expect([401, 403]).toContain(planRes.status());
      return;
    }
    const planBody = await planRes.json();
    const slot = planBody.plan?.days?.[0]?.slots?.[0];
    expect(slot).toBeTruthy();
    const apply = await request.post("/api/v1/nutrition/meal-swap", {
      data: { action: "apply", nextFoodId: "usda:banana-raw", slot, confirm: false }
    });
    expect([400, 401, 403]).toContain(apply.status());
    if (apply.status() === 400) {
      const body = await apply.json();
      expect(body.error).toBe("confirmation_required");
    }
  });

  test("hub, meals, grocery, recipes are linked from nutrition surface", async ({ page }) => {
    await page.goto("/nutrition");
    const gated =
      page.url().includes("signin") ||
      (await page.getByText(/Sign in required/i).isVisible().catch(() => false));
    if (gated) {
      const athlete = page.getByRole("link", { name: /Sign in as athlete/i });
      if (await athlete.isVisible().catch(() => false)) {
        await athlete.click();
        await page.waitForURL(/\/(nutrition|dashboard|home|train|feed)/, { timeout: 20000 }).catch(() => {});
        await page.goto("/nutrition");
      } else {
        test.skip(true, "auth gate — interactive meal UI requires session");
        return;
      }
    }
    const experience = page.getByTestId("nutrition-experience");
    if (!(await experience.isVisible().catch(() => false))) {
      test.skip(true, "auth gate — nutrition experience not mounted without session");
      return;
    }
    await expect(experience).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("link", { name: /Meals/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Grocery/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Recipes/i }).first()).toBeVisible();
  });
});
