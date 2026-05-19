import { test, expect } from "@playwright/test";
import { openDemoAthleteAndCoach } from "./helpers/auth";

test.describe("voltline morning handshake @voltline", () => {
  test.describe.configure({ mode: "serial" });

  test("coach QuickDiff reaches athlete plan banner", async ({ browser }) => {
    const { context, athlete, coach } = await openDemoAthleteAndCoach(browser);

    await coach.getByRole("button", { name: /Open Inês/i }).click();
    await expect(coach).toHaveURL(/coach\/athletes\/a-ines/);
    const swapBtn = coach.getByRole("button", { name: "Swap to Z2", exact: true });
    await expect(swapBtn).toBeVisible({ timeout: 20_000 });
    await swapBtn.click();

    await expect(athlete.getByRole("button", { name: "Apply" })).toBeVisible({
      timeout: 12_000
    });

    await context.close();
  });
});
