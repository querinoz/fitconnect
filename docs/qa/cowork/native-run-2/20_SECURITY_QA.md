# 20 — SECURITY QA

Read-only. No policy changes.

| Check | Result | Status |
|---|---|---|
| API without auth | `/api/v1/readiness` 503 `auth_not_configured` | **PASS** fail-closed |
| Integrations status | 503 | **PASS** fail-closed |
| Rate limit | health redis **disabled** | **FAIL** (P2) product hardening |
| Demo dashboard | `?demo=1` client session | **CAUTION** forgeable demo (known) |
| Service role in APK | not extracted; debug build | **NOT PROBED** deeply |
| Strava client_secret in APK | not dumped | **PENDING_HUMAN** full secrets audit |
| LOCAL_DEMO delete account | copy says LOCAL_DEMO refused | not tapped |
| IDOR / RLS live DB | not attacked | **PENDING_HUMAN** |
| Coach deeplink as athlete | stayed on athlete | **PASS** client guard |

## vs Run #1

Fail-closed APIs **CONFIRMED**. Rate limit **STILL OPEN**. Local secrets-on-disk **NOT RE-AUDITED** this session (**STILL OPEN** / carry).
