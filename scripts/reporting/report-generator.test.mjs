import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildWhatsAppSummary,
  classifyWhatsAppReadiness,
  loadWhatsAppEnv
} from "./report-generator.mjs";

describe("report-generator", () => {
  it("builds a concise summary without local disk paths", () => {
    const text = buildWhatsAppSummary({
      phase: "PHASE 17",
      overall: "BLOCKED",
      repository: "PASS",
      android: "PASS",
      webApp: "PASS",
      landing: "PASS",
      watchos: "PENDING_ENVIRONMENT",
      tests: "2/2",
      build: "PASS",
      emulator: "BLOCKED",
      obsoleteFilesRemoved: 12,
      duplicateComponentsMerged: 0,
      securityFindings: 2,
      pendingHuman: ["WhatsApp Business credentials"],
      reportRepoPath: "docs/phase-17/PHASE_17_FINAL_REPORT.md"
    });
    assert.match(text, /FITCONNECT — PHASE 17/);
    assert.match(text, /STATUS: BLOCKED/);
    assert.doesNotMatch(text, /D:\\/i);
    assert.doesNotMatch(text, /C:\\/i);
    assert.doesNotMatch(text, /ACCESS_TOKEN/);
  });

  it("classifies missing official credentials as not ready", () => {
    const cfg = loadWhatsAppEnv({});
    const ready = classifyWhatsAppReadiness(cfg);
    assert.equal(ready.ok, false);
  });
});
