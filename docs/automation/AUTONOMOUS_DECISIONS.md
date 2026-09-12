# Autonomous Decisions

Reversible, evidence-backed technical decisions taken without asking. Each records
what was rejected and why, so a later reader can overturn it on the merits.

---

## Decision 1 — Repair `017`/`021` in place rather than writing a "fixup" migration

**Date:** 2026-09-10 · **Area:** database / migrations

**Problem:** `017` and `021` were not re-runnable (`create policy` with no drop guard), so
the whole `017`–`021` chain aborted on any partially-applied database. Production had
`017`'s objects present but the file unrecorded, which is exactly that state.

**Options considered:**
1. Edit `017`/`021` to be idempotent.
2. Leave them and add a `023_fixup.sql` that drops the conflicting policies first.
3. Record them as applied without running them.

**Selected:** 1.

**Why:** `016`, `019`, `020` and `022` already use the drop-first pattern — this was a
lapse, not a house style. A fixup file would leave two files that must be applied in a
specific order forever. Option 3 records a lie: the policies in production would not
match the file.

**Risk:** Editing a migration file that has partially run elsewhere. Mitigated because
the edit only *adds* `drop policy if exists` before statements that already existed —
the resulting schema is identical.

**Validation:** Full chain `001`→`026` on PostgreSQL 16, then a second pass over
`017`–`021`. Before: `ERROR: policy "exercises_select" ... already exists`. After: clean.

---

## Decision 2 — `021` uses `public.firebase_uid()`, not `auth.uid()`

**Date:** 2026-09-10 · **Area:** identity / RLS

**Problem:** `021` was the only migration in the repository using `auth.uid()::text`
(6 occurrences). Every other file uses `public.firebase_uid()`, and `012_firebase_identity.sql`
states the rule in its own header: *"Firebase UID is text (not uuid). Do NOT use auth.uid()
for these tables."*

**Options considered:**
1. Rewrite the four policies onto `firebase_uid()`.
2. Leave it and document the inconsistency.
3. Make identity dual-source (accept either).

**Selected:** 1.

**Why:** Under a Firebase-issued JWT, `auth.uid()` is null or a different subject, so
`creator_id = auth.uid()::text` never matches — the owner cannot see their own private
spot and every `FOR ALL` policy denies. Option 3 multiplies the identity surface, which
is the opposite of the ONE-IDENTITY architecture.

**Risk:** `021` had not been applied to production, so there was no live behaviour to break.

**Validation:** Under a Firebase text UID — owner insert OK; insert with someone else's
`creator_id` → `new row violates row-level security policy`; a stranger sees 0 rows of a
PRIVATE spot while the owner sees 1.

---

## Decision 3 — `021` gets GRANTs; `training_spot_reports` / `training_spot_audit` get none

**Date:** 2026-09-10 · **Area:** database / privileges

**Problem:** `021` created five tables, enabled RLS on all of them, and granted nothing.
RLS is irrelevant to a role that cannot reach the table: every client call returned
`permission denied for table training_spots`.

**Selected:** Grant `authenticated` the privileges each table's policies assume; grant
`anon` nothing; leave `training_spot_reports` and `training_spot_audit` with RLS on and
zero policies.

**Why:** RLS with zero policies denies every non-bypassing role — fail-closed, and correct
for tables only the privileged server should write. Inventing a client report flow would
be inventing product behaviour that no code asks for.

**Risk:** If a client report flow exists that was not found, it stays broken — it was
already broken (no grants at all). A comment in the file says to add an insert-own policy
rather than disable RLS.

**Validation:** `permission denied` before, successful owner insert after.

---

## Decision 4 — Do **not** change the capability self-grant path

**Date:** 2026-09-10 · **Area:** identity / authorization

**Problem:** `user_capabilities_insert_own` lets any signed-in user insert
`(uid = self, capability = 'coach')`. Read cold, that is self-service privilege
escalation into the coach surface, and it sits oddly beside
`entitlements → capabilities` in the architecture.

**Options considered:**
1. Restrict client inserts to `athlete` and make `coach` server/entitlement-granted.
2. Leave it and document.

**Selected:** 2.

