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
    const audits = result?.lhr?.audits ?? {};
    const num = (id) => {
      const v = audits[id]?.numericValue;
      return typeof v === "number" && Number.isFinite(v) ? v : null;
    };
    const fmtMs = (v) => (v == null ? "n/a" : `${Math.round(v)} ms`);
    const fmtKb = (v) => (v == null ? "n/a" : `${Math.round(v / 1024)} KiB`);
    console.log(`LCP: ${fmtMs(num("largest-contentful-paint"))}`);
    console.log(`FCP: ${fmtMs(num("first-contentful-paint"))}`);
    const ttfb = num("server-response-time") ?? num("time-to-first-byte");
    console.log(`TTFB: ${fmtMs(ttfb)}`);
    console.log(`CLS: ${num("cumulative-layout-shift") == null ? "n/a" : num("cumulative-layout-shift").toFixed(3)}`);
    console.log(`TBT: ${fmtMs(num("total-blocking-time"))}`);
    console.log(`INP: ${fmtMs(num("interaction-to-next-paint"))}`);
    console.log(`Transfer: ${fmtKb(num("total-byte-weight"))}`);
    console.log(`JS execution: ${fmtMs(num("bootup-time"))}`);
    const lcpEl = audits["largest-contentful-paint-element"];
    const lcpNode = lcpEl?.details?.items?.[0]?.node ?? lcpEl?.details?.items?.[0];
    if (lcpNode) {
      const snippet =
        lcpNode.nodeLabel ?? lcpNode.snippet ?? lcpNode.selector ?? JSON.stringify(lcpNode).slice(0, 240);
      console.log(`LCP element: ${snippet}`);
    }
    const items = lcpEl?.details?.items;
    if (Array.isArray(items) && items[0]?.items) {
      const phase = items[0].items
        .map((row) => `${row.phase ?? row.label ?? "?"}:${Math.round(row.timing ?? row.duration ?? 0)}ms`)
        .join(" ");
      if (phase) console.log(`LCP phases: ${phase}`);
    }
    const dumpPath = process.env.LIGHTHOUSE_JSON;
    if (dumpPath) {
      const { writeFileSync } = await import("node:fs");
      writeFileSync(dumpPath, JSON.stringify(result.lhr, null, 0));
      console.log(`LHR written: ${dumpPath}`);
    }
    const unusedJs = audits["unused-javascript"]?.numericValue;
    const unusedCss = audits["unused-css-rules"]?.numericValue;
    console.log(`Unused JS: ${fmtKb(unusedJs)}`);
    console.log(`Unused CSS: ${fmtKb(unusedCss)}`);
    const blocking = audits["render-blocking-insight"] ?? audits["render-blocking-resources"];
    if (blocking?.numericValue != null) {
      console.log(`Render-blocking: ${fmtMs(blocking.numericValue)}`);
    }

    if (failed && isCI) {
      console.error("\nLighthouse gate failed. See docs/VOLTLINE_OS_V2.md for targets.");
      process.exitCode = 1;
    }
  }
} finally {
  await chrome.kill();
}
