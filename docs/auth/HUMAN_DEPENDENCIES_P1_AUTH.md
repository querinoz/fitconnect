# Human dependencies â€” P1-AUTH

**Date:** 2026-09-02
Do not paste secrets into this file.

Separate **engineering plumbing** from **production configuration**.

| Item | Status |
|------|--------|
| FIREBASE SDK INTEGRATION (web + Android) | **PASS** (engineering) |
| AUTH STATE MACHINE | **PASS** (unit) |
| TOKEN VERIFY (RS256 JWKS) | **PASS** (unit, 2026-09-02) |
| IDENTITY BOOTSTRAP CODE | **PASS** (code + RLS live) |
| RLS CONTRACT (authenticated, no BYPASSRLS) | **PASS** (live 2026-09-02) |
| CI JOB `DEMO_MODE=false` | **PASS** (workflow exists; remote run UNVERIFIED until push) |
| GOOGLE PRODUCTION OAUTH CLIENT | **PENDING_HUMAN** |
| APPLE PRODUCTION | **PENDING_HUMAN** |
| ANDROID RELEASE `google-services` / Play signing | **PENDING_HUMAN** |
| FIREBASE JWT TRUST ON HOSTED SUPABASE (third-party) | **PENDING_HUMAN** |
| FCM PRODUCTION | **PENDING_HUMAN** |
| LEGAL / privacy copy | **PENDING_HUMAN** |
| STRIPE / REDIS production | **PENDING_HUMAN** (out of auth IdP) |

`PRODUCTION_AUTH_READY` in `buildAuthConfigDiagnostic` is **always false**. Web SDK presence is not a production GO.

Checklist for humans: [HUMAN_AUTH_CONFIGURATION.md](HUMAN_AUTH_CONFIGURATION.md)
