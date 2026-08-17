# Firebase Auth — Human Handoff

## AGENT COMPLETED

- Architecture audit (`FIREBASE_AUTH_ARCHITECTURE_AUDIT.md`)
- Domain `AuthRepository` contract (no Firebase types in UI)
- `CompositeAuthRepository`: LOCAL_DEMO personas isolated from live IdP
- `FirebaseAuthRepository` + `FirebaseAuthGateway` (UID canonical)
- Android adapters: Firebase Auth SDK, Credential Manager + Google ID, Apple `OAuthProvider`
- Elite OS Identity Core UI (not FirebaseUI)
- Email register / login / reset / verification states
- Role selection after live identity (Athlete vs Coach)
- Connected Accounts in Athlete and Coach settings
- Session restore, logout isolation, FLAG_SECURE on auth
- Production fail-closed: missing JSON / keystore / Supabase blocks `assembleRelease`
- Debug LOCAL_DEMO preserved (Inês / Marina / Tomás)
- Unit tests with fakes (Google/Apple success, cancel, failure)
- Emulator: guest → Identity Core → Google fail-closed copy → Inês → Athlete onboarding
- Docs: configuration, exit gate, implementation report

## HUMAN REQUIRED

| Item | Why |
| --- | --- |
| Firebase project + Android apps | Identity provider |
| `android/app/google-services.json` | SDK init (gitignored) |
| Enable Email / Google / Apple providers | Otherwise `PROVIDER_UNAVAILABLE` |
| SHA-1 + SHA-256 (debug + **release**) | Google Sign-In |
| Web OAuth client ID in `local.properties` | Credential Manager `serverClientId` |
| Apple Developer Services ID + Firebase Apple key | Apple on Android |
| Production keystore | `assembleRelease` |
| Supabase URL + anon key | Application data layer (unchanged) |
| Backend Firebase ID token verification (optional later) | Do not put service-account JSON on device |
| Production E2E of Google / Apple / email | Cannot be claimed PASS without your project |

## Do not send to the agent

- Private keys, `google-services.json` contents, Apple `.p8`, keystore passwords, refresh tokens
