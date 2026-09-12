#!/usr/bin/env node
/**
 * Lint the CI workflow for the failure modes that actually bit this repository.
 *
 * Why this exists: on 2026-09-11 the workflow on `feat/elite-os-v2` produced a run where
 * `Lint · typecheck` FAILED and **ten** other jobs were SKIPPED — no unit, build, security
 * or E2E evidence at all — while `docs/qa/CI_ROOT_CAUSE_ANALYSIS.md` described the fix as
 * applied. A skipped job is not a passing job, and a workflow can look healthy while
 * proving nothing. These six checks encode that lesson:
 *
 *   1. dead-filter      no `--filter=!<pkg>` naming a package absent from the workspace
 *                       (Turbo 2.x hard-fails on it, which is what broke lint-typecheck)
 *   2. cascade          no required job can be SKIPPED by one other job failing
 *   3. soft-gate        no `continue-on-error` on a step inside a required job
 *   4. gate-exists      a release gate exists and aggregates the required jobs
 *   5. gate-honest      the gate inspects each result and fails on anything but success
 *   6. gate-complete    every job the gate needs exists, and every required job is needed
 *   7. gate-coverage    every job in the workflow is either aggregated by the gate or
 *                       explicitly acknowledged as ungated, with a reason. Added after
 *                       CI #39 on 1780b09: the run's conclusion was FAILURE because
 *                       `lighthouse-mobile` failed, while `Release gate` reported
 *                       SUCCESS — the gate was honest about the nine jobs it aggregates
 *                       and silent about the one it does not. A forgotten job is the
 *                       same lie as a soft gate, reached by omission instead of by
 *                       `continue-on-error`.
 *
 * Read-only. Exits non-zero on any ERROR.
 *
 * Usage:
 *   node scripts/ci-gate-lint.mjs [.github/workflows/ci.yml]
 *   node scripts/ci-gate-lint.mjs --json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const asJson = args.includes("--json");
const file = args.find((a) => !a.startsWith("--")) ?? ".github/workflows/ci.yml";
const abs = path.isAbsolute(file) ? file : path.join(root, file);

/**
 * Jobs whose result must be real evidence before a release. Conditional jobs
 * (lighthouse, k6, deploy-staging) are deliberately absent: they are branch-gated, so
 * requiring them would make the gate unsatisfiable on a feature branch.
 */
const REQUIRED_JOBS = [
  "lint-typecheck",
  "test-unit",
  "test-coverage-gate",
  "test-integration",
  "security-audit",
  "auth-prod-like",
  "android-wear",
  "build",
  "test-e2e",
  // Aggregated since 2026-09-12. Branch-conditional, so the gate accepts success OR skipped
  // for it -- but never failure. See the release-gate step.
  "lighthouse-mobile"
];

/**
 * Jobs deliberately left outside the gate, each with the reason it is acceptable.
 * A job that is neither required nor listed here is an ERROR: it can fail the
 * workflow while the gate still reports PASS, and nobody decided that.
 *
 * `lighthouse-mobile` used to be listed here. It is now aggregated by the gate instead:
 * commit a727bc2 widened its `if:` to feat/**, so it runs -- and can fail -- on the working
 * branch, and CI #39 duly ended in FAILURE while the gate reported SUCCESS. The gate accepts
 * `skipped` for it (correct when the branch filter excludes it) but never `failure`.
 */
const ACKNOWLEDGED_UNGATED = {
  "test-perf":
    "k6 smoke is main/master-only, so requiring it would make the gate unsatisfiable on a feature branch",
  "deploy-staging":
    "main/master-only deploy step, and it smokes a deployed environment rather than this commit"
};

const GATE_JOB = "release-gate";

function workspacePackageNames() {
  const names = new Set();
  const add = (p) => {
    try {
      const j = JSON.parse(fs.readFileSync(p, "utf8"));
      if (j.name) names.add(j.name);
    } catch {
      /* not a readable package.json — ignore */
    }
  };
  add(path.join(root, "package.json"));
  for (const dir of ["apps", "packages"]) {
    const base = path.join(root, dir);
    if (!fs.existsSync(base)) continue;
    for (const entry of fs.readdirSync(base)) {
      add(path.join(base, entry, "package.json"));
    }
  }
  return names;
}

/** Transitive `needs` closure for a job. */
function closure(jobs, name, seen = new Set()) {
  const raw = jobs[name]?.needs;
  const list = raw === undefined ? [] : Array.isArray(raw) ? raw : [raw];
  for (const dep of list) {
    if (seen.has(dep)) continue;
    seen.add(dep);
    closure(jobs, dep, seen);
  }
  return seen;
}

const findings = [];
const add = (severity, check, detail) => findings.push({ severity, check, detail });

if (!fs.existsSync(abs)) {
  console.error(`workflow not found: ${abs}`);
  process.exit(2);
}
const text = fs.readFileSync(abs, "utf8");
let doc;
try {
  doc = YAML.parse(text);
} catch (err) {
  console.error("workflow is not valid YAML:", err instanceof Error ? err.message : err);
  process.exit(2);
}
const jobs = doc?.jobs ?? {};
const jobNames = Object.keys(jobs);

// 1. dead Turbo filter
const pkgNames = workspacePackageNames();
for (const m of text.matchAll(/--filter=!([@a-z0-9/._-]+)/gi)) {
  const pkg = m[1];
  if (pkgNames.size === 0) {
    add("WARN", "dead-filter", `--filter=!${pkg} found, but no workspace package.json was readable to confirm it exists`);
  } else if (!pkgNames.has(pkg)) {
    add(
      "ERROR",
      "dead-filter",
      `--filter=!${pkg} names a package that is not in the workspace. Turbo 2.x hard-fails on this, aborting before it compiles anything.`
    );
  }
}

