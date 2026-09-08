# Zenith Mobile Experience 2.0 — Progress Gate

**Date:** 2026-09-08  
**Policy:** Improve-not-rewrite · Zero fake PASS

## Phase status

| Phase | Status | Evidence |
|-------|--------|----------|
| 0 Skills/MCP | DONE | `docs/reports/ZENITH_SKILLS_USAGE.md` — Figma MCP **BLOCKED** |
| 1 Audit | DONE | `docs/reports/ZENITH_AUDIT_BEFORE_IMPLEMENTATION.md` |
| 2 Visual DNA + logo | DONE | `docs/design/ZENITH_MOBILE_VISUAL_DNA.md`, `docs/brand/fitconnect-mark.svg`, `ic_fitconnect_logo` + `ic_fitconnect_mark` |
| 3–6 System + Feed polish | PARTIAL | `EosStoryRing`, taller media, soft chips, boot mark — Ascend/Dashboard not rewritten (KEEP) |
| Multi-sport hero | DONE | `EosMultiSportHero` on splash + Train |
| Build | PASS | `:app:assembleDebug` |
| Motion unit | PASS | `EliteMotionTokensTest` |
| Emulator visual | PASS (sampled) | `docs/design/visual-contract/live/zenith20_01_splash.png`, `zenith20_02_feed.png` |
| Maestro | BLOCKED | CLI not on PATH |
| Real physical device | BLOCKED | USB not used this wave |
| Full QA report (phases 12–21) | NOT STARTED | Deferred — system foundation first |

## What changed (improve)

- Brand mark vector matches attached logo (slash-F, ticks, EKG)
- Splash: multi-sport crossfade + mark (not gym-only / not “FC” text)
- Train hero: multi-sport carousel
- Feed: `EosStoryRing`; media height 320dp; softer embedded filters
- Loading: brand mark
- Motion tokens aligned to Visual DNA (120 / 260 / 420)

## Explicitly not redone

Splash IA, TRAIN FAB, Ascend ring, Dashboard dual rings, athlete tab IA.
