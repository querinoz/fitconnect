# FitConnect — Human Infra Readiness (P10)

**Date:** 2026-09-04 · AUDIT ONLY
**Rule:** No secrets printed. No credential requests. No production configuration attempted.

---

## Summary

Engineering can continue on product surfaces. **Production GO cannot.** Human-owned configuration remains the critical path for release, not for the recommended next engineering/evidence phase.

---

## Dependency status (no secret values)

| Dependency | Status | Critical path vs later | Notes |
|------------|--------|------------------------|-------|
| Firebase production project | **PENDING HUMAN** | **CRITICAL PATH** (prod auth) | Engineering auth exists |
| Google OAuth / Sign-In client IDs | **PENDING HUMAN** | **CRITICAL PATH** | Android + web |
| Apple Sign-In | **PENDING HUMAN** | LATER (iOS/future) | Not required for Android-first evidence |
| Firebase JWT trust (backend) | **PENDING HUMAN** | **CRITICAL PATH** | Prod API auth |
| `google-services.json` release | **PENDING HUMAN** | **CRITICAL PATH** (Crashlytics/FCM) | Debug may omit FCM |
| FCM | **PENDING HUMAN** + product **FORBIDDEN** now | LATER RELEASE (policy) | Do not start Push product phase |
| Play App Signing / keystore | **PENDING HUMAN** | **CRITICAL PATH** (store) | AAB release |
| Stripe live keys + webhook | **PENDING HUMAN** | LATER RELEASE | Code/demo without keys = ENGINEERING READY + PENDING HUMAN |
| Upstash Redis production | **PENDING HUMAN** | **CRITICAL PATH** (prod rate limit) | Security mode 503 without Redis |
| Legal Terms/Privacy copy | **PENDING HUMAN** | **CRITICAL PATH** (launch) | Routes exist; copy review HUMAN |
| Domains / TLS certificates | **UNKNOWN / PENDING HUMAN** | CRITICAL for prod hosts | Do not probe credentials |
| Physical phone (GPS/HC/TalkBack) | **PENDING HUMAN** | **CRITICAL for evidence** | Emulator ≠ physical GPS |
| Physical Wear OS watch | **PENDING HUMAN** | LATER (P7) | Pair E2E |
| Play Console internal testing | **PENDING HUMAN** | LATER (P12-ish) | |
| Exercise media licenses | **PENDING HUMAN** | LATER if catalog expands | No AGPL media import |

### Status vocabulary used

| Label | Meaning |
|-------|---------|
| ENGINEERING READY | Code path exists without claiming prod config |
| PENDING HUMAN | Requires human-owned secrets/accounts/devices |
| BLOCKED | Cannot proceed even with engineering |
| UNKNOWN | Not inspected deeply this audit |

---

## Critical path (production GO)

1. Firebase production + JWT trust
2. Google Sign-In production clients
3. Release `google-services` / Crashlytics
4. Play signing
5. Production Redis
6. Legal copy
7. Physical device evidence (GPS at minimum for outdoor claims)

FCM/Push and Stripe live are **release dependencies** but Push remains **FORBIDDEN** as a product implementation phase now.

---

## Relation to next phase

**Recommended next phase = Physical GPS verification** — depends on **physical phone (HUMAN)** for evidence, but does **not** require Firebase production secrets.

**P10 itself** is a **parallel human track**, not the single best agent-executable product phase unless the org prioritizes release config over outdoor honesty.
