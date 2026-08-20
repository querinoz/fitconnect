# 13 — Performance audit

**Date:** 2026-08-20  
**Phase lock:** `P0-DOCS`

## Known baselines (historical docs, re-measure in P8)

- Landing LCP target &lt; 2.5s not claimed on production in this freeze
- Android startup tracer exists; no release systrace pack
- Maps/animation cost unknown without device
- Recomposition / battery reports in `docs/phase-11` are snapshots, not a ship gate

## Capture / GPS

`core-capture` is a **placeholder**. Performance of recording is N/A until **P2-GPS**.

## Now

Do not optimize landing video or add animation libraries. P0-SEC first.

## P8 later

Production Lighthouse, TalkBack pairing with perf, 200% font, maps, startup, battery, `dumpsys gfxinfo` on `fitconnect_phone`.
