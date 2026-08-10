# ANDROID_UNUSED_CODE_AUDIT.md

| Path | Classification | Action |
|------|----------------|--------|
| `android/` Kotlin/Compose | ANDROID REQUIRED | Keep |
| `android/wear` | SCAFFOLD / NOT PRODUCT | Keep; not certify |
| `LocalAuthRepository` | DEBUG / FALLBACK | Keep for debug when no Supabase; release path must not use when live IdP |
| Demo credentials in NavHost | DEBUG ONLY | Keep gated on `isDebuggable` |
| `NoOpNotificationGateway` | PLACEHOLDER | Replace when FCM arrives |
| `NoOpRealtimeClient` | PLACEHOLDER | Replace when realtime arrives |
| `apps/mobile` Expo | LEGACY / FROZEN Path A | Do not delete in 13R |
| Maestro YAML | ANDROID QA REQUIRED | Keep; not run |
| Web demo mode | WEB | Fail-closed Phase 12; out of Android binary |

**Destructive cleanup:** deferred until auth/device gates green (per 13R Step 36).
