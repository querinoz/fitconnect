#!/usr/bin/env node
/**
 * Fail if a Swift file in iosApp/ declares the same type twice, or concatenates
 * two source units (a top-level import after a closed type). That pattern made
 * Path A unbuildable on macOS while still looking "present" on Windows.
 *
 * Usage: node scripts/check-swift-duplicate-decls.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const iosRoot = path.join(root, "iosApp");

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else if (ent.name.endsWith(".swift")) acc.push(p);
  }
  return acc;
}

function duplicateDecls(src) {
  const names = [];
  const re =
    /^(?:public |private |internal |fileprivate )*(?:struct|class|enum|protocol|actor) (\w+)/gm;
  let m;
  while ((m = re.exec(src))) names.push(m[1]);
  const counts = {};
  for (const n of names) counts[n] = (counts[n] || 0) + 1;
  return Object.entries(counts).filter(([, c]) => c > 1);
}

function concatenatedImportAfterType(src) {
  const re = /\r?\n(?=import (?:Foundation|SwiftUI|Observation)\r?\n)/g;
  let m;
  while ((m = re.exec(src))) {
    const before = src.slice(0, m.index).trimEnd();
    if (before.endsWith("}")) return true;
  }
  return false;
}

function duplicateMain(src) {
  return (src.match(/@main\b/g) ?? []).length > 1;
}

if (!fs.existsSync(iosRoot)) {
  console.error("iosApp/ is missing");
  process.exit(1);
}

const files = walk(iosRoot);
const errors = [];
for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  const rel = path.relative(root, file).replaceAll("\\", "/");
  const dups = duplicateDecls(src);
  if (dups.length) {
    errors.push(`${rel}: duplicate types ${dups.map(([n, c]) => `${n}×${c}`).join(", ")}`);
  }
  if (duplicateMain(src)) {
    errors.push(`${rel}: more than one @main`);
  }
  if (concatenatedImportAfterType(src)) {
    errors.push(`${rel}: concatenated Swift unit (import after a closed type)`);
  }
}

if (errors.length) {
  console.error("Swift source uniqueness check failed:\n" + errors.map((e) => `  - ${e}`).join("\n"));
  process.exit(1);
}

console.log(`Swift source uniqueness OK (${files.length} files)`);
