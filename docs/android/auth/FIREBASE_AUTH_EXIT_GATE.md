# Firebase Auth — Exit Gate

Date: 2026-08-17  
Evidence is local engineering. Production IdP credentials were **not** supplied.

| Gate | Status | Evidence |
| --- | --- | --- |
| ARCHITECTURE | PASS | Option B: Firebase identity, Supabase data, domain port, UI Firebase-free |
| BUILD | PASS | `:app:assembleDebug` SUCCESS |
| UNIT_TESTS | PASS | 189/189 JUnit (0 failures) including auth fakes |
| INTEGRATION_TESTS | UNVERIFIED | No instrumented Firebase suite in CI |
| EMULATOR | PASS | `fitconnect_phone` / `emulator-5554`; debug APK installed; guest + Identity Core + Inês onboarding |
| EMAIL_AUTH | PENDING_HUMAN | Adapter + tests PASS; live Firebase email not configured |
| GOOGLE_AUTH | PENDING_HUMAN | Credential Manager adapter implemented; emulator shows mapped `PROVIDER_UNAVAILABLE` (no fake login) |
| APPLE_AUTH | PENDING_HUMAN | `OAuthProvider("apple.com")` adapter + cancel/fail unit tests; no Apple provider on this machine |
| ACCOUNT_LINKING | PASS | Unit: link Google + duplicate credential not merged; UI Connected Accounts |
| SESSION | PASS | Unit restore UID; emulator restored prior Inês session before `pm clear` |
| LOGOUT | PASS | Unit clears session + gateway signOut; profile Sign out still wired |
| ROLE_ROUTING | PASS | Unit assignRole; Inês → Athlete onboarding; Tomás remains LOCAL_DEMO coach persona |
| SECURITY | PASS | No secrets committed; Auth errors have no cause; FLAG_SECURE on auth (screencap black); release fail-closed |
| ACCESSIBILITY | UNVERIFIED | EliteButton 48dp + contentDescription; TalkBack not executed this run |
| VISUAL | PASS | UI dump: IDENTITY CORE / Continue with Google·Apple·Email / LOCAL_DEMO personas. Auth pixels blocked by FLAG_SECURE (intentional) |
| PERFORMANCE | UNVERIFIED | Firebase SDK only initialized when `FIREBASE_CONFIGURED`; cold start not re-timed this run |
| DOCUMENTATION | PASS | Audit, configuration, handoff, exit gate, implementation report |
| PRODUCTION CONFIG | PENDING_HUMAN | No `google-services.json`, no web client ID, no Apple, no release keystore |
| RELEASE | LOCKED | `assembleRelease` failed: SIGN-02 + missing Supabase (fail-closed, expected) |

PENDING_HUMAN is never converted to PASS without a real configured run.
