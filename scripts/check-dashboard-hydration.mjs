/**
 * QA: athlete dashboard must not throw React hydration errors after login.
 * Usage: node scripts/check-dashboard-hydration.mjs [baseUrl]
 */
import { chromium, devices } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:3001";
const issues = [];

const browser = await chromium.launch();
const context = await browser.newContext({ ...devices["Pixel 7"] });
const page = await context.newPage();

page.on("pageerror", (err) => {
  issues.push({ kind: "pageerror", text: err.message });
});
page.on("console", (msg) => {
  if (msg.type() === "error") {
    issues.push({ kind: "console", text: msg.text() });
  }
});

await page.goto(`${base}/signin`, { waitUntil: "load" });
await page.locator("#identifier").fill("Athlete");
await page.locator("#password").fill("Athlete");
await page.locator('form button[type="submit"]').click();
await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
await page.waitForTimeout(2500);

const html = await page.content();
const hasReadinessHero =
  html.includes("Peak Readiness") ||
  html.includes("Train Smart") ||
  html.includes("Recovery Focus");
const hasPercentScore = /\d{1,3}%/.test(html);

const hydrationIssues = issues.filter((i) =>
  /hydration|did not match|Text content does not match|Minified React error #418|#423|#425/i.test(
    i.text
  )
);

console.log("Stitch readiness hero:", hasReadinessHero);
console.log("Readiness percent in DOM:", hasPercentScore);
console.log("HTML contains 6396:", html.includes("6396"));
console.log("HTML contains 6,396:", html.includes("6,396"));

if (hydrationIssues.length) {
  console.error("\nHYDRATION ERRORS:");
  for (const h of hydrationIssues) console.error(`- [${h.kind}] ${h.text}`);
  await browser.close();
  process.exit(1);
}

if (html.includes("6,396") || html.includes("6396")) {
  console.error("\nFAIL: locale-sensitive load value still in DOM");
  await browser.close();
  process.exit(1);
}

if (!hasReadinessHero || !hasPercentScore) {
  console.error("\nFAIL: expected Stitch native dashboard (readiness hero + score)");
  await browser.close();
  process.exit(1);
}

console.log("\nPASS: no hydration errors; Stitch native dashboard rendered");
await browser.close();
