# ANDROID_RELEASE_SECURITY_REPORT.md

Inherits Phase 12 hardening. Phase 13 deltas:

- `ALLOW_LOCAL_AUTH=false` on release BuildConfig
- `LocalAuthRepository` refuses credential/anonymous when disabled
- Release logger min priority WARN
- Keystore template + gitignore for secrets
- CI builds release APK/AAB artifacts

Still open: IdP, Play Integrity, pinning, FCM auth, live RLS — see Phase 12 `TECHNICAL_DEBT.md` + `ANDROID_RELEASE_BLOCKERS.md`.
