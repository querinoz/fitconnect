# ANDROID_PLAY_STORE_PRECHECK.md

**Do NOT publish.**

| Item | Status | Notes |
|------|--------|-------|
| applicationId | OK | `com.fitconnect.android` |
| App name | OK | FitConnect |
| versionName / versionCode | OK | `0.1.0-rc.1` / 13 |
| AAB produced | YES | unsigned/default — needs production signing |
| Production signing | **MISSING** | `keystore.properties` |
| targetSdk 35 | OK | |
| Privacy policy URL | **MISSING** | document before listing |
| Data Safety form | **MISSING** | |
| Content rating | **MISSING** | |
| Screenshots / icon / feature graphic | **MISSING / incomplete** | verify adaptive icon assets |
| App access (demo login) | **N/A for release** | local auth disabled; need reviewer credentials via IdP |
| Wear companion | Do not declare | skeleton only |
| Permissions justification | Draft in permission matrix | finalize for console |

## Legal / policy

Do not invent privacy policy text. Product owner must supply.
