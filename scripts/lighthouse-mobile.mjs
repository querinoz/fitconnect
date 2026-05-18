#!/usr/bin/env node
/**
 * Mobile-form-factor Lighthouse audit (scores to stdout).
 * Usage: node scripts/lighthouse-mobile.mjs [url]
 */

import lighthouse from "lighthouse";
import chromeLauncher from "chrome-launcher";

const url = process.argv[2] ?? "http://localhost:3001";

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
    for (const [key, cat] of Object.entries(cats)) {
      const pct = Math.round((cat.score ?? 0) * 100);
      console.log(`${key}: ${pct}`);
    }
  }
} finally {
  await chrome.kill();
}
