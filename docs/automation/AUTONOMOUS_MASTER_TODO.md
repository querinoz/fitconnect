# FitConnect Autonomous Master TODO

Last swept: 2026-09-12 (Cursor commit → push → CI recovery). Every item carries the
evidence that put it here. Items with no evidence line were not verified and say so.

## P0

**None open.** Production dependency criticals: **0**. Production RLS gaps: **0**.
Anonymous write surface: **0**.

- [x] ~~`maplibre-gl@5.24.0` → `>=6.4.1`~~ — **done,** now 6.9.0 with `react-map-gl` 8.1.3.
      Session 2's "not reachable" verdict was **overturned**: `fit-connect-map.tsx` sets
      `attributionControl={{ compact: true }}` and the style is fetched from
      `tiles.openfreemap.org`, so MapLibre renders third-party `source.attribution` HTML
      through the very sanitizer `CVE-2026-85061` bypasses. Reachable → upgraded.
      219 lockfile lines, all map stack; zero new advisories. **A map visual smoke is still
      required before release** (listed under Human Required).
- [x] ~~`next@15.5.23` → `>=15.5.24`~~ — done, now 15.5.25 via `pnpm.overrides`.
- [x] ~~Public exposure of `StravaConnection` and 7 other tables~~ — done (`024`).
- [x] ~~Strava token encryption fail-open~~ — done; 8/8 regression tests pass.

## P1

- [x] ~~**CI workflow corrected locally**~~ — 2026-09-12 Cursor: applied validated `ci-1.yml`,
      dropped dead `@fitconnect/mobile` filter, made security blocking, added `release-gate`,
      decoupled independent jobs, included `feat/**` in Lighthouse, wired
      `scripts/ci-gate-lint.mjs`. Validator: **0 errors**. Local typecheck/lint/unit/build
      PASS. **GitHub Actions on the pushed SHA is the remaining proof** — do not mark CI
      green until that run completes.
- [ ] **`Android · Wear assembleDebug` result is UNKNOWN.** The run page says Failed, the
      commit checks page says Succeeded; GitHub needs sign-in for the logs. Someone signed in
      should read that job. `CI_ROOT_CAUSE_ANALYSIS.md`'s claim that it "PASSes independently"
      is unsupported.
- [ ] **Do not treat `android.yml` as Android build evidence.** Success on `5b685cb` in
      **50 seconds**, against 14–18 minute runs on other commits — path-filtered no-op.
- [ ] **Triage the 22 high advisories in the production tree.** Full classification in
      [`docs/security/DEPENDENCY_SECURITY_MATRIX.md`](../security/DEPENDENCY_SECURITY_MATRIX.md).
      Order suggested by that analysis:
      - `fast-uri` (6 advisories, `>=3.1.6`) — highest count in the tree; SSRF variants
        matter wherever a parsed URI is then fetched.
      - `sharp` (`>=0.35.4`) — declared as a root **devDependency** but pulled into the
        production tree by Next's image optimization, so it ships. Parses user images.
      - `brace-expansion` (3), `nanoid` (2), `browserslist` (2), `postcss` (2), then
        `ws`, `protobufjs`, `deepmerge-ts`.
      - `mysql2` and `hono` are transitive and **unreachable** — the product is Postgres
        and does not mount Hono middleware. Record the exception, do not upgrade blind.
- [ ] **`vitest@<3.2.6`** (`CVE-2026-47429`, critical, dev-only — the only critical left
      anywhere, and it never ships) — arbitrary file
      read/execute **only while the Vitest UI server is listening**. CI runs `vitest run`,
      which never starts the UI. Real exposure is a developer running `vitest --ui` on an
      untrusted network. Upgrade to `>=3.2.6`.
- [ ] **Wire `scripts/db-reconcile-schema.mjs` into CI.** Natural home is
      `test-integration`, after `pnpm db:migrate:deploy`. Catches drift introduced *by a
      migration*. It does **not** catch drift introduced outside migrations — which is
      what happened to `community_posts` — so also run it against production before a
      release gate.
- [ ] **Playwright E2E runs under `NEXT_PUBLIC_DEMO_MODE=true`.** A green E2E is evidence
      about the demo path only. `auth-prod-like` is the sole `DEMO_MODE=false` job and it
      runs typecheck plus `test:auth-prod`, not journeys. Move login, identity bootstrap
      and mode switch onto real auth fixtures.
- [ ] **`training_spots.exact_lat` / `exact_lng` are returned to every reader of a
      `PUBLIC`/`APPROXIMATE` row.** Redaction is app-layer only, which AGENTS.md treats as
      a maximum-severity pattern. DB fix: restrict base-table SELECT to the creator and
      expose a view with the exact columns nulled. Check the client read path first.
- [ ] **`auth_rls_initplan`** — 6 policies re-evaluate `auth.uid()`/`current_setting()`
      per row. All six are on the legacy tables below, so this resolves itself when those
      are migrated or dropped. No traffic on the database today.
- [ ] **Vercel production is not on the release SHA** — still serving an older deployment,
      not re-checked this session.

## P2

- [ ] **Legacy schema decision: `001`–`011`.** `profiles`, `athlete_profiles`,
      `coach_profiles`, `reviews`, `sessions`, `programs`, `program_enrollments`,
      `readiness_scores`, `hrv_readings`, `push_tokens`, `notifications`,
      `workout_sessions`. Characteristics: RLS on with zero policies (deny-all), or
      policies calling `auth.uid()` which raises `22P02` under a Firebase UID. All client
      grants removed by `027`/`028`. Classify each KEEP / MIGRATE / ARCHIVE / REMOVE.
      `workout_sessions` is explicitly superseded by `public.activities` (016).
