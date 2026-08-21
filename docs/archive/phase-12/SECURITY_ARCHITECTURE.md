# Phase 12 — Security Architecture

## Layers

```
┌─────────────────────────────────────────────────────────────┐
│  UI (Compose / Next.js) — no role hardcoding in screens    │
├─────────────────────────────────────────────────────────────┤
│  Navigation guard (Android NavGuard) / middleware (web)     │
├─────────────────────────────────────────────────────────────┤
│  Authorization (RolePermissionTable, requireAthleteId, AI)  │
├─────────────────────────────────────────────────────────────┤
│  Authentication (Supabase web / LocalAuth Android dev)      │
├─────────────────────────────────────────────────────────────┤
│  Account isolation + offline wipe (AccountIsolationCtrl)    │
├─────────────────────────────────────────────────────────────┤
│  Transport (TLS, NS config) + secrets (env, SecureStore)    │
├─────────────────────────────────────────────────────────────┤
│  Data (Prisma/Postgres, Supabase RLS, local stores)         │
└─────────────────────────────────────────────────────────────┘
```

## Web (`apps/web/`)

| Component | Role |
|-----------|------|
| `middleware.ts` | Protects dashboard/coach/sessions paths; Supabase session or demo cookie |
| `lib/api/require-auth.ts` | Server route auth + athlete/coach ID binding |
| `lib/integrations/strava/route-auth.ts` | Integration-specific athlete resolution |
| `lib/auth/middleware-auth.ts` | Fail-closed demo detection |
| `components/auth-gate.tsx` | Client hydration-safe auth gate |

**Trust boundary:** Browser ↔ Next.js API routes. User identity from Supabase JWT/cookies, not query params (except admin).

## Android (`android/`)

| Module | Security responsibility |
|--------|-------------------------|
| `:foundation` | Auth, session, NavGuard, AccountIsolation, offline queue |
| `:ai` | Tool permission gate, health policy, audit log |
| `:telemetry` | Consent manager, coach sharing ACL |
| `:app` | Manifest hardening, network security overlay |

**Composition root:** `FitConnectApplication` → `AppContainer` wires `allowLocalCoachElevation = config.isDebuggable`.

**Trust boundary:** Client session is a cache; production must use server-minted roles (see `AUTHENTICATION_AUDIT.md`).

## Cross-cutting policies

1. **Fail-closed defaults** — demo off, health consent off, anonymous no app shell.
2. **Explicit binding** — athlete ID from auth subject, not client-supplied alone.
3. **Defense in depth** — nav guard + permission table + API checks + AI gate.
4. **Audit trails** — AI (`AiAuditLog`), telemetry (`TelemetryPrivacyManager.audit`).

## Production target (not yet fully implemented)

- Supabase PKCE on Android replacing `LocalAuthRepository`
- Certificate pinning on mobile API client
- Play Integrity / device attestation for sensitive actions
- Server-side authorization for all mutations (client checks are UX + first line only)
