#!/usr/bin/env node
/**
 * Token migration codemod — scans for hardcoded hex and legacy class patterns.
 *
 * Usage:
 *   node scripts/codemod-tokens.mjs --report     # human-readable report (default)
 *   node scripts/codemod-tokens.mjs --dry-run      # list files that would change
 *   node scripts/codemod-tokens.mjs --write        # apply safe auto-fixes only
 *
 * Safe auto-fixes (--write):
 *   - bg-ink-950 → bg-eos-floor (in marketing/landing only)
 *   - bg-volt-500 → bg-eos-voltline (progress bars)
 *
 * Does NOT blindly replace hex — flags for human review per ADR-001 exemptions.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCAN_DIRS = [
  "apps/web/components",
  "apps/web/app",
  "apps/mobile/components",
  "apps/mobile/app"
];

const EXEMPT_FILES = [
  "lang-picker.tsx",
  "strava-activity-map.tsx",
  "celebration-ribbon.tsx",
  "atmosphere.tsx"
];

const HEX_RE = /#([0-9a-fA-F]{3,8})\b/g;
const LEGACY_CLASS_RE = /\b(bg-ink-950|bg-volt-500|text-volt-300)\b/g;

const SAFE_REPLACEMENTS = [
  [/(\b)bg-ink-950(\b)/g, "$1bg-eos-floor$2"],
  [/(\b)bg-volt-500(\b)/g, "$1bg-eos-voltline$2"]
];

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory() && ent.name !== "node_modules" && ent.name !== ".next") {
      walk(full, acc);
    } else if (/\.(tsx?|jsx?|css)$/.test(ent.name)) {
      acc.push(full);
    }
  }
  return acc;
}

function isExempt(file) {
  return EXEMPT_FILES.some((e) => file.endsWith(e));
}

function analyzeFile(file) {
  const rel = path.relative(ROOT, file);
  const content = fs.readFileSync(file, "utf8");
  const hexMatches = [...content.matchAll(HEX_RE)].map((m) => m[0]);
  const legacyMatches = [...content.matchAll(LEGACY_CLASS_RE)].map((m) => m[0]);
  return { rel, hexMatches, legacyMatches, content };
}

const mode = process.argv.includes("--write")
  ? "write"
  : process.argv.includes("--dry-run")
    ? "dry-run"
    : "report";

const files = SCAN_DIRS.flatMap((d) => walk(path.join(ROOT, d)));
const findings = [];
let fixed = 0;

for (const file of files) {
  const { rel, hexMatches, legacyMatches, content } = analyzeFile(file);
  if (isExempt(file)) continue;

  if (hexMatches.length || legacyMatches.length) {
    findings.push({ rel, hex: [...new Set(hexMatches)], legacy: [...new Set(legacyMatches)] });
  }

  if (mode === "write" && legacyMatches.length && /landing|hero-gate/.test(rel)) {
    let next = content;
    for (const [re, rep] of SAFE_REPLACEMENTS) {
      next = next.replace(re, rep);
    }
    if (next !== content) {
      fs.writeFileSync(file, next);
      fixed++;
    }
  }
}

console.log(`\n🔍 Token codemod — mode: ${mode}`);
console.log(`   Scanned ${files.length} files\n`);

if (findings.length === 0) {
  console.log("✅ No legacy hex or class patterns found.\n");
} else {
  console.log(`⚠️  ${findings.length} files need review:\n`);
  for (const f of findings.slice(0, 50)) {
    console.log(`  ${f.rel}`);
    if (f.hex.length) console.log(`    hex: ${f.hex.join(", ")}`);
    if (f.legacy.length) console.log(`    legacy classes: ${f.legacy.join(", ")}`);
  }
  if (findings.length > 50) console.log(`  … and ${findings.length - 50} more`);
  console.log("");
}

if (mode === "write") {
  console.log(`✏️  Applied safe fixes to ${fixed} file(s).\n`);
}

console.log("Exemptions documented in docs/adr/ADR-001-token-unification.md\n");
process.exit(findings.length && mode === "report" ? 0 : 0);
