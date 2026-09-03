# P1-AUTH â€” Identity flow

**Date:** 2026-09-02
**Legend:** REAL Â· MOCK Â· LOCAL Â· DEMO Â· PENDING_HUMAN

Canonical identity:

```text
Firebase UID          = external identity (IdP subject)
identity_profiles.id  = application identity = canonical userId
user_roles.uid        = same string
RLS auth.uid()        = firebase_uid() from trusted JWT
```

Supabase Auth is **not** a competing IdP. Prisma `User` is **not** user-facing authorization.

```mermaid
sequenceDiagram
  autonumber
  actor User
  participant Web as Web Next.js
  participant And as Android app
  participant FB as Firebase Auth
  participant API as /api/v1 + tRPC
  participant SB as Supabase Data API
  participant PG as Postgres + RLS

  Note over Web,And: SIGNED_OUT

  User->>Web: Sign in (email / Google)
  Web->>FB: signIn (REAL SDK)
  FB-->>Web: ID token (sub = UID)
  Note over Web: AUTHENTICATING â†’ AUTHENTICATED
  Web->>API: Authorization Bearer ID token
  API->>API: verifyFirebaseIdToken RS256 (REAL JWKS)
  alt token invalid / missing
    API-->>Web: 401 unauthorized
  end
  alt DEMO_MODE=false and Firebase web config missing
    API-->>Web: 503 auth_not_configured
    Note over Web: AUTH_UNAVAILABLE (not demo-open)
  end
  API->>SB: bootstrap identity_profiles id=UID
  SB->>PG: RLS with_check(id = firebase_uid())
  PG-->>SB: profile row
  SB->>PG: user_roles lookup (server, not client role)
  Note over Web: BOOTSTRAPPING â†’ READY
  Web->>API: domain writes with user.id = UID

  User->>And: Google (Credential Manager) / email
  And->>FB: Google ID token â†’ signInWithCredential (REAL)
  FB-->>And: UID + ID token
  And->>API: same Bearer verify path
  Note over And: SYNCHRONIZING = BOOTSTRAPPING; SUCCESS = READY

  User->>And: Logout
  And->>FB: signOut
  And->>And: SessionStore.clear (no fake user)
  Note over And: SIGNED_OUT
```

---

## Surface reality

| Hop | Web | Android |
|-----|-----|---------|
| Firebase Auth SDK | REAL (when web config present) | REAL (`AndroidFirebaseAuthGateway`) |
| Google production OAuth clients | PENDING_HUMAN | PENDING_HUMAN |
| Apple | PENDING_HUMAN | PENDING_HUMAN |
| ID token verify | REAL JWKS (`firebase-verify.ts`) | SDK session + API verify on server |
| identity_profiles upsert | REAL SQL path (`bootstrapIdentityProfile`) | Via identity remote / same API |
| Role | `user_roles` via RLS client; client cannot self-admin | Same; `canAssignAppRole` denies admin |
| Demo personas | LOCAL_DEMO only if `NEXT_PUBLIC_DEMO_MODE=true` | LOCAL only if `allowLocalAuth` + debug |
| Middleware HTML gate | REAL fail-closed | N/A (NavGuard + session) |
| Production Firebase JWT trust in hosted Supabase | PENDING_HUMAN | PENDING_HUMAN |

---

## Auth states (canonical)

| State | Web `AuthPhase` | Android UI |
|-------|-----------------|------------|
| SIGNED_OUT | UNAUTHENTICATED | IDLE, no user |
| AUTHENTICATING | INITIALIZING / AUTHENTICATING | AUTHENTICATING / VERIFYING |
| AUTHENTICATED | AUTHENTICATED | signed-in before sync |
| BOOTSTRAPPING | extras.bootstrapping | SYNCHRONIZING |
| READY | AUTHENTICATED + ready | SUCCESS |
| AUTH_ERROR | ERROR | ERROR |
| AUTH_UNAVAILABLE | AUTH_UNAVAILABLE | missing IdP / ERROR when Firebase down |
| TOKEN_REFRESH | REFRESHING | `refresh()` / REFRESH_FAILED |
| LOGOUT_PENDING | LOGOUT_PENDING | logout in flight |

No hidden â€œlooks logged inâ€ without session + verified token on protected API.
