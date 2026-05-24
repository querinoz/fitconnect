import { test, expect } from "@playwright/test";
import { signInDemo } from "./helpers/auth";

async function scrollUntilSelector(page: import("@playwright/test").Page, selector: string) {
  for (let i = 0; i < 24; i++) {
    if (await page.locator(selector).isVisible().catch(() => false)) return;
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(150);
  }
}

test.describe("Landing motion @elite-os", () => {
  test("should_show_elite_os_hero_with_full_motion_preference", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("fitconnect:motion", "full");
      document.documentElement.dataset.motion = "full";
    });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/SYS\.STATUS/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /INITIALIZE SESSION/i })).toBeVisible();
  });

  test("should_show_hero_when_os_reduced_motion_emulated", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(() => {
      localStorage.removeItem("fitconnect:motion");
    });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 15_000 });
    const duration = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--motion-duration").trim()
    );
    expect(duration === "0ms" || duration === "").toBeTruthy();
  });

  test("should_enable_motion_when_user_overrides_os_reduced", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(() => localStorage.setItem("fitconnect:motion", "full"));
    await page.goto("/");
    const motion = await page.evaluate(() => document.documentElement.dataset.motion);
    expect(motion).toBe("full");
  });

  test("should_disable_motion_when_user_overrides_os_full", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.addInitScript(() => localStorage.setItem("fitconnect:motion", "reduced"));
    await page.goto("/");
    const motion = await page.evaluate(() => document.documentElement.dataset.motion);
    expect(motion).toBe("reduced");
  });

  test("should_persist_motion_preference_after_navigation", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("fitconnect:motion", "reduced"));
    await page.goto("/");
    await page.goto("/profile");
    await page.goto("/");
    const stored = await page.evaluate(() => localStorage.getItem("fitconnect:motion"));
    expect(stored).toBe("reduced");
  });

  test("should_reflect_app_toggle_on_dataset_motion", async ({ page }) => {
    await signInDemo(page, "ines@fitconnect.local", "Athlete");
    await page.goto("/settings/appearance");
    const toggle = page.getByRole("checkbox", { name: /reduce motion/i });
    await expect(toggle).toBeVisible({ timeout: 20_000 });
    await toggle.check();
    const motion = await page.evaluate(() => document.documentElement.dataset.motion);
    expect(motion).toBe("reduced");
  });
});

test.describe("Elite OS landing sections", () => {
  test("should_render_pricing_and_demo_sections", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#demo")).toBeVisible({ timeout: 20_000 });
    await scrollUntilSelector(page, "#pricing");
    await expect(page.locator("#pricing")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/ACTIVATE ATHLETE OS/i)).toBeVisible();
  });
});
