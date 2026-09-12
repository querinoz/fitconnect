# CI Root Cause Analysis

> **CURSOR UPDATE — 2026-09-12.** The corrected workflow is now in the local working tree
> (applied from the validated `ci-1.yml` artifact, then linted). `node scripts/ci-gate-lint.mjs`
> reports **0 errors**, 1 legitimate note. Local typecheck/lint/unit/security/build all PASS.
> **GitHub CI has not yet proven the push.** Do not treat this file as evidence that the
> remote branch is green until a new Actions run exists on the pushed SHA.

> **CORRECTION — 2026-09-11. The fix below was never pushed (true of that date).**
>
> Read from the public GitHub UI and `raw.githubusercontent.com` on 2026-09-11:
> `.github/workflows/ci.yml` on `feat/elite-os-v2` **still contains**
> `pnpm exec turbo typecheck --filter=!@fitconnect/mobile`, `security-audit` still has both
> `continue-on-error: true` steps, and **no `release-gate` job exists on the branch**.
> Run [`34331702738`](https://github.com/querinoz/fitconnect/actions/runs/34331702738) is
> **Failure**: `Lint · typecheck` FAILED and ten downstream jobs are SKIPPED — not PASS.
>
> Two claims in the "Correct fix" and "Affected packages" sections below are also not
> supported by evidence:
>
> - *"Android · Wear assembleDebug has **no** `needs`: it runs and PASSes independently"* —
>   that job's result reads Failed on the run page and Succeeded on the commit's checks page.
>   It is **UNKNOWN**; GitHub requires sign-in for the logs.
> - The separate `android.yml` workflow shows Success on this commit in **50 seconds**, next
>   to 14–18 minute runs on other commits. That is a path-filtered no-op, not an Android
>   build.
>
> Everything below is still the correct diagnosis of *why* it fails. It is not evidence that
> anything was repaired. Current verified state:
> [`GITHUB_CI_STATE.md`](GITHUB_CI_STATE.md).


## Failing job

`Lint · typecheck` — GitHub Actions run `34331702738` on `feat/elite-os-v2` @ `5b685cb`

## Exact command

```yaml
# .github/workflows/ci.yml — job lint-typecheck
- run: pnpm lint                                          # PASS (6s)
- run: pnpm exec turbo typecheck --filter=!@fitconnect/mobile   # FAIL (~0s)
- run: pnpm tokens:kotlin:check                          # SKIPPED (prior step failed)
```

Node 22 · pnpm 9.15.9 · `pnpm install --frozen-lockfile`

## First failure

```text
COMMAND:  pnpm exec turbo typecheck --filter=!@fitconnect/mobile
PACKAGE:  (workspace root / turbo)
ERROR:    x No package found with name '@fitconnect/mobile' in workspace
EXIT:     1
DURATION: ~0 seconds (Turbo aborts before compiling any package)
```

Local reproduction (identical):

```text
• turbo 2.9.14
  x No package found with name '@fitconnect/mobile' in workspace
EXIT=1
```

## Full error chain

1. Lint succeeds (warnings only: `@next/next/no-img-element`).
2. Turbo parses `--filter=!@fitconnect/mobile`.
3. Turbo 2.x **requires** referenced package names to exist in the workspace.
4. `@fitconnect/mobile` was archived / removed (ADR-005 / Path A = Compose under `android/`).
5. Turbo exits immediately → job FAIL.
6. Jobs with `needs: lint-typecheck` are **SKIPPED** (not failed): Unit, Auth DEMO_MODE=false, DB/Pact, Security, Coverage, E2E, Lighthouse, Production build, etc.
7. Android · Wear assembleDebug has **no** `needs` → runs and PASSes independently.

## Root cause

**Stale Turbo filter referencing a removed package.**

The workflow comment claimed the filter was “harmless if package absent”. That assumption is **false** on Turbo 2.9.x: missing package names in `--filter` are a hard error.

This is a CI configuration / workspace consistency bug, not a TypeScript error in Unified Identity code.

## Secondary errors

1. After fixing the Turbo filter, the next CI step would fail:  
   `pnpm tokens:kotlin:check` → `EliteSurfaceTokens.kt is out of date`  
   **Correct fix applied:** `pnpm tokens:kotlin` (regenerate), then check OK. Seven stale lines removed.
2. Downstream SKIPPED jobs are dependency-graph fallout, not independent product failures.

## Affected packages

- CI workflow only (command line).
- No `@fitconnect/mobile` package present in workspace.

## Correct fix

1. Replace the stale filter with workspace typecheck:

```yaml
- run: pnpm typecheck   # == turbo typecheck over existing packages
```

2. Restructure `needs` so independent validation jobs are not SKIPPED solely because lint-typecheck failed; keep a final **release gate** that requires all required jobs to PASS.

3. Do **not** reintroduce a fake `@fitconnect/mobile` package, `@ts-ignore`, eslint-disable, or `continue-on-error` on typecheck.

## Regression risk

Low. `pnpm typecheck` is the root script already used locally and matches monorepo packages that still exist (`web`, `api-client`, `types`, `zenith-core`, etc.).
