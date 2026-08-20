# 07 — Design audit

**Date:** 2026-08-20  
**Phase lock:** `P0-DOCS`

## Canonical

- Tokens: `apps/web/app/elite-os.css`, `packages/design-tokens`, `EOS_COLORS`
- Display: Syne · Body: Plus Jakarta Sans · Metrics: JetBrains Mono
- Accents: `--eos-voltline` `#C8FF00` · `--eos-connect` `#00DDB4` · floor `#070B14`
- Dark-first, `prefers-reduced-motion` + `data-motion="reduced"`
- New components: **zero hardcoded hex**

## Strengths

Landing, trust strip, Elite auth shell, Android Elite components, athlete IA layout.

## Gaps (not v1 blockers except legal/a11y)

| Gap | Phase |
| --- | --- |
| Footer Privacy/Terms `href: "#"` | **P0-SEC** |
| Dashboard i18n still EN-heavy | P2-CORE |
| `ui-glass/` ~47 imports leftover | gradual; do not delete until migrated |
| `--volt-*` aliases deprecated | keep until migration done |
| Landing cinematic / Higgsfield | **deferred** (after P0–P2) |
| Map as product chrome | after **P2-GPS** |
| Stitch pixel compare | HUMAN (HTTP 500 historically) |

## IA (frozen)

Athlete compact: flexible/floating bar + FAB. ≥600dp collapsed rail. ≥1240dp expanded rail. **Zero drawer.** Social/squad live inside Today and Analysis, not as a fifth tab.

## Design work forbidden until P0-SEC + P1-DATA

New marketing pages, Reels UI, Squad map chrome, extra gamification skins.
