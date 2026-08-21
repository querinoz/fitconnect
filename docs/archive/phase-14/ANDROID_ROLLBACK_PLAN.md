# ANDROID_ROLLBACK_PLAN.md

**Status:** DRAFT — executable only after a published Play track exists.

## Preconditions

| Condition | Today |
|-----------|-------|
| Production signing | **Missing** → cannot publish → rollback N/A |
| Prior production version on Play | **None** |
| Staged rollout | Not configured |

## If a version were published

1. **Halt rollout** to 0% in Play Console  
2. **Halt production** if SEV-1 (data/auth/payment)  
3. **Restore previous versionCode** via Play Console “manage release” / promote prior bundle  
4. **Server-side kill switches:** `NEXT_PUBLIC_DEMO_MODE` must stay fail-closed; feature flags if present  
5. **Do not** ship emergency unsigned APKs to users outside Play  
6. **Verify:** clean install of prior version; auth; no cross-account cache bleed  

## App-level recovery without Play rollback

- Force logout via token invalidation (server)  
- Clear client session on next open (already: logout wipes SyncQueue)  
- Disable broken API routes with 503 + safe client errors  

## Verification after rollback

- [ ] Crash-free startup  
- [ ] Auth works  
- [ ] No P0 security regression  
- [ ] Support notified  

**Until first successful production publish, rollback is theoretical.**
