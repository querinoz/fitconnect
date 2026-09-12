# The release gate was green on a red run

**Date:** 2026-09-12. Found by reading run
[`34682676182`](https://github.com/querinoz/fitconnect/actions/runs/34682676182)
(CI #39, `1780b097`) job by job.

## What happened

| | |
|---|---|
| Workflow conclusion | **Failure** |
| `Release gate` | **Success**, in 3s |
| Jobs skipped | **0** (it was 10 before the uncoupling) |

Both are correct. `release-gate` aggregates nine jobs and all nine succeeded; the run failed
because `Lighthouse mobile gate` failed. The gate did not lie about anything it was asked
about.

That is the problem. `AUTONOMOUS_WORK_STATE.md` states the distinction twice — *"Do not
treat workflow-level failure as release-gate failure"* — and that sentence is true today
and load-bearing tomorrow. It only holds while someone remembers which jobs the gate covers.
The gate published a verdict with no statement of its own scope, next to a red run, in a
project whose first rule is that SKIPPED is not PASS. **A forgotten job produces the same
false green as `continue-on-error`, reached by omission instead of by configuration.**

`lighthouse-mobile` reached this state legitimately: it was excluded from `REQUIRED_JOBS`
on the reasoning that branch-conditional jobs would make the gate unsatisfiable on a
feature branch — true when its `if:` was `main`/`master`/`feature/**`. Commit `a727bc2`
then widened it to `feat/**`. From that moment it ran on this branch, could fail on this
branch, and no longer matched the assumption that excluded it. Nothing flagged the change.

## Two fixes, neither of which hides the miss

Lighthouse stays red. Adding it to the gate would make the gate red for a known product
gap; lowering the thresholds would weaken a stated gate without a perf program behind it.
Both were rejected, agreeing with the decision already recorded on the branch.

### 1. `scripts/ci-gate-lint.mjs` — a seventh check, `gate-coverage`

Every job must be one of: aggregated by `release-gate`, the gate itself, or listed in
`ACKNOWLEDGED_UNGATED` **with a written reason**. Anything else is an ERROR.

```
ERROR (1)
  [gate-coverage] job "visual-regression" is neither aggregated by "release-gate" nor
  listed in ACKNOWLEDGED_UNGATED. It can fail the workflow while the gate still reports
  PASS. Either add it to the gate, or record why it is exempt.
```

Verified three ways: ERROR on a workflow with a deliberately forgotten job (exit 1); clean
on the workflow currently on the branch; clean on the updated one. The three real
exemptions now read back as notes rather than sitting in someone's memory:

```
INFO  [gate-coverage] "lighthouse-mobile" is outside the gate by decision: mobile
      perf/a11y/seo genuinely miss their thresholds; kept red and visible rather than
      aggregated or weakened
INFO  [gate-coverage] "test-perf" is outside the gate by decision: k6 smoke is
      main/master-only, so requiring it would make the gate unsatisfiable on a feature branch
INFO  [gate-coverage] "deploy-staging" is outside the gate by decision: main/master-only
      deploy step, and it smokes a deployed environment rather than this commit
```

The validator note count therefore moves from **1 to 4**, still **0 errors**. Because the
validator is now a step inside `lint-typecheck`, this is enforced on every push: the next
person who adds a job and forgets the gate fails CI with a message telling them which
decision they skipped.

### 2. The gate states its own scope

An 11-line addition to the `release-gate` step. No threshold moved, no `needs` changed,
nothing converts a failure into a pass — it only makes the log unmisreadable:

```
Release gate PASS — all required jobs success

NOT covered by this gate: lighthouse-mobile, test-perf, deploy-staging.
A green release gate is therefore NOT the same as a green workflow —
read the run conclusion before calling the branch releasable.
```

## The Lighthouse miss, for the record

Local mobile Lighthouse against the `NEXT_PUBLIC_DEMO_MODE=true` production build, against
the thresholds in the workflow:

| Category | Score | Min | Gap |
|---|---|---|---|
| performance | 58 | 84 | **−26** |
| accessibility | 89 | 90 | **−1** |
| best-practices | 100 | 95 | ✓ +5 |
| seo | 92 | 95 | **−3** |

`scripts/lighthouse-mobile.mjs` exits 1 on any breach, so the job fails on all three at
once. Worth separating: **accessibility is one point short** and SEO three — those are
single-defect distances, and the cheapest real wins on the board. Performance at −26 is a
program, not a fix, and is the only one of the three that deserves to be called product
work.

## What this does not claim

The `gate-coverage` check and the gate's scope line are **statically validated only** —
`node scripts/ci-gate-lint.mjs` passes on the updated workflow in this environment. Neither
has run on GitHub. The updated `ci.yml` is an 11-line diff against `1780b097`; the next push
is what proves it.

## Second confirmation: the Actions list page is not evidence

Read today, for the same run `34682676182`:

| Source | What it says |
|---|---|
| `/actions/workflows/ci.yml?query=branch:feat/elite-os-v2` (list) | CI #39 — **✓**, "completed successfully" |
| `/actions/runs/34682676182` (run page) | Conclusion **Failure**; `Lighthouse mobile gate` **Failure**, exit code 1 |

This is the second independent instance of the same discrepancy — the first was CI #32 on
`5b685cb`, where the list read Success and the run page read Failure with ten jobs skipped.
Two for two. The standing rule holds and should not be relaxed: **read the run page and the
per-job results.** A ✓ on a list page is not evidence of anything.
