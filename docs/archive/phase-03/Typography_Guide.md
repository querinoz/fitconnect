# Phase 03 — Typography Guide

| Style | Token | Size | Weight | Family role | Usage |
|-------|-------|------|--------|-------------|-------|
| Display XL | `displayXl` | 40 | 700 | display (Syne) | Hero / brand moments |
| Display L | `displayL` | 32 | 700 | display | Section openers |
| Headline | `headline` | 24 | 700 | display | Screen titles |
| Title | `title` | 20 | 600 | body | Card titles |
| Subtitle | `subtitle` | 16 | 600 | body | Emphasized body |
| Body | `body` | 15 | 400 | body (Jakarta) | Default copy |
| Caption | `caption` | 12 | 500 | body | Meta |
| Overline | `overline` | 11 | 600 | body | SYS labels |
| Metric | `metric` | 28 | 600 | mono | KPIs |
| Monospace | `monospace` | 13 | 500 | mono | Codes / IDs |

Mapped into Material3 `Typography` via `EliteTypographyStyles`. Use `EliteMetricTextStyle` / `EliteMonoTextStyle` for non-M3 slots.

**Gap:** Bundle Syne / Plus Jakarta Sans / JetBrains Mono font files in `:design-ui` assets next — families currently fall back to platform Sans/Mono while sizes/weights/tracking stay token-true.
