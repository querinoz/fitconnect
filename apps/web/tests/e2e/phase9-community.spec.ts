import { test, expect } from "@playwright/test";

test("community feed accepts post and reaction", async ({ page }) => {
  await page.goto("/community", { waitUntil: "load" });
  const body = `E2E PR check-in ${Date.now()}`;
  const textarea = page.getByPlaceholder(/Share a PR/i);
  await textarea.click();
  await textarea.pressSequentially(body, { delay: 15 });
  const postBtn = page.getByRole("button", { name: "Post to feed" });
  await expect(postBtn).toBeEnabled({ timeout: 15_000 });
  await postBtn.click();
  await expect(page.getByText(body, { exact: true })).toBeVisible();
  const card = page.locator("div.p-5.space-y-3").filter({ hasText: body });
  await card.getByRole("button", { name: "🔥 1", exact: true }).click();
  await expect(card.getByRole("button", { name: "🔥 2", exact: true })).toBeVisible();
});
