# ANDROID_RELEASE_ARCHITECTURE.md

```
android/app (Compose shell)
  ├─ foundation (auth, authz, offline, network, session)
  ├─ design / design-ui (Elite OS)
  ├─ athlete / coach (feature OS)
  ├─ sports / geo / telemetry / ai / community
  └─ core-capture
android/wear — F0 skeleton (not shipped with phone RC)
```

## Trust boundaries (release)

1. UI → NavGuard / Authorizer (client cache only)
2. ApiClient → HTTPS `API_BASE_URL` + bearer from SecureStore
3. Server must re-authorize (Phase 12 web gates)
4. Offline SyncQueue cleared on logout (`AccountIsolationController`)

## Release vs debug

| Concern | Debug | Release |
|---------|-------|---------|
| API | emulator localhost | Vercel prod URL |
| Local auth | on | **off** |
| Demo buttons | on | **off** |
| R8 | off | on |
| Logging | DEBUG+ | WARN+ |

## Expo

`apps/mobile` is **LEGACY / FROZEN** relative to this native rebuild. Not part of RC-1 binary.
