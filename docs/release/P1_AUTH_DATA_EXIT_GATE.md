# P1-AUTH + P1-DATA exit gate

Date: 2026-08-20

**Status:** ENGINEERING EVIDENCE · does **not** skip **P0-SEC**

**Production release remains NO-GO.** Frozen sequence still starts at P0-SEC. P0 security items outside this slice are still open. This document does not authorize Social OS, Squad OS, Stories, Reels, or landing cinematic work.

## Scores

| Gate | Result |
| --- | --- |
| P1-DATA | **PENDING_HUMAN** |
| P1-AUTH | **PENDING_HUMAN** |
| LOCAL_AUTH | **PASS** |
| GOOGLE_LOCAL | **PASS** (implementation; not a live Google account on this machine) |
| GOOGLE_PRODUCTION | **PENDING_HUMAN** |
| EMAIL_PRODUCTION | **PENDING_HUMAN** |
| PROFILE_PERSISTENCE | **PASS** (code path) |
| RLS | **PASS** |
| IDOR_TEST | **PASS** (API/unit). Live SQL two-user run **BLOCKED** (no Docker/container runtime on this machine) |
| WEB_ANDROID_IDENTITY | **PASS** (model); live same-UID check **PENDING_HUMAN** |
| ROLE_AUTHORIZATION | **PASS** |
| REGRESSION | see verification commands in the implementation notes |
| PRODUCTION_DATABASE | **PENDING_HUMAN** |
| FCM | **PENDING_HUMAN** |
| CRASHLYTICS | **PENDING_HUMAN** |
| SIGNING | **PENDING_HUMAN** |
| PRODUCTION_AUTH | **PENDING_HUMAN** |

## P1-DATA can PASS only when HUMAN also

- Applies `012_firebase_identity.sql` to the production Supabase project.
- Enables Third-Party Firebase Auth on that project.
- Confirms two-user IDOR against the live project (not only CI Postgres).

Until then: **AUTH_ENGINEERING = PASS**, **PRODUCTION_* = PENDING_HUMAN**.

## P1-AUTH can PASS only when HUMAN also

- Supplies `google-services.json`, SHA certs, Web Firebase env, Google provider test account.

## Fail-closed preserved

- `NEXT_PUBLIC_DEMO_MODE` must be exactly `"true"` for demo.
- Missing Firebase web config → `auth_not_configured` / unconfigured AuthShell.
- Android `ProductionConfigGate` still requires Firebase + Supabase + no local auth when enforce is on.

## Expo

Not revived.
