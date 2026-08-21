# Landing visual QA

**STITCH_ACCESS:** UNAVAILABLE (HTTP 500)  
**Device / emulator:** not used  
**Evidence:** Chrome via Cursor browser against `http://127.0.0.1:3001/` on 2026-08-15

## Desktop hero (~1440)

| | |
|--|--|
| BEFORE | H1 “Find my specialist”; “Live” badges; nav missing lang; `#090402` canvas on marketing; headline clipped by overlapping 86% card |
| PROBLEM | Fake live, SEO mismatch, overlap |
| FIX | Elite OS copy, LOCAL DEMO badges, sticky `LandingOsNav`, floor token, tighter headline, no negative-offset float |
| AFTER | Headline “ELITE HUMAN PERFORMANCE OS.” fully readable; Voltline ENTER ELITE OS; LOCAL DEMO visible |
| STATUS | PASS (desktop hero only) |

## Athlete / Coach / Telemetry / Discover / Final CTA

Unit tests cover nav hrefs, ecosystem honesty, gate skip, cockpit tabs. Full-page screenshots for those acts were **not** captured at every required viewport (360–1920).

| Viewport | Status |
|----------|--------|
| Desktop ~1440 | Hero captured |
| 360 / 375 / 390 / 412 / 768 / 1024 / 1280 / 1920 | NOT CAPTURED |

## Issues found in visual pass

| Issue | Severity | Status |
|-------|----------|--------|
| Headline hyphenated under float card | P1 | Fixed and re-shot |
| Meta title still marketplace-style | P1 | Copy updated (reload not re-shot) |

VISUAL REGRESSION = **BLOCKED** (incomplete viewport matrix, no Playwright snapshot suite).
