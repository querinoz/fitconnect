import type { Browser, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import type { AuthUser } from "@/lib/auth";

export const DEMO_ATHLETE: AuthUser = {
  id: "athlete",
  username: "Athlete",
  name: "Inês M.",
  email: "ines@fitconnect.local",
  role: "athlete",
  athleteId: "a-ines"
};

export const DEMO_COACH: AuthUser = {
  id: "coach",
  username: "Coach",
  name: "Tomás Ribeiro",
  email: "tomas@fitconnect.local",
  role: "coach",
  coachId: "t-002"
};

async function waitForAuthForm(page: Page) {
  const submit = page.locator('form button[type="submit"]');
  await expect(submit).toBeEnabled({ timeout: 30_000 });
}

export async function signInDemo(
  page: Page,
  identifier: string,
  password: string
) {
  await page.goto("/signin", { waitUntil: "load" });
  await waitForAuthForm(page);
  await page.locator("#identifier").fill(identifier);
  await page.locator("#password").fill(password);
  const submit = page.locator('form button[type="submit"]');
  await expect(submit).toBeEnabled();
  await submit.click();
  await page.waitForURL(/\/(dashboard|coach\/|admin)/, { timeout: 30_000 });
}

/** Same browser context (shared BroadcastChannel) with isolated per-tab demo auth. */
export async function openDemoAthleteAndCoach(browser: Browser) {
  const context = await browser.newContext();
  const athlete = await context.newPage();
  const coach = await context.newPage();

  await athlete.addInitScript((user) => {
    window.__FC_DEMO_USER__ = user;
  }, DEMO_ATHLETE);
  await coach.addInitScript((user) => {
    window.__FC_DEMO_USER__ = user;
  }, DEMO_COACH);

  await athlete.goto("/dashboard", { waitUntil: "load" });
  await coach.goto("/coach/dashboard", { waitUntil: "load" });

  await expect(athlete.getByRole("button", { name: "Book session" })).toBeVisible({
    timeout: 20_000
  });
  await expect(coach.getByText("Roster readiness")).toBeVisible({ timeout: 20_000 });

  return { context, athlete, coach };
}

export async function signUpAthlete(page: Page, email: string) {
  await page.goto("/signup", { waitUntil: "load" });
  await waitForAuthForm(page);
  await page.locator("#name").fill("E2E Athlete");
  await page.getByRole("button", { name: "athlete", exact: true }).click();
  await page.locator("#email").fill(email);
  await page.locator("#password").fill("password123");
  await page.getByRole("checkbox").check();
  const submit = page.locator('form button[type="submit"]');
  await expect(submit).toBeEnabled();
  await submit.click();
  await page.waitForURL(/\/onboarding\/athlete/, { timeout: 30_000 });
}

declare global {
  interface Window {
    __FC_DEMO_USER__?: AuthUser;
    __setDemoUser?: (user: AuthUser | null) => void;
  }
}
