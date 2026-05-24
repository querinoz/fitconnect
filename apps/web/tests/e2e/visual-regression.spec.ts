import { test, expect } from "@playwright/test";

async function scrollUntilSelector(page: import("@playwright/test").Page, selector: string) {
  for (let i = 0; i < 24; i++) {
    if (await page.locator(selector).isVisible().catch(() => false)) return;
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(150);
  }
}

test.describe("Elite OS visual regression @elite-os", () => {
  test("landing_hero_matches_baseline", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/SYS\.STATUS/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page).toHaveScreenshot("landing-hero.png", {
      fullPage: false,
      maxDiffPixelRatio: 0.08,
      animations: "disabled"
    });
  });

  test("pricing_section_matches_baseline", async ({ page }) => {
    await page.goto("/");
    await scrollUntilSelector(page, "#pricing");
    const pricing = page.locator("#pricing");
    await expect(pricing).toBeVisible({ timeout: 30_000 });
    await expect(pricing).toHaveScreenshot("landing-pricing.png", {
      maxDiffPixelRatio: 0.08,
      animations: "disabled"
    });
  });

  test("discover_grid_matches_baseline", async ({ page }) => {
    await page.goto("/discover");
    await expect(page.getByRole("heading", { name: /Elite Discovery/i })).toBeVisible({
      timeout: 15_000
    });
    await expect(page.getByText(/AI \d+% match/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("main")).toHaveScreenshot("discover-grid.png", {
      maxDiffPixelRatio: 0.1,
      animations: "disabled"
    });
  });

  test("pricing_page_matches_baseline", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("main")).toHaveScreenshot("pricing-page.png", {
      maxDiffPixelRatio: 0.1,
      animations: "disabled"
    });
  });
});

test.describe("Elite OS a11y contrast @elite-os", () => {
  test("volt_accent_meets_contrast_on_floor", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /INITIALIZE SESSION/i })).toBeVisible({
      timeout: 15_000
    });
    const ratio = await page.evaluate(() => {
      function luminance(r: number, g: number, b: number) {
        const a = [r, g, b].map((v) => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * a[0]! + 0.7152 * a[1]! + 0.0722 * a[2]!;
      }
      const floor = getComputedStyle(document.documentElement).getPropertyValue("--eos-floor").trim();
      const volt = getComputedStyle(document.documentElement).getPropertyValue("--eos-voltline").trim();
      const parse = (hex: string) => {
        const h = hex.replace("#", "");
        return [
          parseInt(h.slice(0, 2), 16),
          parseInt(h.slice(2, 4), 16),
          parseInt(h.slice(4, 6), 16)
        ] as const;
      };
      const [fr, fg, fb] = parse(floor || "#070b14");
      const [vr, vg, vb] = parse(volt || "#c8ff00");
      const l1 = luminance(fr, fg, fb);
      const l2 = luminance(vr, vg, vb);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    });
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});
