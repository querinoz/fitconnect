# FitConnect — Security Recovery Report

**Date:** 2026-09-10 · **Scope:** P0/P1 security and dependency recovery
**Database:** `beuiammeedpovdkmhluw` · **Verdict: 🟡 HUMAN ACTIONS REMAIN**

## Executive summary

The database is closed. Every invariant that matters is now not just true but
*machine-checkable*: 59 of 59 tables have row level security enabled and forced, `anon`
holds no write privilege anywhere, the migration registry matches the schema, and the
Supabase security linter reports zero ERROR-level findings — down from eight.

The dependency side is half-closed. Two unauthenticated Next.js RCEs are fixed with a
one-line change and a 156-line lockfile diff in which every line is accounted for. One
critical remains, in MapLibre, and the analysis says it is **not reachable from this
codebase** — which is why it was scheduled rather than rushed.

One correction to session 1 leads the report, because getting it wrong in the other
direction would be worse.

## Correction: no tokens were exposed

Session 1 told the owner to treat the Strava tokens as compromised. `public."StravaConnection"`
holds **0 rows**. So do `StravaActivity`, `community_posts`, `activities` and
`workout_sessions`; `identity_profiles` holds 1.

The misconfiguration was real: RLS was off and `anon` — the role behind the publishable
key in the web bundle — held SELECT on a table with `accessToken` and `refreshToken`
columns. Had a token existed, it was readable. None did. Rotation is precautionary
hygiene, not incident response.

## Database

| Check | Session 1 start | Now |
|---|---|---|
| Tables in `public` | 59 | 59 |
| RLS disabled | **8** | **0** |
| RLS enabled but not forced | 11 | **0** |
| `anon` INSERT / UPDATE / DELETE | **36 tables** | **0** |
| `anon` SELECT | 41 | 41 (public reads intact) |
| Supabase linter, ERROR | 8 | **0** |
| Migrations recorded | 001–016, 022 | 001–029 |

Remaining lints: 16 INFO (`rls_enabled_no_policy` — deliberate, fail-closed server-only
tables, each named in `scripts/db-reconcile-schema.mjs`) and 1 WARN (leaked-password
protection, a dashboard toggle).

### RLS

`029` made "every table forces RLS" an invariant rather than a list of eleven remembered
exceptions. The owner role carries `rolbypassrls`, so nothing about the server path
changed — the value is that drift is now detectable instead of negotiable.

### Strava

Tables are server-only: RLS on, forced, zero policies, no client grants. RLS with no
policy denies every role that does not bypass it, which is the correct shape for a
Prisma-managed mirror the client should never touch.

Code side, three findings and three fixes:

- **`encryptToken()` was fail-open.** With `STRAVA_TOKEN_ENCRYPTION_KEY` unset it returned
  the plaintext unchanged, and `.env.example` ships that variable empty. A production
  deploy that skipped `pnpm env:setup-prod` would have written live tokens in the clear
  with nothing in the logs. Now it throws in production security mode, and
  `saveConnection` refuses to persist. **8 regression tests written and run — all pass.**
- **The error log at the token write site** passed the raw driver error to `console.error`
  from a statement carrying `accessToken`/`refreshToken`. Now logs error name and code only.
- **`packages/strava-integration` itself is clean**: zero `process.env` reads, zero
  `console.*` calls, and the token exchange returns `null` rather than surfacing the
  upstream body.

### Community posts

`community_posts` and `post_reactions`: RLS enabled and forced, three policies each,
`anon` reduced to SELECT. The Strava-never-social barrier is in the database, not the UI —
`is_social_eligible` is a generated column (`upper(provider_id) <> 'STRAVA'`) with a CHECK
that rejects a Strava-origin row outright, and every policy is predicated on it. `020` now
enables RLS in the same file that defines those policies, so the two cannot drift apart
again.

### Production schema

`scripts/db-reconcile-schema.mjs` checks six things that must agree: registry, RLS, FORCE,
policies, grants, identity. It caught all three drift classes found this session and now
reports **0 errors, 6 documented legacy warnings** against a full local replica. The rule
and the three drifts behind it are in
[`PRODUCTION_SCHEMA_RECONCILIATION.md`](PRODUCTION_SCHEMA_RECONCILIATION.md).

## Dependencies

Full classification in
[`../security/DEPENDENCY_SECURITY_MATRIX.md`](../security/DEPENDENCY_SECURITY_MATRIX.md).

**Next: fixed.** 15.5.23 → 15.5.25. `CVE-2026-75604` and `GHSA-2xp9-vwfh-vxw4`, both
unauthenticated RCE. Method: raise `pnpm.overrides.next` and regenerate the lockfile only.

