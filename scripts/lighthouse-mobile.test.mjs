import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CI_DEFAULT_THRESHOLDS,
  chromeFlagsForEnv,
  collectDiagnostics,
  formatDiagnosticLines,
  isGateEnabled,
  resolveThresholds,
  scoreCategories,
  shouldFailProcess
} from "./lighthouse-mobile.mjs";

describe("lighthouse-mobile gate contract", () => {
  it("keeps the CI performance floor at 84", () => {
    assert.equal(CI_DEFAULT_THRESHOLDS.performance, 84);
    const thresholds = resolveThresholds({ CI: "true" });
    assert.equal(thresholds.performance, 84);
    assert.equal(thresholds.accessibility, 90);
    assert.equal(thresholds["best-practices"], 95);
    assert.equal(thresholds.seo, 95);
  });

  it("does not enable the gate outside CI unless LIGHTHOUSE_GATE=1", () => {
    assert.equal(isGateEnabled({}), false);
    assert.equal(isGateEnabled({ CI: "true" }), true);
    assert.equal(isGateEnabled({ LIGHTHOUSE_GATE: "1" }), true);
  });

  it("fails the process on score < 84 only when gated", () => {
    const thresholds = resolveThresholds({ CI: "true" });
    const cats = {
      performance: { score: 0.83 },
      accessibility: { score: 0.94 },
      "best-practices": { score: 1 },
      seo: { score: 1 }
    };
    const { failed, rows } = scoreCategories(cats, thresholds);
    assert.equal(failed, true);
    assert.equal(rows.find((r) => r.key === "performance")?.pct, 83);
    const diag = collectDiagnostics({ categories: cats, audits: {} }, thresholds);
    assert.equal(shouldFailProcess(diag, true), true);
    assert.equal(shouldFailProcess(diag, false), false);
    assert.match(diag.exitReason, /performance 83 < min 84/);
  });

  it("passes at exactly 84", () => {
    const thresholds = resolveThresholds({ CI: "true" });
    const cats = {
      performance: { score: 0.84 },
      accessibility: { score: 0.9 },
      "best-practices": { score: 0.95 },
      seo: { score: 0.95 }
    };
    const diag = collectDiagnostics({ categories: cats, audits: {} }, thresholds);
    assert.equal(diag.failed, false);
    assert.equal(shouldFailProcess(diag, true), false);
    assert.equal(diag.exitReason, "ok");
  });

  it("prints the diagnostics the CI log must expose", () => {
    const thresholds = resolveThresholds({ CI: "true" });
    const lhr = {
      requestedUrl: "http://127.0.0.1:3001/",
      finalUrl: "http://127.0.0.1:3001/",
      categories: {
        performance: {
          score: 0.8,
          auditRefs: [{ id: "largest-contentful-paint" }, { id: "unused-javascript" }]
        },
        accessibility: { score: 0.94, auditRefs: [] },
        "best-practices": { score: 1, auditRefs: [] },
        seo: { score: 1, auditRefs: [] }
      },
      audits: {
        "largest-contentful-paint": { numericValue: 4120, score: 0.4 },
        "total-blocking-time": { numericValue: 88, score: 1 },
        "cumulative-layout-shift": { numericValue: 0.012, score: 1 },
        "server-response-time": { numericValue: 140, score: 1 },
        "total-byte-weight": { numericValue: 384000, score: 1 },
        "unused-javascript": { numericValue: 12000, score: 0.5 },
        "largest-contentful-paint-element": {
          details: { items: [{ node: { snippet: "<p class=\"hero-sub\">A FitConnect</p>" } }] }
        }
      }
    };
    const diag = collectDiagnostics(lhr, thresholds);
    const text = formatDiagnosticLines(diag).join("\n");
    assert.match(text, /performance: 80 \(min 84\)/);
    assert.match(text, /accessibility: 94/);
    assert.match(text, /best-practices: 100/);
    assert.match(text, /seo: 100/);
    assert.match(text, /LCP: 4120 ms/);
    assert.match(text, /TBT: 88 ms/);
    assert.match(text, /CLS: 0.012/);
    assert.match(text, /TTFB: 140 ms/);
    assert.match(text, /Transfer: 375 KiB/);
    assert.match(text, /LCP element: <p class="hero-sub">A FitConnect<\/p>/);
    assert.match(text, /Failed audits: largest-contentful-paint, unused-javascript/);
    assert.match(text, /Threshold: performance >= 84/);
    assert.match(text, /Actual score: 80/);
    assert.match(text, /Exit reason: performance 80 < min 84/);
  });

  it("adds no-sandbox Chrome flags in CI without dropping headless", () => {
    const flags = chromeFlagsForEnv({ CI: "true" });
    assert.ok(flags.includes("--headless=new"));
    assert.ok(flags.includes("--no-sandbox"));
    assert.ok(flags.includes("--disable-dev-shm-usage"));
  });
});
