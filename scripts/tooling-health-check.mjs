/**
 * Tooling health check. Prints names/status only — never secret values.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function which(cmd) {
  const probe = process.platform === "win32" ? "where" : "which";
  const r = spawnSync(probe, [cmd], { encoding: "utf8" });
  return r.status === 0;
}

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
}

const requiredFiles = [
  ".cursor/rules/00-tooling-governance.mdc",
  ".cursor/rules/01-product-architecture.mdc",
  ".cursor/rules/02-ux-benchmark.mdc",
  ".cursor/rules/03-web-quality.mdc",
  ".cursor/rules/04-android-quality.mdc",
  ".cursor/rules/05-ios-quality.mdc",
  ".cursor/rules/06-ai-mcp-security.mdc",
  ".cursor/rules/07-release-gates.mdc",
  ".cursor/tooling-inventory.md",
  ".cursor/tooling-policy.json",
  ".cursor/mcp/inventory.json",
  ".mcp.json",
  "AGENTS.md"
];

const missing = requiredFiles.filter((f) => !exists(f));
const mcp = exists(".mcp.json") ? readJson(".mcp.json") : { mcpServers: {} };
const policy = exists(".cursor/tooling-policy.json")
  ? readJson(".cursor/tooling-policy.json")
  : null;

const platform = os.platform();
const iosSimulator = platform === "darwin";

const tools = {
  node: which("node"),
  pnpm: which("pnpm"),
  git: which("git"),
  gh: which("gh"),
  adb: which("adb"),
  java: which("java"),
  maestro: which("maestro"),
  xcodebuild: which("xcodebuild")
};

const mcpNames = Object.keys(mcp.mcpServers ?? {});

console.log("FitConnect tooling health");
console.log(`platform: ${platform} (${iosSimulator ? "ios-simulator-possible" : "ios-simulator-unavailable"})`);
console.log(`required files missing: ${missing.length ? missing.join(", ") : "none"}`);
console.log(
  `cli: node=${tools.node} pnpm=${tools.pnpm} git=${tools.git} gh=${tools.gh} adb=${tools.adb} java=${tools.java} maestro=${tools.maestro} xcodebuild=${tools.xcodebuild}`
);
console.log(`mcp servers configured: ${mcpNames.join(", ") || "(none)"}`);
console.log(
  `policy: useEverything=${policy?.policy?.useEverythingMeans ?? "unset"} expoAndroidUi=${policy?.policy?.expoAndroidUi} terraCore=${policy?.policy?.terraSpikeRookCore}`
);

if (process.env.VERCEL_TOKEN) {
  console.log("vercel token: present (length omitted)");
} else {
  console.log("vercel token: not in this shell (GitHub production env is the source of truth)");
}

if (missing.length) {
  process.exit(1);
}
