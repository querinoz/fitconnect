# Phase 12 — Technical Debt

**Security-related debt carried forward.** Honest status — not blockers for doc delivery, but blockers for production/Play Store.

## P0 — Must fix before real users / Play Store

| ID | Debt | Path / notes |
|----|------|--------------|
| SEC-01 | **LocalAuth is dev adapter, not production IdP** | `android/foundation/.../LocalAuthRepository.kt` — replace with Supabase/OAuth PKCE |
| SEC-02 | **Local tokens forgeable on rooted devices** | Mitigated by isolation + authz; not eliminated |
| SEC-03 | **`NEXT_PUBLIC_DEMO_MODE` discipline** | Must be false/unset in Vercel prod |
| SEC-04 | **Stripe largely demo** | `apps/web/lib/stripe/demo/` — hide or go live |
| SEC-05 | **Full account deletion flow** | See `ACCOUNT_DELETION_AUDIT.md` |
| SEC-06 | **Live Supabase RLS audit** | `supabase/migrations/` — policies not verified running |

## P1 — High priority

| ID | Debt | Notes |
|----|------|-------|
| SEC-07 | API route auth coverage | Not all `/api/v1/*` use `requireAuth` |
| SEC-08 | Rate limiting | Upstash env documented, not universal |
| SEC-09 | Certificate pinning (Android) | OkHttp default trust only |
| SEC-10 | Verified App Links | Deep links force HOME but no assetlinks |
| SEC-11 | Server-side coach/telemetry consent | Android-only enforcement today |
| SEC-12 | Realtime auth (LiveKit/Convex/Broadcast) | See REALTIME doc |
| SEC-13 | Web AI package security parity | `@fitconnect/ai` audit open |

## P2 — Medium

| ID | Debt | Notes |
|----|------|-------|
| SEC-14 | Full E2E pen-test on physical device | Not in CI |
| SEC-15 | Fuzzing / schemathesis on API | See FUZZING_REPORT |
| SEC-16 | Dependency CVE CI gate | Manual audit only |
| SEC-17 | Push token binding API audit | NoOp on Android native |
| SEC-18 | Prisma vs Supabase dual schema | Policy drift risk |
| SEC-19 | Biometric CryptoObject keys | Local unlock only |
| SEC-20 | CSP / security headers review | next.config |
| SEC-21 | Offline sync server auth + HMAC payloads | Rooted tampering |
| SEC-22 | Consent server sync multi-device | Local consent stores |

## Accepted mitigations (Phase 12)

- Account isolation on logout/switch
- IDOR binding on core web helpers
- AI tool fail-closed authz
- Health consent default false
- Android backup off + TLS

## Phase 13 candidates (do not start without approval)

- Supabase Android SDK integration
- External penetration test
- RLS + Prisma unification
- Stripe production cutover

---

*Phase 12 documents debt; resolving SEC-01 through SEC-06 is required for production gate exit.*
