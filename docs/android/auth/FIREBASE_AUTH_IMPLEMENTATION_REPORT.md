# Firebase Auth — Implementation Report

Date: 2026-08-17

## WHAT CHANGED

FitConnect Android now has a production-shaped **identity layer** behind the existing Elite OS shell.

Firebase Authentication is the intended IdP. Supabase remains the application/data layer. LOCAL_DEMO (Inês, Marina, Tomás) stays debug-only and is routed away from the live adapter.

## WHY

The previous live path was Supabase password REST only. Google/Apple were unimplemented. Local Google/Apple used a forgeable `idToken`. Release already fail-closed without IdP; this change adds Firebase Auth architecture without inventing credentials.

## ARCHITECTURE

```
UI (Compose Elite OS)
  → AuthViewModel
    → AuthRepository (foundation)
      → CompositeAuthRepository
           ├─ DemoPersona emails / guest / anonymous → LocalAuthRepository
           └─ else → FirebaseAuthRepository (if google-services.json)
                     else SupabaseAuthRepository (if URL+anon)
                     else fail-closed
        → FirebaseAuthGateway (Android SDK in :app)
        → Credential Manager / Apple OAuth host (Activity, :app)
```

Canonical identity: **Firebase UID** (`SessionSnapshot.userId`). Email is never the primary key. Apple private relay email is stored as profile email only.

Role is separate: after a new live identity, `identity.role_selected.$uid == 0` shows RoleSelect (Athlete OS vs Coach OS), then existing onboarding.

## FILES (high level)

- Domain: `AuthRepository`, `LocalAuthRepository`, `CompositeAuthRepository`, `FirebaseAuthRepository`, validators, error mapper
- App: `AndroidFirebaseAuthGateway`, `AndroidFederatedAuthHost`, `AuthViewModel`, Elite `AuthScreen`, `RoleSelectScreen`
- DI: `DefaultAppContainer.identityAuthOverride`, `FitConnectApplication` Firebase init only if configured
- UI: Connected Accounts in Athlete/Coach settings
- Gradle: Firebase Auth on existing BoM `33.12.0`; Credential Manager `1.3.0`; googleid `1.1.1`
- Official Google path: Credential Manager + `GetGoogleIdOption.setServerClientId(web client id)` (Firebase docs; BoM 34.x exists upstream — we stayed on 33.12.0 to keep messaging compatible)

## DEPENDENCIES

| Artifact | Role |
| --- | --- |
| `firebase-bom:33.12.0` + `firebase-auth` | Identity SDK |
| `androidx.credentials:1.3.0` | Credential Manager |
| `googleid:1.1.1` | Google ID token |

No `google-services.json` in git.

## TESTS

| Suite | Result |
| --- | --- |
| All collected JUnit XML | **189/189**, 0 failures |
| Auth-focused (validators, mapper, composite, local, firebase fake, prod gate) | PASS |
| Google/Apple | UNIT PASS with doubles — **not** production E2E |

## EMULATOR RESULTS

Device: `emulator-5554` AVD `fitconnect_phone`. Package `com.fitconnect.android.debug`.

| Step | Result |
| --- | --- |
| Prior session | Restored Inês Athlete OS (session persistence) |
| `pm clear` + launch | Welcome / LOCAL_DEMO |
| Continue | Identity Core: Google / Apple / Email + personas |
| Continue with Google | Copy: “This sign-in provider is not configured yet.” + Retry/Back/Help. No session created |
| Inês | Athlete onboarding SYS.INIT 1/6 |
| Auth screencap | Black — `FLAG_SECURE` (expected) |

## SECURITY RESULTS

- Tokens not logged; Auth pipeline drops exception causes
- FLAG_SECURE while Identity Core is visible
- Local Google/Apple no longer accept a dummy `idToken`
- Release assemble fail-closed without keystore + Supabase
- Deep links still go through NavGuard; no new auto-login action URLs

## VISUAL RESULTS

Identity Core matches Elite OS language (IDENTITY CORE, SYSTEM INITIALIZATION, Voltline appearance picker). Guest and onboarding screenshots match existing product. Auth bitmap QA is limited by FLAG_SECURE; hierarchy dump used instead.

## PENDING HUMAN

See `FIREBASE_AUTH_HUMAN_HANDOFF.md` and `FIREBASE_AUTH_CONFIGURATION.md`.

## KNOWN LIMITATIONS

- Without `google-services.json`, Google/Apple return `PROVIDER_UNAVAILABLE` (honest)
- Firebase ID token is stored as session access token; backend exchange is documented, not implemented (no service account on device)
- Credential Manager `clearCredentialState` needs an Activity; logout still clears FitConnect SecureStore + FirebaseAuth.signOut
- TalkBack and cold-start timing not re-run this session

## NEXT STEPS

1. Human supplies Firebase JSON, SHA, web client ID, Apple provider
2. Production E2E email / Google / Apple
3. Optional: verify Firebase ID tokens on the existing backend before trusting `Authorization` for writes
