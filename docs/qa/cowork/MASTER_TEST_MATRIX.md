# MASTER_TEST_MATRIX — FitConnect Cowork QA (2026-08-24)

Legend: PASS (verified live) · CODE (code-audited, not run) · BLOCKED (environment) · FAIL

| ID | Surface | Test | Method | Result | Sev | Evidence |
|----|---------|------|--------|--------|-----|----------|
| L1 | Landing | Loads, hero, stats, live preview cards | live | PASS | — | ss 0 |
| L2 | Landing | Scroll sections (ecosystem strip, editorial, coaches carousel, three-stories) | live | PASS | — | ss 1-8 |
| L3 | Landing | i18n switch EN↔PT (html lang + copy + localStorage) | live | PASS | — | ss 9,11; lang=en/pt |
| L4 | Landing | Language dropdown fully visible | live | FAIL | P2 | clipped by nav overflow-hidden |
| L5 | Landing | No horizontal overflow | live | PASS | — | bodyScrollW 1526 ≤ 1536 |
| L6 | Landing | 46 links resolve; footer Sobre/Carreiras/Imprensa/Parcerias | live | PARTIAL | P3 | 6 links point to `/#` (placeholders) |
| L7 | Landing | Social icons (IG/Twitter/YouTube) | live | FAIL | P3 | href="/#" — non-functional |
| A1 | Athlete OS | Dashboard renders (readiness ring, HRV, sleep, PR, AI insights) | live | PASS | — | ss 15 |
| A2 | Athlete OS | Nav Today/Analysis/Achievements/Profile | live | PASS | — | route map |
| A3 | Athlete OS | Insights charts + tabs (Load/Progression/Sleep/History/Compare/Notes) | live | PASS | — | ss 23 |
| A4 | Athlete OS | Icon-only buttons have accessible names | live | FAIL | P3 | 7 buttons no aria-label/title |
| A5 | Map | MapLibre renders Lisbon tiles + live GPS marker | live | PASS | — | ss 22 (144 BPM demo) |
| AS1 | ASCEND | Level/XP/missions/streak render | live | PASS | — | ss 24 |
| AS2 | ASCEND | Complete mission awards XP, no dup | live | PASS | — | 120→130 XP, streak 0d→1d |
| C1 | Coach OS | Command Center (KPIs, athlete alerts, program builder) | live | PASS | — | ss 19 |
| C2 | Coach OS | Nav Today/Sessions/Roster/Inbox/Profile | live | PASS | — | route map |
| C3 | Coach OS | Roster vs Command Center data coherence | live | PARTIAL | P3 | roster empty w/ forged coachId; dashboard hard-codes 34 |
| AUTH1 | Auth | Protected pages redirect to /signin | live | PASS | — | /admin,/dashboard → signin |
| AUTH2 | Auth | Role guard: athlete blocked from Coach OS | live | PASS | — | /coach/dashboard → /dashboard |
| AUTH3 | Auth | Server API fails closed when unconfigured | live | PASS | — | 503 auth_not_configured x6 routes |
| AUTH4 | Auth | Client session (localStorage) tamper-resistant | live | FAIL | P0* | role forged athlete→coach via localStorage (*demo-only, server unaffected) |
| AUTH5 | Auth | Advertised demo creds work | live | FAIL | P2 | hint Athlete/Coach rejected; "Try Admin/Admin"; sign-out didn't clear session |
| API1 | API | /api/health dependency report | live | PASS | — | degraded (stripe/redis/analytics/firebase) |
| API2 | API | IDOR via athleteId path | live | PASS | — | 503, no data leak |
| SEC1 | Security | Secrets in repo | code | PASS | — | .env*.local gitignored; no sk_live/AIza/PEM in source |
| SEC2 | Security | Real secrets on local disk | code | NOTE | P2 | .env.local + .vercel/.env.production.local hold live keys (gitignored) |
| SEC3 | Security | Rate limiting active | live | FAIL | P2 | health: "rate limit disabled"; routes 503 rate_limit_not_configured |
| PRC1 | Pricing | Tiers render + toggle | live | PASS | — | ss 26 |
| PRC2 | Pricing | Hero price matches a tier | live | FAIL | P3 | "€12/mo" not any tier (Athlete €9) |
| DSC1 | Discover | Filters, cards, AI match | live | PASS | — | ss 25 |
| COM1 | Community (Social) | Feed, celebrations, PWA install | live | PASS | — | ss 27 |
| SOC1 | Social (posts/DM/reels) | Full social | code+live | NOT_IMPLEMENTED | — | community feed only; no posting/messaging/reels |
| SQ1 | Squads | Squad create/join/momentum | code+live | NOT_IMPLEMENTED | — | no /squads route; ASCEND has missions not squads |
| HC1 | Android Health Connect | Real SDK integration | code | CODE-PASS | — | connect-client:1.1.0-alpha11 + HealthDataRepository |
| WR1 | Wear Data Layer | Phone↔Watch messaging | code | CODE-PASS | — | Wearable MessageClient/CapabilityClient, WearPaths |
| GPS1 | Android GPS | Device location acquisition | code | CODE-FAIL | P1 | LocationEngine is pure-Kotlin+mock; no FusedLocation/LocationManager binding |
| AND1 | Android app | Build + run | — | BLOCKED | — | no hypervisor; not runnable |
| WEAR1 | Wear app | Build + run | — | BLOCKED | — | no Wear AVD |
| XP1 | Cross-platform | Phone/Web/Watch same event | — | BLOCKED | — | requires devices |
| REG1 | Prod P0 seed.ts | lib/data import | code | PASS | — | apps/web/lib/data.ts exists (remediated) |
| REG2 | Prod P0 open API | ?athleteId= | live | PASS | — | fails closed (remediated) |

\* AUTH4 is P0 *only if* localStorage were the real auth. It is demo UX; server uses Firebase tokens → effective severity low on live.
