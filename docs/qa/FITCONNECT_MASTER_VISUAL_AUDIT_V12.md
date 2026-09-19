# FitConnect V12 — Master Visual Audit

**Date:** 2026-09-19  
**Scope:** V10 Live Context + dashboard mount (code + e2e), not a full Designly Director rebaseline.

## Findings

| Surface | Hierarchy | Honesty copy | Motion | Status |
| --- | --- | --- | --- | --- |
| LiveAthleteContextCard | Meta grid + actions | ACWR-lite auxiliary disclaimer added (V12) | 15s refresh poll | REAL |
| Stale HR display | Shows freshness/provenance — not LIVE | REAL | — | REAL |
| Dashboard mount | e2e `data-testid=live-athlete-context` | — | — | PASS |

## Not claimed

- Full brand board re-score  
- Android/Wear visual pixel QA (adb empty)  
- Blind screenshot rebaseline

## Residual visual risk

In-memory empty states dominate when no events — intentional honesty (MISSING / NOT_CONNECTED), not decorative empty polish.