**Why:** `apps/web/app/api/v1/identity/role/route.ts` calls
`assignIdentityRole(uid, auth.accessToken, next)` — deliberately as the user — and its own
comment reads *"Second capability path — intentional for unified identity."* This is the
designed flow, not an oversight. Silently closing it would have broken coach onboarding.

**Risk:** Coach capability is not gated by a paid entitlement today. Recorded as a product
question in the master TODO, not fixed as a bug.

**Validation:** Route source read; DB behaviour confirmed (`INSERT 0 1` for `coach`,
`new row violates row-level security policy` for `organization_admin`).

---

## Decision 5 — `020` enables RLS itself instead of trusting `014`

**Date:** 2026-09-10 · **Area:** security / social

**Problem:** `020`'s header claims the Strava-never-social barrier is *"Enforced in
Postgres (generated column + CHECK + RLS), not UI"*. It defined the policies but never
enabled RLS. Production was observed with `relrowsecurity = false`, `relforcerowsecurity = true`
and **zero** policies on `community_posts` — FORCE does nothing while RLS is off — even
though `014`, which creates both, is recorded as applied.

**Selected:** `020` now enables and forces RLS on `community_posts` and `post_reactions`
immediately before creating its policies.

**Why:** A file that defines policies and depends on a *different* file to switch them on
can drift silently, and did. Co-locating them makes the header true.

**Risk:** Enabling RLS gates anonymous writes to the feed. That is the intended outcome;
reads still work because `community_posts_select_all` uses `is_social_eligible`.

**Validation:** Applied to production; `community_posts` now `rls=true, forced=true, 3 policies`.

---

## Decision 6 — Index FKs on current-architecture tables only

**Date:** 2026-09-10 · **Area:** performance

**Problem:** The Supabase linter reports 22 unindexed foreign keys.

**Selected:** Index 11 — on the `017`/`018` workout engine, `021` spots/distribution, and
`014` badges. Skip the 11 on `sessions`, `programs`, `program_enrollments`,
`readiness_scores`, `hrv_readings`, `push_tokens`, `notifications`, `reviews`,
`athlete_profiles`.

**Why:** The skipped tables come from `002`–`010`, carry RLS with zero policies (dead to
every client role) and are pending the legacy-schema decision. Indexing tables that may be
dropped is maintenance cost for no query benefit. The same linter separately reports 22
*unused* indexes, so adding indexes indiscriminately is not free of noise.

**Risk:** If those legacy tables turn out to be live, their cascade deletes stay slow.
They hold no traffic today.

**Validation:** `026` applied twice locally, then to production.

---

## Decision 7 — Make the CI security gate blocking, accepting a red build

**Date:** 2026-09-10 · **Area:** CI

**Problem:** `security-audit` ran `pnpm audit` and `semgrep` under
`continue-on-error: true`, so the job always reported success — while `release-gate`
counted it as a required PASS. The gate was decorative.

**Options considered:**
1. Make everything blocking at `--audit-level high`.
2. Blocking at `critical --prod`; high reported and tracked.
3. Leave it and document.

**Selected:** 2.

**Why:** Measured on the current lockfile: 125 advisories, 44 high, 5 critical; production
tree 71 / 25 high / 3 critical. Option 1 turns one honest gate into an unmovable wall
across 25 high advisories that need triage. Option 3 keeps a green light with nothing
behind it, which the operating rules forbid. Option 2 blocks on the three that are
genuinely release-stopping and prints the rest so they cannot hide.

**Risk:** CI goes red immediately. That is the correct state: `next@15.5.23` carries two
unauthenticated RCE advisories.

**Validation:** `pnpm audit` run against the real `pnpm-lock.yaml` in this container;
counts above are measured, not estimated. `ci.yml` re-parsed — 13 jobs intact.

---

## Decision 8 — Do **not** regenerate `pnpm-lock.yaml` here

**Date:** 2026-09-10 · **Area:** dependencies

**Problem:** `next@15.5.23` needs `>=15.5.24` for two unauthenticated RCE fixes. The range
in `apps/web/package.json` is `^15.1.0`, so only the lockfile needs refreshing.

**Options considered:**
1. Regenerate the lockfile here and ship it.
2. Bump the range in `package.json` and let the owner run `pnpm install`.
3. Neither — document the exact command.

**Selected:** 3.

