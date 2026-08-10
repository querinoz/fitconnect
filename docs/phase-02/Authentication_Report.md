# Phase 02 — Authentication Report

## Architecture

Provider-agnostic `AuthRepository` with methods for:

- Email/password sign-in & sign-up  
- Google / Apple (ID token credentials)  
- Magic link send + redeem  
- Anonymous mode  
- Guest mode  
- Session restore  
- Refresh / token rotation (`TokenRefresher` + OkHttp `Authenticator`)  
- Logout / delete session  
- Biometric unlock enablement (`BiometricGate`)

Tokens persist only via `SecureSessionStore` → `EncryptedSecureStore`.

## Adapter

`LocalAuthRepository` validates the full flow without a live Supabase project. When `SUPABASE_URL` + `SUPABASE_ANON_KEY` BuildConfig values are set, a Supabase implementation can replace the local adapter behind the same interface (`AppConfig.usesLiveAuth`).

## Guards

- `NavGuard` blocks logged-only routes  
- `SessionAuthorizer` centralizes role checks  
- Auth failures funnel through `ErrorPipeline`

## Tests

`LocalAuthRepositoryTest` — sign-in, refresh rotation, guest/anonymous.

## Gaps

- No production Supabase/Google/Apple SDK wiring  
- Biometric system prompt UI host not implemented (gate only)  
- Apple Sign-In on Android remains credential-passthrough architecture