- [ ] **Coach capability is self-service, not entitlement-gated.**
      `PUT /api/v1/identity/role` grants `coach` using the caller's own token, and the RLS
      policy permits `athlete`/`coach`. The architecture says `entitlements → capabilities`.
      The route comment calls it intentional (Decision 4) — confirm, then either gate it or
      write the self-service path down as canonical.
- [ ] **Entitlement expiry → mode fallback is NOT IMPLEMENTED.** A lapsed plan keeps the
      capability.
- [ ] **Stripe webhook → `grantCapability` automation is PARTIAL.**
- [ ] **`deploy-staging` smokes production** —
      `secrets.STAGING_URL || 'https://fitconnect-phi.vercel.app'`.
- [ ] **Enable Supabase leaked-password protection.** Dashboard toggle. HUMAN REQUIRED.
- [ ] **`errorFromResponse` in `packages/strava-integration/src/client.ts`** embeds up to
      200 characters of the upstream response body into an `Error` message. Strava error
      bodies can carry athlete data (AGENTS.md §1) and that message is unbounded in where
      it travels. Truncate to status plus a stable code.
- [ ] **`listPushSubscriptions` / `deletePushSubscription` put `client_secret` in a query
      string.** Query strings are logged by proxies and CDNs. This is how Strava's API is
      specified so it cannot be avoided — keep those two calls confined to the admin
      script (`scripts/register-strava-webhook.mjs`) and never call them from a request path.

## P3

- [ ] **Map visual smoke after the MapLibre major.** Markers, `NavigationControl`, the
      heatmap layer, the OpenFreeMap dark style, `flyTo` from the locate button, and the
      `ResizeObserver` path. The app touches no maplibre API directly — only react-map-gl's
      declarative components plus `MapRef.getMap().resize()` and `flyTo()` — so the blast
      radius is small, but 5 → 6 is a major.
- [ ] 22 unused indexes reported by the linter. Meaningless at current traffic (the whole
      database holds 1 row); re-check under real load, then drop what is still cold.

## P4 — documentation accuracy

- [ ] `docs/qa/` holds roughly 40 overlapping mobile QA reports with contradictory
      verdicts. Collapse to one current document plus an archive.
- [x] ~~`CLAUDE.md` says "Next.js 14"~~ — corrected in session 1.
- [x] ~~README/CLAUDE present P0-SEC as a historical PASS~~ — corrected in session 1.

## Human Required

- [x] ~~Container clone / Claude Code locally~~ — obsolete; Cursor now has a shell on
      `D:\fitconnect`.
- [x] ~~Run `pnpm install && pnpm build && pnpm test` to validate the Next 15.5.25 lockfile.~~
      Cursor 2026-09-12: frozen install, typecheck, lint, unit (524), auth-prod (76), build
      (Next 15.5.25) all PASS.
- [x] ~~Copy the patched `ci.yml`~~ — applied from `ci-1.yml`; validator 0 errors.
- [x] ~~Restore a working shell on `D:\fitconnect`.~~ Cursor agent has full git/shell.
- [ ] Rotate the Strava client secret. **Precautionary, not incident response** —
      `StravaConnection` holds 0 rows, so nothing could have been read during the exposure
      window. Session 1 overstated this; the correction is recorded in
      AUTONOMOUS_WORK_STATE.md.
- [ ] Enable leaked-password protection in the Supabase dashboard.
- [ ] Map visual smoke after the MapLibre 6.9.0 major (markers, locate/`flyTo`, OpenFreeMap).
- [ ] Physical Android install and dual-mode smoke of the ONE-LOGIN APK (MIUI may block taps).
- [ ] Decide whether Vercel production is promoted to the current branch SHA.

## Completed — session 3

- [x] MapLibre reachability re-analysed properly (direct/transitive, bundle, server vs
      client, reachable API) — verdict reversed and the upgrade applied.
- [x] ONE LOGIN verified on web: role selection is signup-only; the persona-OAuth shortcut
      is gated by `authBackend() !== "demo"`; zero forbidden markers.
- [x] `lib/db/client.ts` — Prisma construction error no longer logs `DATABASE_URL`.
- [x] Logging sweep: 4 `console.*` calls, two dev-only, zero secret-shaped.
- [x] Three shell-recovery routes attempted and documented; none worked around.

## Completed — session 2

- [x] `023` applied after a full dependency analysis (SAFE: CHECK, 0 dependents, 0 rows).
- [x] `027` — legacy `workout_sessions` client grants removed, deprecation recorded in the
      schema.
- [x] `028` — `anon` read-only across `public`. 36 tables → 0 writable; 41 still readable.
- [x] `029` — `FORCE ROW LEVEL SECURITY` on all 59 tables, making the invariant assertable.
- [x] `scripts/db-reconcile-schema.mjs` — six-check drift detector, 0 errors against a full
      local replica.
- [x] `docs/security/DEPENDENCY_SECURITY_MATRIX.md` — every high/critical classified by
      direct-vs-transitive, prod-vs-dev, reachable-vs-not.
- [x] `docs/qa/PRODUCTION_SCHEMA_RECONCILIATION.md` — "recorded as applied ≠ in force",
      with the three drifts that produced the rule.
