# Phase 04 — Accessibility Report

## Implemented

| Requirement | Status |
|-------------|--------|
| TalkBack labels | `testTag`s on OS shell/screens; chart `contentDescription`; Design System buttons use semantics from Phase 03 |
| Touch targets | Inherited from `:design-ui` / foundation `Accessibility.MIN_TOUCH_TARGET_DP` |
| Large fonts | Material3 typography + no fixed sp clamps in athlete screens |
| Reduce motion | Theme `data-motion` / Elite motion presets from Phase 03 apply globally |
| Edge-to-edge | App `MainActivity` + Scaffold padding |
| Landscape / tablet | `LazyColumn` + fillMaxSize scaffolds — fluid; foldable-specific postures not specially handled |

## Gaps / debt

- Dedicated content descriptions for every score block (ScoreBlock uses visible text — usually enough for TalkBack)  
- Bottom nav icons are text glyphs (`H/R/T/…`) — replace with vector icons + `contentDescription`  
- No automated Espresso/Compose a11y checks in CI yet  

## Device a11y QA

TalkBack walkthrough on API 33/34/35 — **blocked** pending emulator (see `qa/HUMAN-QUEUE.md`).
