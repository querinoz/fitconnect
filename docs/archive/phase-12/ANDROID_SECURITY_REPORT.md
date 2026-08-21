# Phase 12 — Android Security Report

## Manifest hardening

**File:** `android/app/src/main/AndroidManifest.xml`

| Flag | Value |
|------|-------|
| `allowBackup` | `false` |
| `fullBackupContent` | `@xml/backup_rules` (exclude all) |
| `dataExtractionRules` | `@xml/data_extraction_rules` (exclude all) |
| `networkSecurityConfig` | `@xml/network_security_config` |

## Backup rules

- `backup_rules.xml` — excludes root, file, database, sharedpref, external
- `data_extraction_rules.xml` — cloud backup + device transfer exclude all domains

## Authentication & authorization

| Control | Path |
|---------|------|
| LocalAuth no ADMIN | `LocalAuthRepository.kt` |
| Coach elevation debug-only | `AppContainer.kt` |
| RBAC table | `Authorization.kt` |
| NavGuard | `NavGuard.kt` |
| Account isolation | `AccountIsolationController.kt` |

## Debug vs release

| Feature | Debug | Release |
|---------|-------|---------|
| `isDebuggable` | true | false |
| Demo credentials UI | shown | hidden |
| Coach email elevation | allowed | **denied** |
| Cleartext loopback | 10.0.2.2, localhost | **denied** |
| Network config overlay | `src/debug/res/xml/` | main only |

## Storage

- Tokens: EncryptedSharedPreferences (`SecureStore`)
- Phase 11: lazy crypto init — security not weakened

## Build

- `assembleRelease` with R8 (Phase 11)
- ProGuard rules: `android/app/proguard-rules.pro`

## Open items

| Item | Priority |
|------|----------|
| Replace LocalAuth with Supabase PKCE | P0 Play Store |
| Certificate pinning | P1 |
| Play Integrity API | P1 |
| Verified App Links | P1 |
| Root detection (optional) | P2 |
| Biometric CryptoObject keys | P2 |

## Tests

- `LocalAuthRepositoryTest.kt`
- `NavGuardTest.kt`
- `RolePermissionTableTest.kt`
- `AiEngineTest.kt`

## Verdict

Android client **hardened for dev/QA** with fail-closed RBAC, backup denial, network TLS, and account isolation. **Not Play Store-ready** until production IdP replaces local auth.
