# `ci.yml` session-5 promotion

**Status (2026-09-12 closure pass):** `.github/workflows/ci.yml` **was** promoted with:

```powershell
Copy-Item -Force docs\automation\ci.yml.pending-session5 .github\workflows\ci.yml
```

`node scripts/ci-gate-lint.mjs` on that file: **0 errors, 4 notes**.
`lighthouse-mobile` is in `release-gate.needs`. Negative tests A/B/C: exit 1 as required.

The Write tool still cannot edit workflow files; Shell `Copy-Item` / `Move-Item` is the supported promotion path.

## Why this matters right now

`scripts/ci-gate-lint.mjs` **was** applied, and the `lint-typecheck` job runs it. The new
validator requires `lighthouse-mobile` to be aggregated by `release-gate`; the `ci.yml` still on
disk does not aggregate it. Run the validator today and it says, correctly:

```
ERROR (2)
  [gate-complete] required job "lighthouse-mobile" exists but "release-gate" does not aggregate it
  [gate-coverage] job "lighthouse-mobile" is neither aggregated by "release-gate" nor listed in
                  ACKNOWLEDGED_UNGATED. It can fail the workflow while the gate still reports PASS.
exit 1
```

This is the validator doing its job, not a false positive. But it means **committing
`scripts/ci-gate-lint.mjs` without `ci.yml` will fail `lint-typecheck` on the next push.**

The two files are a pair. They land in the same commit or neither lands.

## The move

```powershell
Move-Item -Force `
  D:\fitconnect\docs\automation\ci.yml.pending-session5 `
  D:\fitconnect\.github\workflows\ci.yml

node scripts\ci-gate-lint.mjs      # expect: 0 errors, 4 notes
```

If it still reports errors, stop and read them — do not commit.

## What changed in it — 122 lines against `1780b097`

1. **`lighthouse-mobile` is aggregated by `release-gate`.** CI #39 ended in FAILURE while the gate
   reported SUCCESS, because that job was not in its `needs`. Commit `a727bc2` had widened its
   `if:` to `feat/**`, so it runs — and can fail — on this branch.
2. **The gate checks each result by name** instead of `join(needs.*.result)`. `failure` or
   `cancelled` on any job blocks. `skipped` is accepted **only** for `lighthouse-mobile`, whose
   branch filter can legitimately exclude it; a skipped *required* job still blocks.
3. **`test-integration` builds the supabase chain from scratch** in its own database on the same
   Postgres service, then runs `db-reconcile-schema.mjs` against it. The chain had never been
   executed by CI.
4. **The stale `security-audit` comment is corrected.** It said "expect this job to be RED until
   those land" — they landed, and a red security audit is now a regression.

No threshold was lowered, no job removed, no `continue-on-error` added. `if: always()` appears
once, on `release-gate`, to collect results rather than to convert failure into success.

## Expect the gate to block

With `lighthouse-mobile` aggregated and performance at 58 against a threshold of 84,
`release-gate` will **BLOCK**. That is correct and intended: it replaces a gate that was reporting
SUCCESS on a workflow that concluded FAILURE. See
[`../qa/LIGHTHOUSE_PERFORMANCE_ANALYSIS.md`](../qa/LIGHTHOUSE_PERFORMANCE_ANALYSIS.md) for the
ranked plan to fix the performance score itself.
