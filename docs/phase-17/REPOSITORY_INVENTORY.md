# PHASE 17 — repository inventory

Classification of **significant** trees. UNKNOWN/REVIEW are not deleted.

| Path | Class | Platform | Notes |
|------|-------|----------|-------|
| `android/` | KEEP | ANDROID_KOTLIN | Canonical native app |
| `android/wear/` | KEEP | ANDROID_KOTLIN | Wear OS, not watchOS |
| `apps/web/` | KEEP | WEB_APP + LANDING | Marketing + app in one Next app |
| `apps/mobile/` | REVIEW | — | Expo frozen; workspace + EAS still reference it |
| `packages/*` | KEEP | SHARED | types, tokens, strava, api-client, … |
| `elite-core/` | KEEP | SHARED | Rust engine (ADR-006) |
| `prisma/` `convex/` `supabase/` | KEEP | SHARED/BUILD | Dual schema known; not deleted |
| `docs/` | KEEP | DOCUMENTATION | Historical phases retained |
| `qa/` markdown | KEEP | QA | `gate-F0.md`, `mobile-android-audit.md` |
| `qa/reports/*.log` | DELETE (generated) | QA | Should not be versioned |
| `scripts/` | KEEP | BUILD | make-*.ps1, tokens, env |
| `.github/workflows/` | KEEP | CI_CD | Includes EAS (Expo) while `apps/mobile` lives |
| `Makefile` `package.json` `pnpm-workspace.yaml` | KEEP | BUILD | |
| `START-TESTE.bat` | DELETE | — | Untracked Expo launcher; superseded by `make start` / `pnpm android:qr` |
| `apps/mobile/.expo/` | GENERATED / DELETE | — | Local Expo cache |
| `android/**/build` `.gradle` | IGNORED | GENERATED | |
| `node_modules` `.next` | IGNORED | GENERATED | |
| `watchos/` | ABSENT | WATCHOS | Do not invent a tree |
| Alert.io / Tokio School | ABSENT | — | Not in this repo |

## Duplicate UI (REVIEW, not merged this phase)

| Names | Canonical today | Action |
|-------|-----------------|--------|
| `EliteButton` (Compose + elite-os) | KEEP | Android + new web |
| `VoltButton` (`ui-glass`) | KEEP | ~still imported |
| `PremiumButton` | used by Stitch screens | KEEP until migration |

Migrating ui-glass is a product change, not a cleanup batch.

## Duplicate assets (REVIEW)

`apps/web/public/logo.png` vs `/brand/fitconnect-logo.png` — brand-logo.tsx uses `/brand/fitconnect-logo.png`. `public/logo.png` has **no TS/HTML references found**. **REVIEW_REQUIRED** (may be linked externally). Not deleted.
