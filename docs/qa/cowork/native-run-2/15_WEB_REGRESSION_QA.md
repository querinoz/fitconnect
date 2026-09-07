# 15 — WEB REGRESSION QA

**Deployment:** https://fitconnect-phi.vercel.app · Cursor browser MCP + curl · 2026-08-24.

## Known issues retest

| Finding | Method | Result | Status |
|---|---|---|---|
| Language dropdown clipped | listbox inside `nav`, overflow hidden | listH 230, navH 62, listInsideNav **true**, overflow **hidden**, ~225px clipped | **STILL OPEN** (P2) |
| Demo / email login | `/auth` `/login` | **404** | **NEW** path; credential typing **NOT_REPRODUCED** this pass |
| Sign out session | — | **NOT RETESTED** | carry prior NOT_REPRODUCED |
| Rate limiting | `/api/health` | redis **rate limit disabled** | **STILL OPEN** (P2) |
| Protected API leak | `/api/v1/readiness` | 503 `auth_not_configured` | **RESOLVED / holds** |
| Icon buttons unnamed | dashboard `?demo=1` | **7** unnamed `<button>` | **STILL OPEN** (P3) |
| Pricing €12 vs tiers | `/pricing` | “€12/mo for the platform” vs Free €0 / Athlete €9 / Team €24 | **STILL OPEN** (P3) |
| Footer `/#` | landing CDP | About, Careers, Press, Partnerships + empty social labels | **STILL OPEN** (P3) |
| Route smoke | curl | `/` `/pricing` `/dashboard` `/community` `/discover` **200**; `/auth` **404**; health **200** degraded | **PASS** (except /auth) |

## Dashboard smoke

`/dashboard?demo=1`: Today / Analysis / Achievements / Profile, Inês's Athlete OS, HRV 68 ms, plan Threshold intervals, Tomás coach. **PASS** as demo.

IA vs Android: web **4 destinations**; Android **5 tabs** including Activity + Community. **FAIL** cohesion (P2).

## Evidence

Browser snapshots this session; curl timings ~0.37–0.78 s TTFB-ish (`time_total`).
