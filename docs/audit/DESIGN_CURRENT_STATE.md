# Design Current State

**Date:** 2026-09-02
**Compared to:** Elite OS design system + Wave 7 screenshot + Gym UI Kit reference (prior visual audit)

---

## Brand

| Item | Status | Notes |
|------|--------|-------|
| Logo | MATCH (assets exist) | `apps/web/public/brand/*`, Android drawable untracked |
| Tagline | MATCH | Connect. Train. Perform. |
| Positioning | MATCH | Elite Performance OS â€” not generic gym kit |

## Tokens

| Token | Spec | Implementation |
|-------|------|----------------|
| Floor `#070B14` | Canonical | MATCH |
| Voltline `#C8FF00` | One hero/screen | MATCH on athlete surfaces |
| Connect / telemetry / iris | Canonical | MATCH tokens; UI usage PARTIAL |
| Chart Z1â€“Z5 | CHART_TOKENS | MATCH Analysis/Achievements/Train |

## Typography

| Face | Status |
|------|--------|
| Syne | MATCH (wave 6 mapping) |
| Plus Jakarta Sans | MATCH |
| JetBrains Mono (SYS labels) | MATCH athlete; denser than gym-kit sans |

## Chrome

| Pattern | Status vs spec |
|---------|----------------|
| Neu-glass (data neumorphic, chrome glass) | MATCH athlete waves 0â€“7 |
| â‰¤2 blur layers | MATCH documented; not re-measured this audit |
| Destructive = plain text | MATCH Profile |
| Coach neu-glass | MISMATCH â€” not applied |
| Web dashboards | PARTIAL vs Android athlete |

## Motion / background

| Item | Status |
|------|--------|
| Geometric floor pattern | MATCH Today |
| Reduced motion | PARTIAL (web flags exist) |

## Navigation / header

| Surface | vs IA (Today Â· Analysis Â· Achievements Â· Profile + Train FAB) |
|---------|---------------------------------------------------------------|
| Android athlete | MATCH |
| Gym UI Kit (Home/Workouts/Progress/Profile) | Intentionally different â€” **do not copy** |
| Web athlete nav | PARTIAL historical divergence |

## Profile / ASCEND / Workout / Telemetry / Map / Watch

| Surface | vs design system | vs gym-kit mock |
|---------|------------------|-----------------|
| Profile | PARTIAL neu-glass | Less photo-hero â€” intentional |
| ASCEND vault | PARTIAL | More OS, less game |
| Workout execution | MISSING | Gym kit **ahead** (Start Workout, set list) |
| Telemetry Today | MATCH editorial Wave 7 | More clinical than kit |
| Map | PARTIAL polyline | Kit has no GPS OS |
| Watch | PARTIAL | Not in gym kit |

## Visual gap summary

| Comparator | Result |
|------------|--------|
| FitConnect design system (athlete) | **MATCH** (engineering complete visual) |
| Official logo | **MATCH** assets; mixed uncommitted previews |
| Stitch / AI Studio | Not re-verified this audit â€” treat as **PARTIAL** until tagged |
| Gym Mobile UI Kit | Identity **better**; workout UX **worse**; nutrition **absent** (out of scope) |

**Do not clone** gym-kit purple + stock photography. Close the gap with **Guided Workout in Voltline**, not a template restyle.
