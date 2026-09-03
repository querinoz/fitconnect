# Human Dependencies

**Date:** 2026-09-02
Engineering can continue without these. Production GO cannot.

| Item | Why blocked | Notes |
|------|-------------|-------|
| Firebase production project / third-party JWT | PRODUCTION_AUTH | Do not paste secrets into chat |
| Google Sign-In production client IDs | Federated auth | Android + web |
| Apple Sign-In | Future / iOS | Not required to start P1-AUTH engineering |
| Supabase production API keys (publishable) | Hosted app | Project `beuiammeedpovdkmhluw` exists; prod key hygiene HUMAN |
| `google-services.json` (release) | FCM / Crashlytics | Debug may omit FCM |
| Stripe live keys + webhook secret | Payments | Code exists; demo without keys |
| Upstash Redis production | Rate limit 503 without Redis in prod security mode | |
| Play App Signing / keystore | APK/AAB release | |
| Physical phone | Device QA | Emulator used for visual tour historically |
| Physical Wear OS watch | P7 E2E | UNTESTED pair |
| Play Console / Internal testing | P12 | |
| Legal: Terms/Privacy copy review | Routes exist; copy PENDING_HUMAN | |
| Exercise media licenses | If catalog expands | Do not bulk-import AGPL/openGym media |
| Apple Developer (future iOS) | Out of current mobile path | |

**Not human-blocked (agent-owned):** Guided Workout UI, Room decision, wiring ProgressionEngine, committing untracked schema, killing dual memory stores in production paths.
