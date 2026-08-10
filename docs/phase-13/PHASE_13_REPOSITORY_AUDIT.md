# PHASE_13_REPOSITORY_AUDIT.md

## Surfaces

| Path | Classification | Action |
|------|----------------|--------|
| `android/` | **ANDROID REQUIRED** | RC surface |
| `android/wear` | SCAFFOLD / NOT PRODUCT | Keep; document WEAR_OS_STATUS |
| `apps/mobile` | LEGACY / FROZEN Path A | Do not delete in Phase 13 |
| `apps/web` | SHARED backend/PWA | Production API host |
| `maestro/android` | ANDROID REQUIRED (QA) | Keep |
| Expo `eas.json` / app.config | LEGACY for this RC | No Expo RC this phase |

## Dead code

No broad deletion this phase (risk > reward pre-RC). Demo credentials remain **debug-only**.

## Dependencies

Frozen per `ANDROID_RELEASE_TOOLCHAIN.md`. No random upgrades.
