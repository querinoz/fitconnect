import { test, expect } from "@playwright/test";
import { openDemoAthleteAndCoach } from "./helpers/auth";

test.describe("voltline live session @voltline", () => {
  test.describe.configure({ mode: "serial" });

  test("coach live ticks appear on athlete detail tab", async ({ browser }) => {
    const { context, athlete, coach } = await openDemoAthleteAndCoach(browser);

    await athlete.getByRole("button", { name: "Start" }).click();

    await expect(async () => {
      const txt = await athlete.getByTestId("live-hr").innerText();
      const n = Number.parseInt(txt.trim(), 10);
      expect(Number.isFinite(n) && n > 25).toBe(true);
    }).toPass({ timeout: 20_000 });

    await coach.getByRole("button", { name: /Open Inês/i }).click();
    await expect(coach).toHaveURL(/coach\/athletes\/a-ines/);

    await expect(async () => {
      const txt = await coach.getByTestId("live-hr").innerText();
      const n = Number.parseInt(txt.trim(), 10);
      expect(Number.isFinite(n) && n > 25).toBe(true);
    }).toPass({ timeout: 20_000 });

    await context.close();
  });
});
