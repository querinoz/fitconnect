#!/usr/bin/env node
/**
 * Bounded `vercel build --prod` with classified retries.
 * Docker hostname `base` is DETERMINISTIC — never retried.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { backoffMs, classifyVercelBuildLog } from "./classify-vercel-build-failure.mjs";

const MAX_ATTEMPTS = 3;
const cli = process.env.VERCEL_CLI?.trim() || "59.16.0";
const logPath = path.join(os.tmpdir(), "vercel-build.log");

function redact(text) {
  return String(text).replace(/[A-Za-z0-9_\-]{24,}/g, "[redacted]");
}

function sleepMs(ms) {
  if (process.platform === "win32") {
    spawnSync("powershell", ["-NoProfile", "-Command", `Start-Sleep -Milliseconds ${ms}`], {
      stdio: "ignore"
    });
    return;
  }
  spawnSync("sleep", [String(Math.max(1, Math.ceil(ms / 1000)))], { stdio: "ignore" });
}

function logDiagnostics({ attempt, classification, code }) {
  const bits = [
    `attempt=${attempt}/${MAX_ATTEMPTS}`,
    `exit=${code}`,
    `class=${classification.kind}`,
    `retry=${classification.retry}`,
    `reason=${classification.reason}`,
    `envClass=vercel-prebuild`,
    `ci=${process.env.CI === "true"}`,
    `vercel=${process.env.VERCEL === "1"}`
  ];
  if (classification.hostname) bits.push(`hostname=${classification.hostname}`);
  console.log(`vercel-build: ${bits.join(" ")}`);
}

let lastCode = 1;
for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
  const result = spawnSync("npx", ["--yes", `vercel@${cli}`, "build", "--prod", "--yes"], {
    encoding: "utf8",
    env: process.env,
    shell: process.platform === "win32"
  });
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  fs.writeFileSync(logPath, output);
  lastCode = result.status ?? 1;
  if (lastCode === 0) {
    console.log(`vercel-build: attempt ${attempt} succeeded`);
    const excerpt = redact(output)
      .split(/\r?\n/)
      .filter((ln) => /Error:|Compiled|Build|✅|warn/.test(ln))
      .slice(-30)
      .join("\n");
    if (excerpt) console.log(excerpt);
    process.exit(0);
  }

  const classification = classifyVercelBuildLog(output);
  logDiagnostics({ attempt, classification, code: lastCode });

  if (!classification.retry || attempt === MAX_ATTEMPTS) {
    console.error("----- vercel build tail (redacted) -----");
    console.error(redact(output).split(/\r?\n/).slice(-60).join("\n"));
    console.error(
      `::error::vercel build failed (exit ${lastCode}). ${classification.kind}: ${classification.reason}`
    );
    process.exit(lastCode);
  }

  const wait = backoffMs(attempt);
  console.log(`::warning::transient vercel build failure; waiting ${wait}ms before attempt ${attempt + 1}`);
  sleepMs(wait);
}

process.exit(lastCode);
