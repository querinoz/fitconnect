# GitHub CI — Verified State

**Read 2026-09-11** from the public GitHub web UI and `raw.githubusercontent.com`.
Read-only; no clone, no execution. The repository is public, so this needed no credentials.

## Headline

> **CI is RED at the tip of `feat/elite-os-v2`, and the fix this repository's own docs
> describe as "applied" was never pushed.**

`docs/qa/CI_ROOT_CAUSE_ANALYSIS.md` and `docs/qa/MOBILE_FULL_QA_REPORT.md` both present the
Turbo-filter fix as done. It exists only in the local working tree. The branch on GitHub
still has the broken workflow.

## What the run page says

Run [`34331702738`](https://github.com/querinoz/fitconnect/actions/runs/34331702738),
commit `5b685cb8f706e355d5a9c8a0c495837b4c415e24`
("fix(android): allow physical QA API base URL override for debug APK"):

| Job | Result |
|---|---|
| **Lint · typecheck** | **FAILED** |
| Unit tests (web) | SKIPPED |
| Auth · DEMO_MODE=false | SKIPPED |
| Integration · DB · Pact | SKIPPED |
| Security audit | SKIPPED |
| Coverage gate | SKIPPED |
| Production build | SKIPPED |
| Playwright E2E | SKIPPED |
| Lighthouse mobile gate | SKIPPED |
| k6 smoke | SKIPPED |
| Deploy staging smoke | SKIPPED |
| Android · Wear assembleDebug | **CONTRADICTORY — see below** |

Overall conclusion: **Failure**.

**SKIPPED is not PASS.** There is therefore no unit-test, build, security-audit or E2E
evidence on GitHub either — the same gaps this session reports locally, for the same reason.

## Why it failed — confirmed from the pushed file, not inferred

`raw.githubusercontent.com/querinoz/fitconnect/feat/elite-os-v2/.github/workflows/ci.yml`
still contains, in `lint-typecheck`:

```yaml
    - run: pnpm exec turbo typecheck --filter=!@fitconnect/mobile
```

Turbo 2.x hard-fails on a `--filter` naming a package that is not in the workspace, and
`@fitconnect/mobile` was removed under ADR-005. That is exactly the root cause
`CI_ROOT_CAUSE_ANALYSIS.md` diagnosed — still live on the branch.

The same file also still has:

```yaml
  security-audit:
    needs: lint-typecheck
    ...
    - run: pnpm audit --audit-level high
      continue-on-error: true
    - run: pnpm dlx semgrep --config p/typescript --error --quiet .
      continue-on-error: true
```

and **no `release-gate` job exists on the branch at all**. The release gate reviewed in
earlier sessions is a local-only file.

## One thing that is genuinely unclear

`Android · Wear assembleDebug` reads **Failed** on the run page and **Succeeded (4m 6s)** on
the commit's checks page. GitHub renders those status chips client-side and the fetch layer
here reads them inconsistently; the checks page itself states *"Full logs and detailed check
results require sign-in."*

So its result is **UNKNOWN**, and it is recorded that way rather than picked. It matters:
`CI_ROOT_CAUSE_ANALYSIS.md` asserts this job "has **no** `needs` … runs and PASSes
independently". That assertion has no evidence behind it either way. Someone signed in
should open the run and read the job.

## `android.yml` is not Android build evidence

The separate `android (Kotlin)` workflow shows Success on the same commit — **in 50
seconds**:

| Run | SHA | Result | Duration |
|---|---|---|---|
| 26 | `5b685cb` | Success | **50s** |
| 25 | `efec794` | Success | **44s** |
| 24 | `11c6e26` | Success | 18m 3s |
| 23 | `8146b04` | Success | 14m 49s |
| 22 | `5988cb8` | Success | **42s** |

A Gradle `lint · unit tests · assemble` does not finish in 50 seconds. `ci.yml`'s own comment
says this workflow is path-filtered. The 42–50s runs are almost certainly no-ops that exited
before doing work, and the 14–18 minute runs are the real ones.

**Do not read run #26 as an Android build PASS.** Android build state remains NOT RUN.

## The unblock

One file. `.github/workflows/ci.yml` cannot be written by this session's tools (protected
path), so the patched version was delivered into the chat. Applying it:

1. replaces the stale filter with `pnpm typecheck`;
2. uncouples the independent jobs from `needs: lint-typecheck`, so a typecheck regression
   stops skipping the unit, auth, integration and security evidence;
3. makes `pnpm audit --audit-level critical --prod` and semgrep **blocking** instead of
   `continue-on-error`;
4. adds the `release-gate` aggregator that fails the workflow unless every required job
   actually succeeded — never treating SKIPPED as PASS.

Expect the first green run to also require the dependency changes currently sitting
uncommitted in the working tree (`next` 15.5.25, `maplibre-gl` 6.9.0) — those are what make
the now-blocking critical audit pass.

## Also confirmed: the working tree is not pushed

`raw.githubusercontent.com/.../feat/elite-os-v2/package.json` shows:

```json
"overrides": {
  "next": "^15.1.0",
  ...
}
```

The branch does **not** carry the `^15.5.24` override. Every change made across these
sessions — migrations `023`–`029`, the Strava token-encryption fix and its 8 passing tests,
the two log redactions, the dependency bumps, all the documentation — is on local disk and
unpushed. Nothing has been committed, because no session has had git.

## Method

| Route | Result |
|---|---|
| `git ls-remote` | works — repository is public and reachable |
| `git clone` into the container | refused by the *Untrusted Code Integration* guardrail; not worked around |
| `api.github.com` | HTTP 403 from this network |
| GitHub **web UI** via WebFetch | **works** — run pages, workflow run lists, commit checks |
| `raw.githubusercontent.com` via WebFetch | **works** — authoritative file contents, no JS rendering |
| Job logs | require sign-in |

Reading rendered GitHub pages is reliable for structure and unreliable for status chips;
raw file contents are reliable. Where the two disagreed, this document says UNKNOWN.
