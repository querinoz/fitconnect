# Phase 12 — Dependency Security Report

## Scope

- Web: `pnpm` monorepo root + `apps/web/package.json`
- Android: Gradle version catalogs / module `build.gradle.kts`
- Packages: `@fitconnect/strava-integration`, etc.

## Current practices

| Practice | Web | Android |
|----------|-----|---------|
| Lockfile | `pnpm-lock.yaml` | Gradle lock (if enabled) |
| CI dependency install | GitHub Actions | Gradle assemble |
| Automated CVE scan | **Not in Phase 12 CI gate** | **Not in Phase 12 CI gate** |
| Dependabot/Renovate | Unknown — check repo settings | Same |

## High-value dependencies (security-sensitive)

| Package | Risk |
|---------|------|
| `@supabase/ssr`, `@supabase/supabase-js` | Auth/session |
| `next` | SSR, middleware |
| `@stripe/stripe-js` | Payments |
| OkHttp / Retrofit (Android) | TLS transport |
| Compose / AndroidX Security Crypto | UI + encrypted storage |

## Phase 11 notes

- Release R8 minify enabled (Phase 11) — reduces reverse-engineering surface
- No Expo/RN in production Android path

## Recommendations

1. Add `pnpm audit` / `osv-scanner` to CI with fail on critical
2. Gradle `dependencyCheck` or GitHub Dependabot for Android
3. Pin Supabase/Next major versions; review release notes
4. Document exception process for accepted CVEs

## Phase 12 status

**No dependency upgrades executed as part of Phase 12 security docs.** Audit is **process + inventory** only.

## Verdict

Dependency security relies on **manual/CI hygiene** — **automated CVE gate not verified** in this phase.
