# Firebase Auth — Architecture Audit

**Date:** 2026-08-17  
**Code changes in this document:** none (inspection only)

## CURRENT ARCHITECTURE

```
UI (AuthScreen Compose)
  → AuthRepository (foundation port)
      → LocalAuthRepository     DEBUG when !usesLiveAuth
      → SupabaseAuthRepository  when AppConfig.usesLiveAuth (URL + anon key)
  → SessionStore (EncryptedSharedPreferences)
  → NavGuard / UserRole → Athlete OS | Coach OS | Guest
```

| Piece | Location | Notes |
| --- | --- | --- |
| Port | `foundation/auth/AuthRepository.kt` | Email/password, magic link, guest, anonymous, restore, refresh, logout, biometric |
| Local demo | `LocalAuthRepository` + `DemoPersona` | Inês / Marina / Tomás; `password1`; fail-closed when `allowLocalAuth=false` |
| Production IdP today | `SupabaseAuthRepository` | REST `/auth/v1`; Google/Apple **unimplemented** (returns UNAUTHENTICATED) |
| DI | `DefaultAppContainer` | `usesLiveAuth ? supabase : local` |
| UI | `app/.../ui/auth/AuthScreen.kt` | Live form if Supabase; else debug personas; else fail-closed copy |
| Session | `SecureSessionStore` | access/refresh/userId/role in SecureStore |
| Firebase today | BoM `33.12.0`, **messaging only** | `google-services.json` gitignored; plugin applied only if file exists |
| Debug Firebase | `src/debug/AndroidManifest.xml` | **Removes** `FirebaseInitProvider` so missing JSON does not crash LOCAL_DEMO |
| Release gate | `ALLOW_LOCAL_AUTH=false`, `verifyReleaseProductionSecrets` | Requires Supabase URL/anon + `google-services.json` for FCM |
| FCM | `FitConnectFirebaseMessagingService` | Separate from identity |

Canonical user id today: session `userId` (local UUID or Supabase user id). Email is **not** the primary key in session storage.

## TARGET ARCHITECTURE

```
IDENTITY     Firebase Authentication (UID canonical)
DATA         Supabase (anon key, realtime, APIs) — unchanged ports
DEMO         LocalAuthRepository — debug only, isolated personas
DOMAIN       AuthRepository (no Firebase types in UI)
UI           Elite OS AuthScreen / Role select / Connected accounts
```

**Option B (chosen):** Firebase is the identity provider. Supabase remains the application/data layer. Do not drop Supabase Auth REST until a backend token-exchange exists; keep it as a fallback live adapter when Firebase JSON is absent but Supabase keys are present.

```
CompositeAuthRepository
  ├─ demo emails / GUEST / ANONYMOUS → LocalAuthRepository (allowLocalAuth only)
  └─ otherwise → FirebaseAuthRepository if FIREBASE_CONFIGURED
                 else SupabaseAuthRepository if usesSupabaseData
                 else fail-closed
```

Firebase UID → `SessionSnapshot.userId`. Role remains a **separate** session field (never inferred from email in production).

## RISKS

| Risk | Mitigation |
| --- | --- |
| Debug overlay strips `FirebaseInitProvider` | Manual `FirebaseApp.initializeApp` only when `FIREBASE_CONFIGURED` |
| Google needs **Web** OAuth client ID | `BuildConfig.GOOGLE_WEB_CLIENT_ID` from gitignored `local.properties`; empty → `PROVIDER_UNAVAILABLE` |
| Apple on Android needs Firebase Apple provider + Services ID | Adapter + tests with doubles; production `PENDING_HUMAN` |
| Duplicate accounts (email vs Google) | Surface `ACCOUNT_EXISTS_DIFFERENT_CREDENTIAL`; never silent merge |
| LOCAL_DEMO leaking to release | `allowLocalAuth=false` on release; Composite refuses demo path |
| Token logs | Map errors without logging password / idToken / refresh |
| Supabase user id vs Firebase UID | Document mapping; do not rewrite DB PKs in this change |

## DUPLICATIONS

- Two live IdPs (Supabase Auth REST + Firebase) until token exchange ships.
- Auth UI currently branches on `usesLiveAuth` (Supabase) vs debug — will branch on identity availability + demo flag.

## DEAD CODE

- Local Google/Apple path that accepts any non-blank `idToken` and forges `$provider@oauth.local` — **must not** be used for production; Composite will not call it for live providers.
- Magic link on Supabase always UNAUTHENTICATED — password reset becomes Firebase `sendPasswordResetEmail`.

## MIGRATION PLAN

1. Extend domain port + error taxonomy (no Firebase in foundation).
2. Add Firebase Auth + Credential Manager in `:app`.
3. Composite routing; preserve LOCAL_DEMO.
4. Elite OS auth UX; role selection for new live identities.
5. Connected accounts (link/unlink) behind the port.
6. Tests with fakes; emulator LOCAL_DEMO + fail-closed; Google/Apple E2E `PENDING_HUMAN`.
7. Human: Firebase Console, SHA, `google-services.json`, Apple provider, web client ID.