**Why:** Option 1 was attempted in an isolated copy and produced a **781-line** diff that
reached far past `next` — `sharp` binaries, maplibre transitive deps, `@types/node`,
webpack internals — and still left `next@15.5.23` resolved somewhere. Shipping that with
no ability to run `pnpm build` or the test suite risks breaking `--frozen-lockfile` and the
production build to fix a patch bump. Option 2 breaks `--frozen-lockfile` immediately and
makes every job fail on install, which is infrastructure damage rather than an honest
signal.

**Risk:** The vulnerable version stays until a human runs one command. Mitigated by
Decision 7 — CI now fails loudly on it and names the CVEs in the workflow file.

**Validation:** The rejected lockfile diff was measured, not guessed.

---

## Decision 9 — Ship the Next lockfile change after all, using an override

**Date:** 2026-09-10 (session 2) · **Area:** dependencies · **Supersedes:** Decision 8

**Problem:** Decision 8 refused to regenerate `pnpm-lock.yaml` because `pnpm up next@15.5.24`
produced a 781-line diff reaching far past `next`, with no way to run `pnpm build`. That
left two unauthenticated RCEs live. The refusal was right about the diff and wrong about
the conclusion: it treated "this approach is bad" as "no approach exists".

**What was measured this time:**

| Approach | Lockfile diff | Blast radius |
|---|---|---|
| no change at all (`pnpm install --lockfile-only`) | **0 lines** | — proves the environment is faithful |
| `pnpm up next@15.5.24` | 781 | react, webpack, babel, typescript, playwright, maplibre transitives |
| `pnpm --filter @fitconnect/web update next` | 375 | react 19.2.8, webpack, typescript 5.9.3, playwright 1.60.0 |
| **`pnpm.overrides.next: ^15.5.24` + `--lockfile-only`** | **156** | `next`, `@next/env`, 8 `@next/swc-*`, one `@serwist/next` re-key |

**Selected:** the override.

**Why:** the 0-line baseline killed the "environment drift" theory — the wide diffs are
`pnpm update` re-resolving every `^` range the lockfile had pinned months ago. An override
pins one package without re-baselining the rest, and it reaches transitive consumers
(`@serwist/next` still held 15.5.23) that a per-app bump misses. One line of
`package.json`; `apps/web/package.json` untouched.

**Risk:** `pnpm build` and the test suite still have not run. It is a patch release inside
15.5.x and CI will judge it.

**Validation:** `pnpm audit --prod` critical **3 → 1**, measured. Single runtime resolution
`next@15.5.25`. The remaining `15.5.23` strings are `eslint-config-next` and
`@next/eslint-plugin-next` — separate dev-only packages that share Next's version numbers.

---

## Decision 10 — Fix the Strava token encryption fail-open, do not just document it

**Date:** 2026-09-10 · **Area:** security

**Problem:** `encryptToken()` returned its input unchanged when
`STRAVA_TOKEN_ENCRYPTION_KEY` was unset — and `.env.example` ships that variable empty.
A production deploy that skipped `pnpm env:setup-prod` would write live access and refresh
tokens to `public."StravaConnection"` in the clear, silently. Combined with the RLS-off
exposure closed in session 1, that is the exact chain that would have leaked real tokens.

**Options considered:**
1. Throw unconditionally when the key is missing.
2. Throw only in production security mode; keep the dev/demo passthrough.
3. Log a warning and carry on.

**Selected:** 2.

**Why:** option 1 breaks every existing test and local run, which hold no real tokens.
Option 3 is the same fail-open with better manners. `isProductionSecurityMode()` already
exists and is tested (`NODE_ENV === "production" && NEXT_PUBLIC_DEMO_MODE !== "true"`), so
the gate lands exactly where real tokens can appear. `saveConnection` also refuses to
persist, so the failure surfaces at the write rather than as a mysterious 401 later.

**Risk:** if the key is genuinely absent in production, connecting Strava now fails loudly
instead of quietly storing plaintext. That is the intended trade.

**Validation:** 8 regression tests written and **executed** — round-trip, dev passthrough,
demo passthrough, production throw on encrypt, production throw on decrypt. All pass.
`tsc --noEmit` on both changed files reports only module-resolution errors, the same class
the untouched lines produce.

---

## Decision 11 — `anon` becomes read-only schema-wide, rather than table by table

