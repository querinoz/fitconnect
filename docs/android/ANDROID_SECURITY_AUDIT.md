# ANDROID_SECURITY_AUDIT.md

**Date:** 2026-08-09  
**Method:** Static review + build gates (no invented device evidence)

## PASS (engineering)

| Check | Evidence |
|-------|----------|
| No service_role in Android source | Grep policy; Supabase uses anon only |
| Keystore / google-services gitignored | `.gitignore` + SIGN-02 |
| `allowBackup=false` | AndroidManifest |
| Cleartext denied (main) | network_security_config |
| FCM service exported=false | Manifest |
| Activity deep links scoped | fitconnect://app + verified host |
| Session in EncryptedSharedPreferences | EncryptedSecureStore |
| Logout isolation | AccountIsolationController |
| Release local auth off | ALLOW_LOCAL_AUTH=false |
| Demo auth UI debug-only path | AuthScreen |
| Release without IdP fail-closed UI | AuthScreen message (no silent login) |

## UNVERIFIED (needs device / human)

| Check | Why |
|-------|-----|
| Certificate pinning | Not implemented (TLS default only) |
| Screenshot/FLAG_SECURE on health screens | Not audited on device |
| R8 mapping upload | Release not signed here |
| Real token leakage in logcat | Needs device with live auth |

## Findings

1. **P2:** Analytics still NoOp — fine for privacy until provider chosen.  
2. **P2:** NotificationHelper posts local notifications when FCM configured — ensure deep links stay in-app.  
3. **PENDING_HUMAN:** Production secrets must never be pasted into chat/git.

## Verdict

**SECURITY (engineering static): PASS**  
**SECURITY (production certification): UNVERIFIED** until human credentials + device review.
