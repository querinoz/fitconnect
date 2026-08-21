# ANDROID_ENVIRONMENT_MATRIX.md

| | LOCAL / DEBUG | PREVIEW | STAGING | PRODUCTION / RC |
|--|---------------|---------|---------|-----------------|
| applicationId | `…android.debug` | TBD | TBD | `com.fitconnect.android` |
| API_BASE_URL | `http://10.0.2.2:3001` | prod URL | staging URL | `https://fitconnect-phi.vercel.app` |
| Cleartext | loopback only | no | no | **denied** |
| ALLOW_LOCAL_AUTH | true | false | false | **false** |
| SUPABASE_URL / ANON | empty (today) | must set | must set | **must set before store** |
| Demo credentials UI | yes (debug) | no | no | **no** |
| Mock location | allowed | no | no | **no** |
| Logger min | DEBUG | WARN | WARN | WARN |
| Push | NoOp | FCM TBD | FCM TBD | FCM **not wired** |
| Realtime | NoOp | TBD | TBD | **NoOp** |
| Stripe | N/A client | test | test | live server-only |
| Analytics / crash | NoOp | TBD | TBD | **not production-wired** |

## Rules

1. Release builds must never resolve to localhost / 10.0.2.2.
2. Demo mode web: `NEXT_PUBLIC_DEMO_MODE === "true"` only (Phase 12).
3. Empty Supabase in release ⇒ local auth locked ⇒ **credential sign-in unavailable** (intentional until IdP).
