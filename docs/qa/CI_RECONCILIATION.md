# CI Reconciliation — branch vs corrected

**Date:** 2026-09-11 (static). **Cursor 2026-09-12:** corrected workflow is on disk;
validator **0 errors**. GitHub Actions on the pushed SHA is the remaining proof.

## Result

| Workflow | Validator |
|---|---|
| As it exists on `feat/elite-os-v2` (remote `5b685cb`, 2026-09-11) | **9 errors** |
| Corrected (now in local `.github/workflows/ci.yml`) | **0 errors**, 0 warnings, 1 legitimate note |

## How the "before" was established

The dependency graph was extracted verbatim from GitHub's own view of the run
(`/actions/runs/34331702738/workflow`) — every job's `needs:` and `if:`, in order — and the
three textual differences were confirmed against
`raw.githubusercontent.com/.../feat/elite-os-v2/.github/workflows/ci.yml`. Nothing here is
inferred from a rendered status chip.

The branch graph:

```
lint-typecheck      needs: —
test-unit           needs: lint-typecheck
auth-prod-like      needs: lint-typecheck
android-wear        needs: —
test-coverage-gate  needs: test-unit
test-integration    needs: lint-typecheck
security-audit      needs: lint-typecheck
build               needs: [test-unit, test-coverage-gate, test-integration,
                            security-audit, auth-prod-like, android-wear]
test-e2e            needs: build
lighthouse-mobile   needs: build          if: main/master/feature/**
test-perf           needs: build          if: main/master
deploy-staging      needs: [test-e2e, test-perf]   if: main/master
                    (no release-gate)
```

**This graph predicts the observed run exactly.** `lint-typecheck` fails → `test-unit`,
`auth-prod-like`, `test-integration`, `security-audit` skip → `test-coverage-gate` skips →
`build` skips → `test-e2e`, `lighthouse-mobile`, `test-perf`, `deploy-staging` skip.
**Ten skipped**, which is what run `34331702738` reported. `android-wear` has no `needs`, so
it genuinely ran — which is why its Failed-vs-Succeeded ambiguity is a real unknown rather
than a skip.

## The nine errors on the branch

```
[dead-filter] --filter=!@fitconnect/mobile names a package that is not in the workspace.
              Turbo 2.x hard-fails on this, aborting before it compiles anything.
[cascade]     "test-unit" is SKIPPED if lint-typecheck fails
[cascade]     "test-coverage-gate" is SKIPPED if test-unit or lint-typecheck fails
[cascade]     "test-integration" is SKIPPED if lint-typecheck fails
[cascade]     "security-audit" is SKIPPED if lint-typecheck fails
[cascade]     "auth-prod-like" is SKIPPED if lint-typecheck fails
[soft-gate]   security-audit step "pnpm audit --audit-level high" sets continue-on-error
[soft-gate]   security-audit step "pnpm dlx semgrep …" sets continue-on-error
[gate-exists] no "release-gate" job — nothing aggregates the required results
```

Confirmed absent from the workspace: the package list is
`fitconnect, @fitconnect/web, ai, api-client, config, db, design-tokens, elite-core-wasm,
maps, realtime-client, strava-integration, types, utils, zenith-core`. No
`@fitconnect/mobile`.

## What the corrected workflow changes

| # | Change | Why |
|---|---|---|
| 1 | `pnpm exec turbo typecheck --filter=!@fitconnect/mobile` → `pnpm typecheck` | The filter names a package removed under ADR-005. Turbo 2.x treats that as a hard error, so the job died in ~0s before compiling anything. |
| 2 | `test-unit`, `auth-prod-like`, `test-integration`, `security-audit` lose `needs: lint-typecheck` | A typecheck regression must not destroy unrelated evidence. This is the single cause of the ten skipped jobs. |
| 3 | `test-coverage-gate` loses `needs: test-unit` | It runs `pnpm test:coverage`, which re-runs the suite itself and consumes no artifact from `test-unit`. The chain only meant a unit failure also erased the coverage evidence. |
| 4 | `build` loses its seven-job `needs` | "Does it compile?" is independent of "do the tests pass?". Chaining it is why the run ended with no build evidence at all. |
| 5 | `pnpm audit` → **blocking** `pnpm audit --audit-level critical --prod`; semgrep → **blocking** | Both ran under `continue-on-error: true` while being counted as a required PASS. Scoped to production criticals so the gate is real and achievable; the high surface is printed, not gated, because 22 advisories need triage rather than one switch. |
| 6 | `release-gate` added | `if: always()` to collect, then fail on any `needs.*.result != 'success'`. SKIPPED, CANCELLED and NOT RUN are all non-success. |

Changes 3 and 4 were **not** in the version delivered earlier — `scripts/ci-gate-lint.mjs`
found them in my own file. That is the point of having the validator rather than an opinion.

## `if: always()` — used to collect, never to pass

`release-gate` is the only job with `always()`, and it uses it the legitimate way: run
regardless so the verdict is always published, then inspect each result and exit 1 on
anything that is not `success`. The validator enforces this — a gate that never reads
`needs.*.result`, or never fails on a non-success, is an ERROR.

## Remaining note (accepted)

```
[cascade] "test-e2e" is SKIPPED if build fails. Deliberate: this job genuinely needs its
          upstream artifacts.
```

Playwright needs a built application. Keeping that edge is correct; the release gate still
counts a skipped `test-e2e` as non-success, so it cannot be mistaken for a pass.

## Running the validator

```bash
pnpm add -D yaml          # yaml@2.9.0 is already in the lockfile transitively, not declared
node scripts/ci-gate-lint.mjs
node scripts/ci-gate-lint.mjs --json
node scripts/ci-gate-lint.mjs .github/workflows/some-other.yml
```

Six checks: `dead-filter`, `cascade`, `soft-gate`, `gate-exists`, `gate-honest`,
`gate-complete`. Read-only; exits non-zero on any ERROR.

## What this does not prove

The corrected workflow is **statically** valid. It has not run. `pnpm typecheck`, `lint`,
`test`, `build`, E2E, Android and Wear remain **NOT RUN** — no shell on the repository this
session (`device_bash` is blocked by a Windows update of 2026-09-08; the platform's own
message notes Claude Code is unaffected).

Nothing has been committed or pushed either, so the branch still runs the broken workflow.
Applying the corrected `ci.yml` and pushing is the action that starts producing real
evidence — and the first green run will also need the uncommitted dependency changes
(`next` 15.5.25, `maplibre-gl` 6.9.0), since the now-blocking critical audit depends on them.
