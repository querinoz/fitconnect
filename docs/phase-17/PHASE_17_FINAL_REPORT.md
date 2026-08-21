# PHASE 17 — final report

> **HISTORICAL** (2026-08-15). Canonical status: [../master-plan/23_GO_NO_GO.md](../master-plan/23_GO_NO_GO.md). **PRODUCTION = NO-GO**. Do not treat ENGINEERING_COMPLETE as a launch GO.

**Date:** 2026-08-15  
**Branch:** `chore/android-phase-13r-recovery`  
**Base HEAD (pre-cleanup):** `20173c8`  
**STATUS:** BLOCKED (environment + REVIEW items)  
**ENGINEERING_COMPLETE:** PASS  
**WHATSAPP_REPORTING:** PENDING_HUMAN  

## Executive summary

Phase 17 performed an evidence-based cleanup of generated junk, duplicate brand files at the repository root, and committed Gradle logs. Official WhatsApp reporting was added as an abstraction (Meta Cloud / Twilio) without unofficial WhatsApp Web automation.

Nothing was deleted on assumption. Frozen Expo (`apps/mobile`), historical phase docs, `ui-glass`, dual Prisma/Supabase schema, and unused-looking `public/logo.png` remain as **REVIEW_REQUIRED**.

## Repository before

- Dirty/untracked: Expo env note, `.expo/`, `__pycache__/`, QA logs, `START-TESTE.bat`
- Root dump: duplicate logos + landing `artifacts-*.png`
- Tracked Gradle logs under `qa/reports/`

## Repository after

- `.gitignore` covers Python caches, Expo `.expo`, QA logs/pids, root APKs
- Brand masters remain in `brand-sources/`
- Historical screenshots under `qa/archive/root-screenshots/`
- Reporting under `scripts/reporting/`
- Makefile exposes `web`, `web-test`, `landing`, `watch`, `report-whatsapp`

## Files deleted

See [DELETION_MANIFEST.md](./DELETION_MANIFEST.md).

- **25** obsolete/generated files removed (9 previously tracked + untracked logs/launcher/caches)
- **2** generated directories removed (`.expo`, `__pycache__`)

## Files moved

- 10 `artifacts-*.png` → `qa/archive/root-screenshots/`
- `fitconnect-logo.svg` → `brand-sources/fitconnect-logo-root-variant.svg` (different hash; kept)
- `CREATE DESIGN-SYSTEM.md` → `docs/archive/CREATE-DESIGN-SYSTEM.md`

## Files merged

Duplicate UI components (**EliteButton** / **VoltButton**) were **not** merged — both still have live imports.

## Dependencies removed

**0.** pnpm/Gradle unused-dependency removal was not executed: no `pnpm why` proof that a package is unreferenced across all platforms.

## Assets removed

4 hash-identical root brand duplicates (`LogoBase.png`, `LogoInicial.webp`, `fitconnect-logo (1).svg`, `fitconnect-logos-20.html`). Canonical copies stay in `brand-sources/`.

Canonical fonts (Syne, Plus Jakarta Sans, JetBrains Mono) remain as the three Android `res/font` files. Web fonts were not duplicated on disk in this audit.

## Legacy code removed

`START-TESTE.bat` (untracked Expo launcher). Expo app itself **kept** (workspace + EAS).

## Security findings

See [SECURITY_FINDINGS.md](./SECURITY_FINDINGS.md). **3** findings (1 low fixed, 2 info). No production private keys found in git.

## Android validation

| Check | Result |
|-------|--------|
| `android/gradlew.bat :app:assembleDebug` | PASS (BUILD SUCCESSFUL) |
| `android/gradlew.bat test` | **154/154** (0 fail, 0 error, 0 skip) |
| Emulator / Maestro | **BLOCKED** (hypervisor / AEHD not installed; `adb` empty) |

## Web validation

| Check | Result |
|-------|--------|
| `pnpm --filter @fitconnect/web typecheck` | PASS |
| `pnpm --filter @fitconnect/web test` | **239/239** (92 files) |
| Sessions API tests | Fixed mock (`requireAthleteId` / `requireCoachId`) — was 503 vs real auth helpers |
| Reporting unit tests | **2/2** (`node --test scripts/reporting`) |

## Landing validation

Landing is the Next.js marketing routes inside `apps/web` (not a separate app).

| Check | Result |
|-------|--------|
| `marketing-route-audit.test.ts` | PASS (2/2) |
| `pnpm --filter @fitconnect/web build` | PASS (includes `/` marketing + `/app/mobile`) |

## watchOS validation

`WATCHOS_RUNTIME_TEST = PENDING_ENVIRONMENT` — no Xcode/Swift tree. Wear OS (`android/wear`) is a different platform; see [WEARABLE_SUPPORT_MATRIX.md](./WEARABLE_SUPPORT_MATRIX.md).

## Tests / builds / emulator

- Android tests: 154/154 PASS  
- Web tests: 239/239 PASS  
- Build: Android assembleDebug PASS · Web/landing Next build PASS  
- Emulator: BLOCKED  

## Known limitations

- `apps/mobile` Expo remains in the monorepo by ADR-005 freeze.
- VoltButton / EliteButton coexistence.
- `make watch` documents PENDING_ENVIRONMENT (does not fake a watchOS compile).
- Full `pnpm test` / `pnpm typecheck` turbo across every package was not required after web+android evidence; web filter + Gradle were run.

## Pending human

- WhatsApp Business credentials (Meta Cloud or Twilio)
- Emulator hypervisor for device smoke
- Apple Developer + watch hardware for watchOS
- Product decision: archive vs keep Expo Path A

## Git status

Recorded after commit in this report’s companion `STATUS.json` / git log. Push: **NOT PERFORMED**.

## Report hash

SHA-256 of this file is written to [REPORT_SHA256.txt](./REPORT_SHA256.txt) after the file is finalized (hashing the report cannot include its own digest).
