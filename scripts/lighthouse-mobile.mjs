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
 *   LIGHTHOUSE_JSON     — write the raw LHR to this path (CI defaults to lighthouse-mobile-report.json)
 *
 * The 84 performance gate is never lowered here. Failures must print the actual
 * scores, metrics, LCP element, failed audit IDs, and the exact exit reason so
 * GitHub annotations are not just "Process completed with exit code 1".
 */

import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

/** Lighthouse Slow 4G + 4× CPU. Kept explicit so Ubuntu CI matches local simulate mode. */
export const MOBILE_THROTTLING = {
  rttMs: 150,
  throughputKbps: 1638.4,
  requestLatencyMs: 562.5,
  downloadThroughputKbps: 1474.56,
  uploadThroughputKbps: 675,
  cpuSlowdownMultiplier: 4
};

export const CI_DEFAULT_THRESHOLDS = {
  performance: 84,
  accessibility: 90,
  "best-practices": 95,
  seo: 95
};

export function isGateEnabled(env = process.env) {
  return env.CI === "true" || env.LIGHTHOUSE_GATE === "1";
}

export function resolveThresholds(env = process.env) {
  const gated = isGateEnabled(env);
  return {
    performance: Number(env.LIGHTHOUSE_MIN_PERF ?? (gated ? CI_DEFAULT_THRESHOLDS.performance : 0)),
    accessibility: Number(env.LIGHTHOUSE_MIN_A11Y ?? (gated ? CI_DEFAULT_THRESHOLDS.accessibility : 0)),
    "best-practices": Number(env.LIGHTHOUSE_MIN_BP ?? (gated ? CI_DEFAULT_THRESHOLDS["best-practices"] : 0)),
    seo: Number(env.LIGHTHOUSE_MIN_SEO ?? (gated ? CI_DEFAULT_THRESHOLDS.seo : 0))
  };
}

export function scoreCategories(categories, thresholds) {
  const rows = [];
  let failed = false;
  for (const [key, cat] of Object.entries(categories ?? {})) {
    const pct = Math.round((cat?.score ?? 0) * 100);
    const min = thresholds[key] ?? 0;
    const ok = min === 0 || pct >= min;
    if (!ok) failed = true;
    rows.push({ key, pct, min, ok });
  }
  return { rows, failed };
}