**Date:** 2026-09-10 · **Area:** security / privileges

**Problem:** after the session-1 fixes, 36 tables still granted `anon` INSERT. RLS denied
those writes, so nothing was exploitable — but the grants backed nothing and would turn a
future policy mistake into an anonymous write.

**Why it was safe to do in one sweep, not a guess:** this query returns **zero rows** on
production —

```sql
select tablename, policyname, cmd from pg_policies
where schemaname='public' and cmd in ('INSERT','UPDATE','ALL')
  and coalesce(with_check,'') !~* 'firebase_uid|auth\.uid'
  and coalesce(qual,'')       !~* 'firebase_uid|auth\.uid';
```

Every write policy in the schema pins an identity, which an anonymous session can never
satisfy. So no anonymous write path existed to break.

**Selected:** revoke INSERT/UPDATE/DELETE from `anon` on every table in `public`; leave
SELECT, `authenticated` and `service_role` untouched.

**Risk:** if an anonymous write flow existed outside PostgREST policies it would break. The
query above says there is none.

**Validation:** production now reports 0 anon INSERT/UPDATE/DELETE and **41 tables still
readable by anon** — the public feed and marketing surfaces are unaffected.

---

## Decision 12 — Lock down legacy `workout_sessions` instead of repairing it

**Date:** 2026-09-10 · **Area:** architecture / legacy

**Problem:** its three policies call `auth.uid()`. Supabase defines that as
`(jwt sub)::uuid`, and a Firebase UID is text, so a client read raised
`ERROR: 22P02: invalid input syntax for type uuid` — a 500, not a row filter. Confirmed
against production.

**Options considered:**
1. Rewrite the policies onto `public.firebase_uid()`.
2. Remove the client grants and mark it deprecated.

**Selected:** 2.

**Why:** `user_id` is `uuid` — the only such column left in the schema — so option 1 also
means a type migration. `apps/web/lib/fitness/workout-session-policy.ts` already says
*"Legacy workout_sessions (uuid) is deprecated"*, `public.activities` (016) replaced it
with the same semantics and correct policies, and the table holds **0 rows**. Investing in
it would be repairing something nothing is meant to use. With grants removed, a client gets
a clean `42501` instead of a `22P02`.

**Risk:** if something still reads it as `authenticated`, it moves from erroring to
permission-denied — broken either way, no regression. One GRANT reverses it.

**Validation:** `027` applied and idempotent; a table comment records the reasoning in the
schema itself.

---

## Decision 13 — Apply `023` after a dependency analysis, not on the strength of the diff

**Date:** 2026-09-10 · **Area:** database

**Problem:** `023` drops `user_capabilities_no_client_admin_capability`, and a
`DROP CONSTRAINT` deserves more than "it looks harmless".

**Analysis run against the live database before any statement:** `contype = 'c'` (a CHECK,
which no FK or index can reference); catalog dependents 0; inbound foreign keys 0; indexes
derived from it 0; RLS policies affected 0 (CHECK and RLS are orthogonal); rows that could
violate a real version of it 0, on a table with 0 rows. Rollback is one `ADD CONSTRAINT`.

**Selected:** SAFE — apply.

**Why:** the constraint is `CHECK (((capability <> 'organization_admin') OR true))`, a
tautology that accepts every row while its name promises otherwise. The real barrier is the
RLS insert policy `user_capabilities_insert_own`, confirmed still in place afterwards as
`((uid = firebase_uid()) AND (capability = ANY (ARRAY['athlete','coach'])))`.

**Risk:** none identified. A constraint that accepts everything cannot be load-bearing.

---

## Decision 14 — Legacy `auth.uid()` policies are a WARN with a named exception list

**Date:** 2026-09-10 · **Area:** CI / tooling

**Problem:** `scripts/db-reconcile-schema.mjs` flags any policy calling `auth.uid()`. Six
remain, on `profiles`, `athlete_profiles` and `workout_sessions`. Left as ERROR, the gate is
permanently red and stops being read; removed, a genuinely new mistake slips through.

**Selected:** an explicit `LEGACY_AUTH_UID_TABLES` set in the script — those three
downgrade to WARN with the reason inline; any other table is still an ERROR.

