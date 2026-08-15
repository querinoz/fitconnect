# PHASE 17 — deletion manifest

Evidence-based actions only. Untracked generated files are listed even though they were never versioned.

| File | Action | Reason | Evidence |
|------|--------|--------|----------|
| `START-TESTE.bat` | DELETE | obsolete Expo+web launcher | Untracked; superseded by `make start` / `pnpm android:qr`; starts frozen Expo |
| `qa/reports/*.log` (tracked F0–phase04) | DELETE | generated Gradle tails | Should never be committed; `.gitignore` now covers `qa/reports/*.log` |
| `qa/reports/*.log` / `*.pid` / `*-selftest.json` (untracked) | DELETE | generated | Local QR/emulator/dev tails |
| `android/scripts/lib/vendor/__pycache__/` | DELETE | generated | Python bytecode |
| `apps/mobile/.expo/` | DELETE | generated | Expo cache |
| `docs/android/qa/device-launch-log.txt` | DELETE | generated | Local device log |
| `LogoBase.png` | DELETE | duplicate | SHA-256 matches `brand-sources/LogoBase.png`; `scripts/recolor-logo.mjs` now points at brand-sources |
| `LogoInicial.webp` | DELETE | duplicate | SHA-256 matches `brand-sources/LogoInicial.webp`; no code references |
| `fitconnect-logo (1).svg` | DELETE | duplicate | SHA-256 matches `brand-sources/fitconnect-logo (1).svg` |
| `fitconnect-logos-20.html` | DELETE | duplicate | SHA-256 matches `brand-sources/fitconnect-logos-20.html` |
| `fitconnect-logo.svg` | MOVE | root cleanup | Different hash from brand-sources copy → `brand-sources/fitconnect-logo-root-variant.svg` |
| `artifacts-*.png` (10 files) | MOVE | root dump | No code/docs references; kept as `qa/archive/root-screenshots/` |
| `CREATE DESIGN-SYSTEM.md` | MOVE | superseded note | Canonical is `docs/DESIGN_SYSTEM.md`; archived at `docs/archive/CREATE-DESIGN-SYSTEM.md` |
| `apps/mobile/` | REVIEW_REQUIRED | frozen Path A | Still in `pnpm-workspace.yaml` + EAS workflow; ADR-005 freeze |
| `ui-glass/VoltButton` vs `elite-os/EliteButton` | REVIEW_REQUIRED | semantic duplicate | Both still imported; no merge this phase |
| `apps/web/public/logo.png` | REVIEW_REQUIRED | unused in TS/HTML | May be linked externally; not deleted |
| Expo / Flutter / Alert.io trees | KEEP / ABSENT | — | Expo kept frozen; Flutter/Alert.io not present |

**Not deleted:** historical `docs/phase-*`, `elite-core`, `convex`, `prisma`, `supabase`, `packages/*`, Android modules in `settings.gradle.kts`.