function numericAudit(audits, id) {
  const v = audits?.[id]?.numericValue;
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function lcpElementLabel(audits) {
  const lcpEl = audits?.["largest-contentful-paint-element"];
  const lcpNode = lcpEl?.details?.items?.[0]?.node ?? lcpEl?.details?.items?.[0];
  if (!lcpNode) return null;
  return lcpNode.nodeLabel ?? lcpNode.snippet ?? lcpNode.selector ?? JSON.stringify(lcpNode).slice(0, 240);
}

function lcpPhases(audits) {
  const items = audits?.["largest-contentful-paint-element"]?.details?.items;
  if (!Array.isArray(items) || !items[0]?.items) return null;
  const phase = items[0].items
    .map((row) => `${row.phase ?? row.label ?? "?"}:${Math.round(row.timing ?? row.duration ?? 0)}ms`)
    .join(" ");
  return phase || null;
}

export function failedAuditIds(lhr, limit = 20) {
  const audits = lhr?.audits ?? {};
  const ids = [];
  const seen = new Set();
  const push = (id) => {
    if (!id || seen.has(id)) return;
    seen.add(id);
    ids.push(id);
  };
  for (const cat of Object.values(lhr?.categories ?? {})) {
    for (const ref of cat?.auditRefs ?? []) {
      const audit = audits[ref.id];
      if (!audit) continue;
      if (audit.scoreDisplayMode === "informative" || audit.scoreDisplayMode === "manual" || audit.scoreDisplayMode === "notApplicable") {
        continue;
      }
      if (typeof audit.score === "number" && audit.score < 0.9) push(ref.id);
    }
  }
  return ids.slice(0, limit);
}

export function collectDiagnostics(lhr, thresholds) {
  const audits = lhr?.audits ?? {};
  const { rows, failed } = scoreCategories(lhr?.categories, thresholds);
  const lcp = numericAudit(audits, "largest-contentful-paint");
  const tbt = numericAudit(audits, "total-blocking-time");
  const cls = numericAudit(audits, "cumulative-layout-shift");
  const ttfb = numericAudit(audits, "server-response-time") ?? numericAudit(audits, "time-to-first-byte");
  const transfer = numericAudit(audits, "total-byte-weight");
  const runtimeError = lhr?.runtimeError
    ? `${lhr.runtimeError.code ?? "ERROR"}: ${lhr.runtimeError.message ?? ""}`.trim()
    : null;
  const failedCats = rows.filter((r) => !r.ok).map((r) => `${r.key} ${r.pct} < min ${r.min}`);
  let exitReason = "ok";
  if (!lhr?.categories) exitReason = "Lighthouse produced no categories";
  else if (runtimeError) exitReason = `runtimeError ${runtimeError}`;
  else if (failed) exitReason = failedCats.join("; ") || "threshold breach";
  return {
    requestedUrl: lhr?.requestedUrl ?? null,
    finalUrl: lhr?.finalDisplayedUrl ?? lhr?.finalUrl ?? null,
    rows,
    failed: failed || Boolean(runtimeError) || !lhr?.categories,
    performance: rows.find((r) => r.key === "performance")?.pct ?? null,
    accessibility: rows.find((r) => r.key === "accessibility")?.pct ?? null,
    "best-practices": rows.find((r) => r.key === "best-practices")?.pct ?? null,
    seo: rows.find((r) => r.key === "seo")?.pct ?? null,
    lcp,
    fcp: numericAudit(audits, "first-contentful-paint"),
    ttfb,
    cls,
    tbt,
    inp: numericAudit(audits, "interaction-to-next-paint"),
    transfer,
    jsExecution: numericAudit(audits, "bootup-time"),
    unusedJs: numericAudit(audits, "unused-javascript"),
    unusedCss: numericAudit(audits, "unused-css-rules"),
    renderBlocking: (audits["render-blocking-insight"] ?? audits["render-blocking-resources"])?.numericValue ?? null,
    lcpElement: lcpElementLabel(audits),
    lcpPhases: lcpPhases(audits),
    failedAudits: failedAuditIds(lhr),
    runtimeError,
    exitReason,
    thresholds
  };
}

function fmtMs(v) {
  return v == null ? "n/a" : `${Math.round(v)} ms`;
}

function fmtKb(v) {
  return v == null ? "n/a" : `${Math.round(v / 1024)} KiB`;
}

export function formatDiagnosticLines(diag) {
  const lines = [];
  for (const row of diag.rows) {
    const flag = row.ok ? "✓" : "✗";
    lines.push(`${flag} ${row.key}: ${row.pct}${row.min ? ` (min ${row.min})` : ""}`);
  }
  lines.push(`LCP: ${fmtMs(diag.lcp)}`);
  lines.push(`FCP: ${fmtMs(diag.fcp)}`);
  lines.push(`TTFB: ${fmtMs(diag.ttfb)}`);
  lines.push(`CLS: ${diag.cls == null ? "n/a" : Number(diag.cls).toFixed(3)}`);
  lines.push(`TBT: ${fmtMs(diag.tbt)}`);
  lines.push(`INP: ${fmtMs(diag.inp)}`);
  lines.push(`Transfer: ${fmtKb(diag.transfer)}`);
  lines.push(`JS execution: ${fmtMs(diag.jsExecution)}`);
  if (diag.lcpElement) lines.push(`LCP element: ${diag.lcpElement}`);
  if (diag.lcpPhases) lines.push(`LCP phases: ${diag.lcpPhases}`);
  lines.push(`Unused JS: ${fmtKb(diag.unusedJs)}`);
  lines.push(`Unused CSS: ${fmtKb(diag.unusedCss)}`);
  if (diag.renderBlocking != null) lines.push(`Render-blocking: ${fmtMs(diag.renderBlocking)}`);
  if (diag.failedAudits.length) lines.push(`Failed audits: ${diag.failedAudits.join(", ")}`);
  if (diag.requestedUrl) lines.push(`Requested URL: ${diag.requestedUrl}`);
  if (diag.finalUrl) lines.push(`Final URL: ${diag.finalUrl}`);
  if (diag.runtimeError) lines.push(`Runtime error: ${diag.runtimeError}`);
  lines.push(`Threshold: performance >= ${diag.thresholds.performance}`);
  lines.push(`Actual score: ${diag.performance ?? "n/a"}`);
  lines.push(`Exit reason: ${diag.exitReason}`);
  return lines;
}

export function formatGithubSummary(diag) {
  const status = diag.failed ? "FAIL" : "PASS";
  const rows = diag.rows
    .map((r) => `| ${r.key} | ${r.pct} | ${r.min || "—"} | ${r.ok ? "PASS" : "FAIL"} |`)
    .join("\n");
  return [
    `## Lighthouse mobile — ${status}`,
    "",
    "| Category | Score | Min | Result |",
    "| --- | ---: | ---: | --- |",
    rows,
    "",
    `| Metric | Value |`,
    `| --- | --- |`,
    `| LCP | ${fmtMs(diag.lcp)} |`,
    `| TBT | ${fmtMs(diag.tbt)} |`,
    `| CLS | ${diag.cls == null ? "n/a" : Number(diag.cls).toFixed(3)} |`,
    `| TTFB | ${fmtMs(diag.ttfb)} |`,
    `| Transfer | ${fmtKb(diag.transfer)} |`,
    `| LCP element | ${diag.lcpElement ?? "n/a"} |`,
    `| Failed audits | ${diag.failedAudits.join(", ") || "none"} |`,
    `| Exit reason | ${diag.exitReason} |`,
    ""
  ].join("\n");
}

export function shouldFailProcess(diag, gated) {
  if (!diag.rows.length) return true;
  if (diag.runtimeError) return true;
  if (!gated) return false;
  return diag.failed;
}

function writeGithubSurfaces(diag) {
  const summary = process.env.GITHUB_STEP_SUMMARY;
  if (summary) {
    writeFileSync(summary, formatGithubSummary(diag), { flag: "a" });
  }
  if (diag.failed || diag.exitReason !== "ok") {
    const msg = [
      diag.exitReason,
      `performance ${diag.performance ?? "n/a"} (min ${diag.thresholds.performance})`,
      `LCP ${fmtMs(diag.lcp)}`,
      `TBT ${fmtMs(diag.tbt)}`,
      `CLS ${diag.cls == null ? "n/a" : Number(diag.cls).toFixed(3)}`,
      `TTFB ${fmtMs(diag.ttfb)}`,
      `transfer ${fmtKb(diag.transfer)}`,
      diag.lcpElement ? `LCP element ${diag.lcpElement}` : null,
      diag.failedAudits.length ? `audits ${diag.failedAudits.slice(0, 8).join(",")}` : null
    ]
      .filter(Boolean)
      .join("; ");
    console.error(`::error title=Lighthouse gate failed::${msg}`);
  }
}

export function chromeFlagsForEnv(env = process.env) {
  const flags = ["--headless=new"];
  if (env.CI === "true" || env.LIGHTHOUSE_CHROME_SANDBOX === "0") {
    flags.push("--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu");
  }
  return flags;
}

function isExecutedDirectly() {
  const self = fileURLToPath(import.meta.url);
  const invoked = process.argv[1] ? path.resolve(process.argv[1]) : "";
  return path.normalize(self) === path.normalize(invoked);
}

async function main() {
  const url = process.argv[2] ?? "http://localhost:3001";
  const gated = isGateEnabled();
  const thresholds = resolveThresholds();
  const dumpPath = process.env.LIGHTHOUSE_JSON ?? (process.env.GITHUB_ACTIONS === "true" ? "lighthouse-mobile-report.json" : "");

  let chrome;
  try {
    chrome = await chromeLauncher.launch({
      chromePath: process.env.CHROME_PATH || undefined,
      chromeFlags: chromeFlagsForEnv()
    });
  } catch (err) {
    const message = err instanceof Error ? err.stack ?? err.message : String(err);
    console.error("Chrome failed to launch.");
    console.error(message);
    console.error(`::error title=Lighthouse Chrome launch failed::${err instanceof Error ? err.message : String(err)}`);
    process.exitCode = 1;
    return;
  }

  try {
    const result = await lighthouse(url, {
      logLevel: "error",
      port: chrome.port,
      output: "json",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      settings: {
        formFactor: "mobile",
        throttlingMethod: "simulate",
        throttling: MOBILE_THROTTLING,
        screenEmulation: {
          mobile: true,
          width: 390,
          height: 844,
          deviceScaleFactor: 2,
          disabled: false
        }
      }
    });

    if (!result?.lhr) {
      console.error("Lighthouse produced no LHR.");
      console.error("::error title=Lighthouse produced no LHR::exit 1");
      process.exitCode = 1;
      return;
    }

    if (dumpPath) {
      writeFileSync(dumpPath, JSON.stringify(result.lhr, null, 0));
      console.log(`LHR written: ${dumpPath}`);
    }

    const diag = collectDiagnostics(result.lhr, thresholds);
    for (const line of formatDiagnosticLines(diag)) console.log(line);
    writeGithubSurfaces(diag);

    if (shouldFailProcess(diag, gated)) {
      console.error(`\nLighthouse gate failed: ${diag.exitReason}`);
      process.exitCode = 1;
    }
  } catch (err) {
    const message = err instanceof Error ? err.stack ?? err.message : String(err);
    console.error("Lighthouse threw before producing a report.");
    console.error(message);
    console.error(`::error title=Lighthouse crashed::${err instanceof Error ? err.message : String(err)}`);
    process.exitCode = 1;
  } finally {
    await chrome.kill();
  }
}

if (isExecutedDirectly()) {
  await main();
}
