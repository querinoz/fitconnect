# 19 — PERFORMANCE QA

## Android (dumpsys gfxinfo, whole session)

| Metric | Value | Status |
|---|---|---|
| Cold start am TotalTime | 4847 ms | **FAIL** vs typical 2s budget (P2) |
| Wear cold start | 3989 ms | **FAIL** same |
| Warm start | 721 ms | **PASS** |
| Total frames | 27201 | — |
| Janky frames | 1289 (**4.74%**) | **PARTIAL** (legacy janky 98% — dump caveat) |
| 50th / 90th / 99th | 25 / 36 / 69 ms | **FAIL** 50th already >16ms |
| GPU 50th | 4 ms | honeycomb GPU cheap vs UI thread |
| TOTAL PSS | ~168 MB | observational |

Honeycomb 1.5ms/frame gate from emulator skill: **not isolated**; not claimed PASS.

## Watch

Startup ~4s. Battery-sensitive behavior **NOT MEASURED**.

## Web

curl `time_total` landing 0.78s, pricing 0.47s, dashboard 0.57s, community 0.47s, discover 0.40s, health 0.37s. **PASS** as TTFB proxy. LCP/CLS/TBT **NOT** from CrUX this run.

## vs Run #1

Native perf is **NEW**. Web still fast.