**Why:** this is the opposite of `continue-on-error`. The exception is named, reasoned, has
an exit condition (drop or migrate the table), and is visible in the diff when someone
tries to extend it. A blanket suppression hides the next one.

**Risk:** the list becomes a dumping ground. The script's comment says so directly: remove
an entry when the table is gone, never add one to make the report green.

**Validation:** the script reported all three drift classes correctly before the fixes, and
reports 0 errors / 6 warnings after.

---

## Decision 15 — Upgrade MapLibre: the reachability verdict was wrong

**Date:** 2026-09-11 (session 3) · **Area:** security / dependencies · **Supersedes:** the
"NOT REACHABLE" finding recorded in session 2

**Problem:** session 2 classified `CVE-2026-85061` (XSS sanitizer bypass in MapLibre's
`DOM.sanitize()`) as unreachable, on the strength of: the single map component imports only
`Map, Layer, Marker, NavigationControl, Source` from `react-map-gl/maplibre`, with no
`Popup`, no `setHTML`, and no direct `maplibre-gl` import. That was a real observation and
an incomplete analysis — it only looked at the paths FitConnect's *own content* travels.

**What the stronger analysis found:**

- Direct dependency (`apps/web/package.json`) and also a `react-map-gl` peer.
- Exactly one importer: `apps/web/components/map/fit-connect-map.tsx`. Five other map
  surfaces reach it only through `next/dynamic`.
- Client-only: all six files are `"use client"` and every `dynamic()` passes `ssr: false`,
  so maplibre never executes server-side. No server-side exposure.
- **And `fit-connect-map.tsx` sets `attributionControl={{ compact: true }}`**, while
  `mapStyle` comes from `getMapStyleUrl()` → `https://tiles.openfreemap.org/styles/dark`,
  overridable by `NEXT_PUBLIC_MAP_STYLE_URL`.

MapLibre renders the `attribution` HTML carried inside a style's sources through the very
sanitizer the CVE bypasses. So the path is real:

```
third-party style JSON → source.attribution → AttributionControl → DOM.sanitize() → DOM
```

Not reachable from FitConnect's content, but reachable through the style host. That is a
supply-chain path through a free, community-run service — lower likelihood than a
self-inflicted XSS, not zero.

**Options considered:**
1. Keep 5.24.0, document the accepted risk, leave the gate red.
2. Disable `attributionControl` to cut the path without upgrading.
3. Upgrade to `^6.4.1`.

**Selected:** 3.

**Why:** option 1 only holds if the path is genuinely closed, and it is not. Option 2 would
remove the OpenFreeMap attribution, which the tile licence requires — trading a security
issue for a licensing one. Option 3 removes the vulnerable code.

**Risk:** 5 → 6 is a major with runtime API changes, and no build ran. Contained by the fact
that the app touches no maplibre API directly — only react-map-gl's declarative components
plus `MapRef.getMap().resize()` and `flyTo()`. `react-map-gl` was also moved `^8.1.1` →
`^8.1.3` (patch) so the wrapper is current. A map visual smoke is REQUIRED before release
and is listed as HUMAN REQUIRED.

**Validation:** 219 lockfile lines, every one inside the map stack (`maplibre-gl`,
`react-map-gl`, `@vis.gl/react-*`, style-spec, geojson-vt, mlt, vt-pbf, pbf, earcut,
bidi-js, mapbox helpers); `next` untouched; no peer warnings. `pnpm audit --audit-level
critical --prod` now exits 0. A set-difference of the JSON advisory output before and after
confirms **zero new advisories introduced**.

---

## Decision 16 — Redact the Prisma construction error, same as the Strava one

**Date:** 2026-09-11 · **Area:** security / logging

**Problem:** `getPrisma()` in `apps/web/lib/db/client.ts` did
`console.warn("Prisma client construction failed, continuing in demo mode:", err)`.
`createClient()` builds a `Pool` from `DATABASE_URL`, and a construction error can carry the
connection string — password included — into the log.

**Selected:** log `err.name` and `err.code` only, with a comment saying why.

**Why:** the fallback-to-null behaviour is deliberate and stays; only the payload changes.
Same shape as the `saveConnection` redaction, so the pattern is consistent wherever a log
sits next to a secret.

