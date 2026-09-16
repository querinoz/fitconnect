import { test, expect } from "@playwright/test";
import { signInDemo } from "./helpers/auth";

/**
 * Release-critical social surface is `/feed` (CommunityFeed filteredIds=null).
 * Marketing `/community` is out of scope for this interaction.
 *
 * Known debt (TD-06): with Supabase persistence + DEMO_MODE, requireAuth returns
 * demo without accessToken and POST /api/v1/community/posts → 401 token_required.
 * Spec must stay red until memory fixture or real token harness exists — do not skip.
 */
test("community feed accepts post and reaction", async ({ page }) => {
  await signInDemo(page, "ines@fitconnect.local", "Athlete");
  await page.goto("/feed", { waitUntil: "load" });
  const body = `E2E PR check-in ${Date.now()}`;
  const textarea = page.getByPlaceholder(/Share a PR/i);
  await expect(textarea).toBeVisible({ timeout: 15_000 });
  await textarea.click();
  await textarea.pressSequentially(body, { delay: 15 });
  const postBtn = page.getByRole("button", { name: "Post to feed" });
  await expect(postBtn).toBeEnabled({ timeout: 15_000 });
  await postBtn.click();
  const postPara = page.locator("p.leading-relaxed").filter({ hasText: body });
  await expect(postPara).toBeVisible({ timeout: 15_000 });
  const fire = postPara
    .locator("xpath=following-sibling::div[1]")
    .locator("button")
    .filter({ hasText: "🔥" });
  await expect(fire).toBeVisible();
  const before = (await fire.textContent()) ?? "";
  const beforeCount = Number((before.match(/(\d+)\s*$/) ?? [])[1] ?? "0");
  await fire.click();
  await expect
    .poll(async () => {
      const t = (await fire.textContent()) ?? "";
      return Number((t.match(/(\d+)\s*$/) ?? [])[1] ?? "0");
    })
    .toBe(beforeCount + 1);
});
