#!/usr/bin/env node
/**
 * Mobile Lighthouse audit with optional CI score gates.
 *
 * Usage:
 *   node scripts/lighthouse-mobile.mjs [url]
 *   CI=true node scripts/lighthouse-mobile.mjs https://fitconnect-phi.vercel.app
 *
 * Env:
 *   LIGHTHOUSE_MIN_PERF=84
 *   LIGHTHOUSE_MIN_A11Y=90
 *   LIGHTHOUSE_MIN_BP=95
 *   LIGHTHOUSE_MIN_SEO=95
 *   LIGHTHOUSE_GATE=1   — fail on threshold breach (default in CI)
 */

import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

const url = process.argv[2] ?? "http://localhost:3001";
const isCI = process.env.CI === "true" || process.env.LIGHTHOUSE_GATE === "1";

const THRESHOLDS = {
  performance: Number(process.env.LIGHTHOUSE_MIN_PERF ?? (isCI ? 84 : 0)),
  accessibility: Number(process.env.LIGHTHOUSE_MIN_A11Y ?? (isCI ? 90 : 0)),
  "best-practices": Number(process.env.LIGHTHOUSE_MIN_BP ?? (isCI ? 95 : 0)),
  seo: Number(process.env.LIGHTHOUSE_MIN_SEO ?? (isCI ? 95 : 0))
};

const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless=new"] });

try {
  const result = await lighthouse(url, {
    logLevel: "error",
    port: chrome.port,
    output: "json",
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    settings: {
      formFactor: "mobile",
      screenEmulation: {
        mobile: true,
        width: 390,
        height: 844,
        deviceScaleFactor: 2,
        disabled: false
      }
    }
  });

  const cats = result?.lhr?.categories;
  if (!cats) {
    console.error("Lighthouse produced no categories.");
    process.exitCode = 1;
  } else {
    let failed = false;
    for (const [key, cat] of Object.entries(cats)) {
      const pct = Math.round((cat.score ?? 0) * 100);
      const min = THRESHOLDS[key] ?? 0;
      const ok = min === 0 || pct >= min;
      const flag = ok ? "✓" : "✗";
      console.log(`${flag} ${key}: ${pct}${min ? ` (min ${min})` : ""}`);
      if (!ok) failed = true;
    }
    if (failed && isCI) {
      console.error("\nLighthouse gate failed. See docs/VOLTLINE_OS_V2.md for targets.");
      process.exitCode = 1;
    }
  }
} finally {
  await chrome.kill();
}