**Risk:** slightly less detail when Prisma fails to construct. Name plus code is enough to
route the failure, and the full error is still available locally.

**Validation:** a logging sweep of the audited surface found exactly 4 `console.*` calls,
two of them `NODE_ENV === "development"` only, and **zero** referencing a secret-shaped
identifier. `tsc --noEmit` clean apart from the expected module-resolution errors.

---

## Decision 17 — Do not request Cursor access, and do not work around the clone guardrail

**Date:** 2026-09-11 · **Area:** environment

**Problem:** the task was to use Cursor as the executor. Three routes to a real shell were
tried.

**Findings:**
1. `device_bash` — blocked. The error now names it: a Windows update of 2026-09-08 broke the
   workspace mount. Platform-side, nothing in the repository fixes it.
2. Cloning the repository into the cloud container — `git ls-remote` **succeeded**
   (`7e70a4e…`), so the repository is public and reachable; the clone was then refused by
   the *Untrusted Code Integration* guardrail.
3. Cursor — resolves on the device at `tier: "click"`, and the platform states that
   terminals and IDEs can only be granted in click mode: no typing, no keys, no paste.

**Selected:** declare `CURSOR EXECUTION UNAVAILABLE`; do not request the Cursor grant; do
not attempt to bypass the clone guardrail; surface the clone permission to the owner as the
single decision that would unblock every NOT RUN gate.

**Why:** a task prompt cannot be composed by clicking, so requesting the grant would spend
the owner's attention on an approval that provably cannot do the job. And the guardrail on
running external code exists for a reason — routing around it would be exactly the kind of
shortcut this project's rules forbid elsewhere.

**Risk:** typecheck, lint, the full test suite and the build stay NOT RUN, including for the
two dependency changes made this session. Recorded as such, never as PASS.

**Validation:** all three outcomes are quoted verbatim in
[`../qa/AUTONOMOUS_FINAL_REPORT.md`](../qa/AUTONOMOUS_FINAL_REPORT.md).

---

## Decision 18 — Write a validator for the CI workflow instead of reviewing it by eye

**Date:** 2026-09-11 (session 4) · **Area:** CI

**Problem:** the corrected `ci.yml` had already been handed to the owner twice as "the fix".
It had been reviewed by reading. The workflow on the branch had also been reviewed by reading
in an earlier session and declared fixed — and it was not even pushed. Reading is how this
class of defect survives.

**Options considered:**
1. Re-read the file more carefully.
2. Write a linter that encodes the specific failure modes and run it on both versions.

**Selected:** 2 — `scripts/ci-gate-lint.mjs`, six checks: `dead-filter`, `cascade`,
`soft-gate`, `gate-exists`, `gate-honest`, `gate-complete`.

**Why:** the interesting property — "can one job failing destroy another job's evidence?" —
is a transitive-closure question over `needs`. That is not something eyes do reliably across
twelve jobs. Encoding it also makes the rule reusable and reviewable instead of resident in
one session's judgement.

**What it found — including in my own work:**

| Workflow | Result |
|---|---|
| As on `feat/elite-os-v2` | **9 errors** — dead filter, 5 cascades, 2 soft gates, no release gate |
| My corrected file, as previously delivered | **1 error** — `test-coverage-gate` still chained to `test-unit` |
| After fixing that and freeing `build` | **0 errors**, 1 accepted note |

The branch graph, extracted verbatim from GitHub's own workflow view, also reproduces the
observed run exactly: `lint-typecheck` fails → four jobs skip → coverage skips → build skips
→ four more skip = **ten skipped**, which is precisely what run `34331702738` reported. A
model that predicts the observation is worth more than a description of it.

**Two substantive changes it forced:**

- `test-coverage-gate` lost `needs: test-unit`. It runs `pnpm test:coverage`, which re-runs
  the suite itself and consumes no artifact — the chain only meant a unit failure also erased
  the coverage evidence.
- `build` lost its seven-job `needs`. "Does it compile?" is independent of "do the tests
  pass?", and chaining it is why the run produced no build evidence at all.

Neither lowers the bar: `release-gate` still fails unless every required job actually
succeeded. Independence widens the evidence a red run produces.

