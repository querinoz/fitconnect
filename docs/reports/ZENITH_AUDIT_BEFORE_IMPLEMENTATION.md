# Zenith — Audit Before Implementation

**Date:** 2026-09-08  
**Rule:** Improve what works. Do not rebuild PASS surfaces.

## KEEP (already strong — polish only)

| Surface / asset | Evidence | Action |
|-----------------|----------|--------|
| Athlete IA `Feed · Ascend · TRAIN · Dashboard · Profile` | `ZENITH_MOBILE_IA.md`, `AthleteScaffold` | Lock — no rename / no Dashboard-first |
| `EosTrainActionFab` + bottom chrome | design-ui | Visual polish only |
| Ascend LEVEL ring + progression rows | prior visual contract | Keep hierarchy |
| Dashboard dual Readiness/Load rings | prior pass | Keep telemetry here, not Feed |
| Train START SESSION + photo hero | StrengthWorkoutScreen | Evolve hero → multi-sport carousel |
| Cinematic splash Get Started | FitConnectNavHost | Swap gym-only bg → multi-sport; wire real mark |
| Feed stories + wordmark + search | FeedScreen | Extract `EosStoryRing`; keep IA |
| `EliteMotionTokens` + reduced motion | design-ui/motion | Extend durations to DNA; don’t fork |
| Neu-glass / `EosGlassSurface` | ELITE_OS_NEU_GLASS | ≤2 blur layers — optical glass |
| Brand lock Floor / Voltline / Iris / Telemetry | elite-surface | Hard lock |
| Strava non-social / Spotify metadata-only | AGENTS.md | Hard lock |

## IMPROVE (this wave)

| Item | Gap | Fix |
|------|-----|-----|
| Brand mark vector | Simplified block-F; missing slash, ticks, EKG | Accurate `ic_fitconnect_logo` + transparent `ic_fitconnect_mark` |
| Splash / boot | Text “FC”; single sport-ish bg | Mark + multi-sport crossfade |
| Train hero | Gym-forward single still | Multi-sport crossfade |
| Feed hierarchy | Filter chips compete with media | Soften chips when `embeddedInFeed`; taller media |
| Story rings | Inline Feed only | Canonical `EosStoryRing` |
| Feed post social row | Chip soup | Media-first card + reaction row polish |
| Loading chrome | Text spinner only | Brand mark on boot |

## CREATE (system, not screen clones)

| Artifact | Purpose |
|----------|---------|
| `ZENITH_MOBILE_VISUAL_DNA.md` | Canonical mobile visual contract |
| `EosStoryRing` | Shared story component |
| `EosMultiSportHero` | Dynamic multi-sport media plane |
| SVG brand archive | `docs/brand/fitconnect-mark.svg` |

## DO NOT

- Rebuild Splash / FAB / Ascend / Dashboard from scratch
- Clone reference IA (CONNECT / CHAT / gym Chest-Legs)
- Second design system beside `android/design-ui`
- Blind `.md` deletion
- Expo / RN / Flutter migration
- Claim PASS without assemble / screenshot evidence

## Figma

**BLOCKED** — no Figma MCP in catalog. Fallback: Visual DNA + existing tokens + reference language.
