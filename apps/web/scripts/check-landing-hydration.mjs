/**
 * One-shot: landing must not throw React hydration mismatches.
 * Usage: node scripts/check-landing-hydration.mjs [baseUrl]
 */
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://127.0.0.1:3001";
const issues = [];

const browser = await chromium.launch();
const page = await browser.newPage();

page.on("pageerror", (err) => {
  issues.push({ kind: "pageerror", text: err.message });
});
page.on("console", (msg) => {
  if (msg.type() === "error") issues.push({ kind: "console", text: msg.text() });
});

await page.goto(`${base}/?v=hydrate-fix`, { waitUntil: "load", timeout: 60_000 });
await page.waitForTimeout(2500);

const hydrationIssues = issues.filter((i) =>
  /hydration|did not match|Text content does not match|Minified React error #418|#423|#425/i.test(
    i.text
  )
);

if (hydrationIssues.length) {
  console.error("HYDRATION ERRORS:");
  for (const h of hydrationIssues) console.error(`- [${h.kind}] ${h.text}`);
  await browser.close();
  process.exit(1);
}

console.log("PASS: no landing hydration errors");
if (issues.length) {
  console.log("other console errors (non-hydration):", issues.length);
}
await browser.close();
