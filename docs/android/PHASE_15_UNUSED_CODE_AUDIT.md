# PHASE_15_UNUSED_CODE_AUDIT.md

**Date:** 2026-08-10  
**Scope:** `android/` + QR distribution scripts  
**Policy:** No blind deletion. Historical docs KEEP.

## Summary

No **DELETE**-safe runtime candidates for Phase 15 local device release.  
QR distribution tooling is complete and reused (not recreated).  
Community engines without UI wiring and Wear/core-capture scaffolds remain **REVIEW**.

## Tables

### Product / DI

| KEEP | DELETE | REVIEW | WHY | EVIDENCE |
|------|--------|--------|-----|----------|
| Geo / Sports / Telemetry / AI DI engines | — | — | Wired + used by screens/tests | containers + repositories |
| Community feed/posts/reactions/comments | — | programs/challenges/moderation unused by CommunityScreen | Seeded + DI; UI subset | `CommunityScreen.kt` |
| — | — | `AchievementEngine`, `LeaderboardEngine` | Not in DI; leave pending proof | own files only |
| `LiveSessionPreviewMachine` | — | — | Training LOCAL_DEMO FSM | tests + TrainingScreen |
| DesignSystemCatalog empty `onClick` | — | — | Showcase only | `DesignSystemCatalog.kt` |
| — | — | `:core-capture`, `:wear` | Scaffold / Wear app; not phone QR APK surface | settings + manifests |

### Secrets / Expo

| KEEP | DELETE | REVIEW | WHY | EVIDENCE |
|------|--------|--------|-----|----------|
| Demo `password1` labels | — | — | Explicit LOCAL_DEMO | `DemoPersona` |
| BuildConfig secret injection | — | keep props gitignored | No committed JWT/AIza | `app/build.gradle.kts` |
| Expo freeze note in README | — | — | Path A documentation | `android/README.md` |

### Design tokens

| KEEP | DELETE | REVIEW | WHY | EVIDENCE |
|------|--------|--------|-----|----------|
| `:design` generated tokens | — | — | Canonical | `EliteSurfaceTokens.kt` |
| `:design-ui` Dp/Color adapters | — | — | Layer over `:design`, not duplicate | `Tokens.kt` |
| Hex only in token file | — | FLOOR `#070B14` vs brief `#090402` | Install page uses `#090402`; app tokens ADR-aligned | intentional brand surfaces |

### QR distribution

| KEEP | DELETE | REVIEW | WHY | EVIDENCE |
|------|--------|--------|-----|----------|
| `run-local-distribution.ps1` | — | — | Primary human install path | `pnpm android:qr` |
| `lib/make_qr_svg.py` + `vendor/qrcodegen.py` | — | — | Offline QR SVG | MIT vendor NOTICE |
| `install-page.template.html` | — | — | Branded page | no CDN |
| `.fitconnect-local-distribution/` | — | — | Generated only; gitignored | `.gitignore` |

## Deletion actions this phase

**None.** REVIEW items left in place.