// 2. cascade — would one job failing skip a required one?
for (const req of REQUIRED_JOBS) {
  if (!jobs[req]) {
    add("ERROR", "gate-complete", `required job "${req}" does not exist in this workflow`);
    continue;
  }
  const deps = [...closure(jobs, req)].filter((d) => d !== req);
  const upstreamRequired = deps.filter((d) => REQUIRED_JOBS.includes(d));
  if (upstreamRequired.length > 0) {
    const severity =
      req === "build" || req === "test-e2e" || req === "lighthouse-mobile" ? "INFO" : "ERROR";
    add(
      severity,
      "cascade",
      `"${req}" is SKIPPED if any of [${upstreamRequired.join(", ")}] fails. ` +
        (severity === "ERROR"
          ? "Independent evidence must not be lost to an unrelated failure — drop the `needs`."
          : "Deliberate: this job genuinely needs its upstream artifacts.")
    );
  }
}

// 3. soft gates inside required jobs
for (const name of [...REQUIRED_JOBS, GATE_JOB]) {
  const job = jobs[name];
  if (!job) continue;
  if (job["continue-on-error"] === true) {
    add("ERROR", "soft-gate", `job "${name}" sets continue-on-error: true — its failure would be reported as success`);
  }
  for (const [i, step] of (job.steps ?? []).entries()) {
    if (step?.["continue-on-error"] === true) {
      const label = step.name ?? step.run ?? `step ${i + 1}`;
      add(
        "ERROR",
        "soft-gate",
        `job "${name}", step "${String(label).split("\n")[0].slice(0, 60)}" sets continue-on-error: true inside a required job`
      );
    }
  }
}

// 4 + 5. the gate exists and is honest
const gate = jobs[GATE_JOB];
if (!gate) {
  add("ERROR", "gate-exists", `no "${GATE_JOB}" job — nothing aggregates the required results, so a red workflow has no single source of truth`);
} else {
  const gateText = YAML.stringify(gate);
  const inspectsResults = /needs\.\*\.result|needs\.[a-z0-9_-]+\.result/i.test(gateText);
  const failsOnNonSuccess = /!=\s*['"]?success|exit 1/i.test(gateText);
  if (!inspectsResults) {
    add("ERROR", "gate-honest", `"${GATE_JOB}" never reads needs.*.result — it cannot tell SUCCESS from SKIPPED`);
  }
  if (!failsOnNonSuccess) {
    add("ERROR", "gate-honest", `"${GATE_JOB}" never fails on a non-success result — it is decorative`);
  }
  if (gate.if && !/always\(\)/.test(String(gate.if))) {
    add(
      "WARN",
      "gate-honest",
      `"${GATE_JOB}" has if: ${gate.if} — without always() the gate is itself skipped when an upstream job fails, hiding the verdict`
    );
  }

  // 6. completeness, both directions
  const needs = Array.isArray(gate.needs) ? gate.needs : gate.needs ? [gate.needs] : [];
  for (const n of needs) {
    if (!jobs[n]) add("ERROR", "gate-complete", `"${GATE_JOB}" needs "${n}", which does not exist`);
  }
  for (const req of REQUIRED_JOBS) {
    if (jobs[req] && !needs.includes(req)) {
      add("ERROR", "gate-complete", `required job "${req}" exists but "${GATE_JOB}" does not aggregate it`);
    }
  }
}

// 7. gate-coverage — no job may be silently outside the gate
if (gate) {
  const needs = Array.isArray(gate.needs) ? gate.needs : gate.needs ? [gate.needs] : [];
  for (const name of jobNames) {
    if (name === GATE_JOB || needs.includes(name)) continue;
    const reason = ACKNOWLEDGED_UNGATED[name];
    if (reason) {
      add("INFO", "gate-coverage", `"${name}" is outside the gate by decision: ${reason}`);
    } else {
      add(
        "ERROR",
        "gate-coverage",
        `job "${name}" is neither aggregated by "${GATE_JOB}" nor listed in ACKNOWLEDGED_UNGATED. ` +
          `It can fail the workflow while the gate still reports PASS. Either add it to the gate, ` +
          `or record why it is exempt.`
      );
    }
  }
}

// `if: always()` anywhere other than the aggregator deserves a look
for (const name of jobNames) {
  if (name === GATE_JOB) continue;
  if (/always\(\)/.test(String(jobs[name]?.if ?? ""))) {
    add("WARN", "gate-honest", `job "${name}" runs with always() — confirm it collects results rather than converting failure into success`);
  }
}

const errors = findings.filter((f) => f.severity === "ERROR");
const warns = findings.filter((f) => f.severity === "WARN");
const infos = findings.filter((f) => f.severity === "INFO");

if (asJson) {
  console.log(JSON.stringify({ file, jobs: jobNames.length, findings }, null, 2));
} else {
  console.log(`\nCI gate lint — ${file}`);
  console.log(`${jobNames.length} jobs: ${jobNames.join(", ")}\n`);
  for (const group of ["ERROR", "WARN", "INFO"]) {
    const rows = findings.filter((f) => f.severity === group);
    if (!rows.length) continue;
    console.log(`${group} (${rows.length})`);
    for (const f of rows) console.log(`  [${f.check}] ${f.detail}`);
    console.log("");
  }
  if (!findings.length) console.log("  all six checks clean.\n");
  console.log(`${errors.length} error(s), ${warns.length} warning(s), ${infos.length} note(s)\n`);
}

process.exit(errors.length > 0 ? 1 : 0);