| Approach | Diff | Blast radius |
|---|---|---|
| no change (control) | **0 lines** | proves the environment is faithful |
| `pnpm up next@15.5.24` | 781 | react, webpack, babel, typescript, playwright, maplibre transitives |
| `pnpm update next` | 375 | react 19.2.8, webpack, typescript 5.9.3, playwright 1.60.0 |
| **`pnpm.overrides`** | **156** | `next`, `@next/env`, 8 `@next/swc-*`, one `@serwist/next` re-key |

The wide diffs were not noise — the 0-line control ruled that out. They are `pnpm update`
re-resolving every `^` range the lockfile had pinned months ago.

**MapLibre: open, and not reachable.** `maplibre-gl@5.24.0`, `CVE-2026-85061`, XSS
sanitizer bypass in `DOM.sanitize()`. That function is what MapLibre calls for HTML-string
popups and markers. The only map surface in the repository imports exactly
`Map, Layer, Marker, NavigationControl, Source` from `react-map-gl/maplibre` — no `Popup`,
no `setHTML`, no direct `maplibre-gl` import — and react-map-gl's `Marker` renders React
children rather than parsing HTML. Upgrade measured: `^6.4.1` resolves to 6.9.0, 193
lockfile lines, `react-map-gl@8.1.1` accepts it (optional peer `>=1.13.0`), no peer
warnings. Not applied: 5 → 6 is a major with runtime API changes and the only verification
that counts is a build plus a rendered map.

**Other criticals.** `vitest` (dev) — arbitrary file read/execute only while the Vitest UI
server is listening; CI runs `vitest run`, which never starts it.

**Highs.** 22 in the production tree, 40 across the full tree. Only `next` and
`maplibre-gl` are declared production dependencies; the rest are transitive or dev-only,
and two (`mysql2`, `hono`) are structurally unreachable — the product is Postgres and does
not mount Hono middleware.

## CI

`security-audit` no longer reports a PASS it did not earn. `pnpm audit --audit-level
critical --prod` and semgrep are blocking; the high surface is printed rather than gated,
because 22 advisories need triage, not one switch. Before this, both steps ran under
`continue-on-error: true` while `release-gate` counted the job as a required PASS — which
is how 5 criticals and 44 highs stayed invisible.

**The gate will be red** until MapLibre lands. That is the honest state.

`.github/workflows/ci.yml` could not be written by this session's tools (protected path).
The patched file was delivered to the chat.

## Migrations

| File | State |
|---|---|
| `017` | Fixed (11 drop-guards, guarded grants), applied, recorded |
| `018` | Applied, recorded |
| `019` | Applied, recorded |
| `020` | Fixed (now enables RLS alongside its policies), applied, recorded |
| `021` | Fixed (`auth.uid()` → `firebase_uid()`, FORCE RLS, grants added), applied, recorded |
| `022` | Was already applied |
| `023` | Applied after dependency analysis — SAFE: CHECK constraint, 0 dependents, 0 inbound FKs, 0 derived indexes, 0 rows, one-statement rollback |
| `024`–`029` | New this recovery; applied and recorded |

## Build

| Gate | State |
|---|---|
| Typecheck | **NOT RUN** against the workspace. `tsc --noEmit` on the changed files reports only module-resolution errors, the same class the untouched lines produce. |
| Lint | NOT RUN |
| Unit | `vitest run` on the new `token-crypto.test.ts`: **8 passed**. Full suite NOT RUN. |
| Security | `pnpm audit` run against the repository's real lockfile — the numbers here are measured |
| Build | **NOT RUN** |
| E2E | NOT RUN |

No shell on the repository in either session. Nothing was committed.

## Human actions

[`../automation/HUMAN_HANDOFF.md`](../automation/HUMAN_HANDOFF.md) — nine items. The first
three matter: validate the Next lockfile with a build, copy the CI workflow into place, and
upgrade MapLibre. None is an emergency.

## Technical blockers

`device_bash` fails with `Workspace unavailable. The isolated Linux environment on this
device failed to start`. No `git`, `pnpm`, `gradlew` or test runner against the repository.
Everything claimed as verified above was executed somewhere real: a PostgreSQL 16 in this
container, `pnpm audit` and `pnpm install --lockfile-only` against the repository's own
lockfile, `tsc`, `vitest`, and read-only catalog queries against the live database.

## Verdict

# 🟡 HUMAN ACTIONS REMAIN

Security is recovered on the database, on the Strava code path, and on the CI gate.
It is **not** recovered end to end: one production critical is open by decision, 22 highs
await triage, and no build has validated any of it. Production stays **NO-GO**.