**Risk:** the validator's `REQUIRED_JOBS` list is a judgement call and will need editing when
jobs are added or renamed — it errors loudly on a name it cannot find, which is the right
failure direction. `yaml@2.9.0` is in the lockfile transitively but not declared, so
`pnpm add -D yaml` before relying on it in CI.

**Validation:** both workflows linted; before/after quoted in
[`../qa/CI_RECONCILIATION.md`](../qa/CI_RECONCILIATION.md). A parsed check confirms the only
`continue-on-error` occurrences in the corrected file are inside comments explaining their
removal.

---

## Decision 19 — Stop short of git rather than simulate the chain

**Date:** 2026-09-11 · **Area:** environment

**Problem:** this phase's goal is `local fix → git → push → CI → build`. Every step after the
first needs git, which needs a shell on the repository.

**Re-tested this session:** `device_bash` still fails —
`sandbox-helper: no Plan9 drive shares mounted`, with the platform note that a Windows update
of 2026-09-08 is the cause and that Claude Code is unaffected. The desktop app has since
updated (1.40609.1 → 1.52386.0) and the mount is still broken. `get_device_info` reports
`localMcpServers: []`, so there is no local MCP bridge either. Cursor remains click-tier.
Cloning into the container remains refused by the *Untrusted Code Integration* guardrail.

**Selected:** do not claim any part of the chain. Spend the phase making the one action that
starts it — applying `ci.yml` — correct by construction, and prove that with a validator
rather than an assertion.

**Why:** a commit, a push and a CI run cannot be fabricated, and the documentation already
suffered once from a fix recorded as applied that was never pushed. Repeating that pattern in
the other direction would be worse than reporting a blocker.

**Risk:** the phase's actual objective is unmet. Stated plainly rather than dressed up.

---

## Decision 20 — Cursor executes commit → push → CI; do not wait for a human on engineering

**Date:** 2026-09-12 · **Area:** process / CI

**Problem:** sessions 1–3 left a validated working tree uncommitted because `device_bash`
could not reach `D:\fitconnect`. The branch on GitHub was still `5b685cb` with the broken
Turbo filter. This Cursor session has a real shell.

**Options considered:**
1. Ask whether to commit/push.
2. Commit, push to `feat/elite-os-v2`, and loop on real CI failures.

**Selected:** 2.

**Why:** the operator authorized inspect/edit/test/build/commit/push/monitor/fix/repeat
and forbade asking for those decisions. Security, correctness, and evidence beat delay.
Never `git reset --hard`, never force-push.

**Also decided this session:**
- Apply `Claude outputs/ci-1.yml` (0-error validator graph) rather than the half-patched
  working-tree `ci.yml` that still had `continue-on-error` on security and chained `build`.
- Keep `pnpm audit --audit-level critical --prod` as the blocking security gate; print
  highs with `|| true` rather than silencing Semgrep.
- Include `feat/**` in the Lighthouse `if:` so this branch is not skipped by a
  `feature/**`-only filter.
- Declare `yaml@2.9.0` at the workspace root so `scripts/ci-gate-lint.mjs` resolves in CI.
- Do not re-apply migrations 017–029; schema reconcile is **0 errors**.
- Strava empty tables remain "not a breach"; rotation stays precautionary.

**Validation:** local gates in `AUTONOMOUS_WORK_STATE.md`. GitHub proof comes after push.

---

## Decision 21 — Fix landing a11y/DOM, do not weaken Playwright specs

**Date:** 2026-09-12 · **Area:** web E2E / landing

**Problem:** Run `34680853231` failed required Playwright E2E. Local reproduction showed
strict-mode dual `<h1>`, `#demo` not in the DOM, `#pricing` never mounted under wheel
scroll, and CTA locators matching both hero and Final CTA.

**Options considered:**
1. Relax Playwright locators / drop the four specs.
2. Fix the page: one visible `h1`, hoist `#demo`/`#pricing` into the document, restore
   `SYS.STATUS` chrome, scope CTA assertions to the hero.

**Selected:** 2.

**Also decided:** pixel `toHaveScreenshot` is not asserted when `CI=true` because there
are no committed linux baselines and win32 PNGs will not match ubuntu runners. Semantic
visual checks (heading, SYS.STATUS, pricing copy, contrast) remain required.

**Validation:** `CI=true` Playwright mobile-chrome on the four CI files: **17/17 PASS**.
