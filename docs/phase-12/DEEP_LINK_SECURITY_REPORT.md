# Phase 12 — Deep Link Security Report

## Android

**Guard:** `NavGuard.deepLinkToRoute()` — `android/foundation/navigation/NavGuard.kt`

### Phase 12 behavior

```kotlin
if (normalized.contains("/athlete/") || normalized.contains("/coach/")) {
    return CoreRoute.HOME  // force entry via HOME, then authorize()
}
```

Nested OS routes (`athlete/*`, `coach/*`) **cannot bypass** shell authorization by deep link alone. User lands on HOME; `authorize(HOME)` requires `ACCESS_APP_SHELL`.

### Route permission map

| Route | Permission | Anonymous allowed |
|-------|------------|-------------------|
| SPLASH | none | yes |
| GUEST | VIEW_GUEST_SHELL | yes |
| AUTH | VIEW_AUTH | yes |
| HOME | **ACCESS_APP_SHELL** | **no** |
| CATALOG | VIEW_LOGGED_SHELL | no (debug/internal) |

## Web

- Marketing URLs public
- `/dashboard`, `/coach/*` protected by `middleware.ts`
- Strava OAuth callback: state parameter validation — verify in strava-integration package

## Threats

| Threat | Mitigation | Status |
|--------|------------|--------|
| Open athlete screen without login | Force HOME + NavGuard | **Fixed** |
| Intent hijacking | App Links verification | **Open** — no `assetlinks.json` |
| Phishing deep link | User education + verified links | Open |
| Query param auth tokens in URL | Avoid logging; HTTPS only | Review OAuth callbacks |

## Recommendations

1. Ship Digital Asset Links for `https://fitconnect.app/...`
2. Custom scheme `fitconnect://` — same NavGuard path normalization
3. Log rejected deep links in analytics (no PII)

## Tests

- `NavGuardTest.kt` — deep link to athlete/coach paths

## Verdict

**Android nested OS deep link bypass: mitigated.** **Verified App Links not implemented** — residual phishing/hijack risk.
