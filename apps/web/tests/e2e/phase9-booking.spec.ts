import { test, expect } from "@playwright/test";
import { openDemoAthleteAndCoach } from "./helpers/auth";

test.describe("voltline booking @voltline", () => {
  test.describe.configure({ mode: "serial" });

  test("athlete booking notifies coach dashboard", async ({ browser }) => {
    const { context, athlete, coach } = await openDemoAthleteAndCoach(browser);

    await coach.bringToFront();
    await athlete.bringToFront();
    await athlete.getByRole("button", { name: "Book session" }).click();
    await athlete.getByRole("button", { name: "Confirm booking" }).click();
    await athlete.getByRole("button", { name: "Confirm", exact: true }).click();
    await expect(
      athlete.getByRole("dialog").getByText("Session booked")
    ).toBeVisible();

    await coach.bringToFront();
    await expect(coach.getByText("New booking")).toBeVisible({ timeout: 12_000 });

    await context.close();
  });
});
