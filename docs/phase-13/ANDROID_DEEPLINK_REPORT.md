# ANDROID_DEEPLINK_REPORT.md

| Scheme | Host | Guard |
|--------|------|-------|
| `fitconnect://` | `app` | NavGuard + Home authorize |
| `https://fitconnect-phi.vercel.app/app/*` | autoVerify intent | assetlinks **not verified** |

Nested `athlete/*` / `coach/*` URIs map to HOME then authorize (Phase 12).

| Test | Status |
|------|--------|
| Cold start deep link | NOT RUN on device |
| Logged out deep link | Unit: redirects guest |
| Malformed | NOT RUN |
| Wrong role | Unit authz table |

**H2:** Digital Asset Links verification pending.
