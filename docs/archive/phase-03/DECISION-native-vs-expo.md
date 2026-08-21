# Phase 03 Decision — Design System on native Compose

**Date:** 2026-08-07 · **Authority:** ADR-005 / ADR-007 + Phase 02 approval

The Phase 03 prompt mentions React Native / FlashList. Design System 2.0 is implemented as:

| Prompt | Native |
|--------|--------|
| FlashList | `EliteLazyList` (LazyColumn + P2R + pagination) |
| RN components | `:design-ui` Compose components |
| Tokens | `packages/design-tokens` → `pnpm tokens:kotlin` → `:design` |

No Athlete / Coach / Dashboard / AI / Maps / Community screens.
