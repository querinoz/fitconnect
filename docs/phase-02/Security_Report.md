# Phase 02 — Security Report

## Controls in place

| Control | Implementation |
|---------|----------------|
| Token storage | EncryptedSharedPreferences (`SecureStore`) |
| Session separation | Access + refresh + role + biometric flag |
| Token rotation | `TokenRefresher` + OkHttp Authenticator |
| Authz centralization | `SessionAuthorizer` / `RolePermissionTable` |
| Nav guards | `NavGuard` |
| Backup | `allowBackup=false` |
| Cleartext | Emulator loopback only (`network_security_config`) |
| Error funnel | `ErrorPipeline` (no raw exception toasts) |
| Logging | `Logger` — tokens never logged |

## Gaps / next hardening

- Live Supabase with PKCE  
- Certificate pinning  
- Play Integrity / root detection  
- R8 minify + shrink on release (`isMinifyEnabled` still false)  
- Biometric CryptoObject-bound keys  
- `assetlinks.json` for verified App Links
