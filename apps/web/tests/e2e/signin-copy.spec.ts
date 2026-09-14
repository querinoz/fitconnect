import { test, expect } from "@playwright/test";

test("signin copy matches health demo posture", async ({ page, request }) => {
  const health = await request.get("/api/health");
  expect(health.ok()).toBeTruthy();
  const json = (await health.json()) as {
    dependencies?: Array<{ name: string; detail?: string }>;
  };
  const auth = json.dependencies?.find((d) => d.name === "auth");
  const demo = String(auth?.detail ?? "").includes("demo");

  await page.goto("/signin");
  await expect(page.getByRole("textbox").first()).toBeVisible();

  if (demo) {
    await expect(page.getByRole("region", { name: /demo/i })).toBeVisible();
  } else {
    await expect(page.getByRole("region", { name: /demo/i })).toHaveCount(0);
    await expect(page.getByText(/Athlete \/ Athlete/)).toHaveCount(0);
    await expect(page.getByText(/Modo demo/i)).toHaveCount(0);
  }
});
