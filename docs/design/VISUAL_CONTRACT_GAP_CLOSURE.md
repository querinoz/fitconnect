# Live vs Phase 0 Visual Contract — Gap Closure

**Date:** 2026-09-08  
**Source:** User screenshots vs `docs/design/visual-contract/fc-vc-0{1..5}-*.png`

## What was missing (before this pass)

| Area | Contract | Live (your screenshots) | Gap |
|------|----------|-------------------------|-----|
| TRAIN FAB | Center docked Voltline orb + TRAIN | Bottom-right play circle | Position + label |
| Feed | Media-first posts, light chrome | Inline composer + chip density | Composer clutter |
| Feed wordmark | Fit + Connect (Voltline) | Flat FitConnect | Brand split |
| Ascend | Huge centered LEVEL ring | Small side-by-side ring | Hero scale |
| Dashboard | Dual Readiness/Load rings first | HC Update card + dense stack | Hierarchy |
| Train | Hero card + START SESSION | Plain prep list | Energy |
| Splash | Cinematic brand + Get Started | Debug Welcome modal | Entry chrome |
| Bottom IA labels | Some mock tabs (CONNECT/CHAT) | Zenith IA (Feed/Ascend/…) | **Kept Zenith** (product lock) |

## Applied this pass

1. `FabPosition.Center` (athlete + coach) + TRAIN orb with Bolt + label  
2. Feed: hide inline composer when embedded; Create → sheet only  
3. Feed wordmark: **Fit** + Voltline **Connect**  
4. AscendXPBar: 220dp centered LEVEL hero ring  
5. Dashboard: dual rings first; HC / demo demoted; AI FAB removed from Dashboard  
6. Train Prep: Voltline-bordered hero + **START SESSION**  

## Intentionally NOT cloned 1:1 from mock PNGs

- Mock “CONNECT / CHAT / HOME” tabs → **Zenith lock** stays `Feed · Ascend · [TRAIN] · Dashboard · Profile`  
- Mock coach “Active Clients” on Dashboard → athlete readiness/load only  
- Photographic gym heroes → need licensed media pack (not invented as fake Strava social)

## Still soft gaps

- Splash still routes through DEBUG Welcome before brand moment  
- Real athletic photography assets not bundled  
- Coach Feed header chrome still lagging athlete FitConnect rename  
