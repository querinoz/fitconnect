# Phase 12 — Network Security Report

## Android

### Release / main

**File:** `android/app/src/main/res/xml/network_security_config.xml`

```xml
<base-config cleartextTrafficPermitted="false" />
```

All production traffic must use TLS.

### Debug overlay

**File:** `android/app/src/debug/res/xml/network_security_config.xml`

Cleartext permitted **only** for:

- `10.0.2.2` (emulator host)
- `localhost`
- `127.0.0.1`

Enables local Next.js dev server without weakening release builds.

### Manifest reference

`android:usesCleartextTraffic` not globally enabled; NS config is authoritative.

## Web

- Vercel production: HTTPS enforced
- `apps/web/app/res/xml/network_security_config.xml` — N/A (Android only)
- Web optional: `network_security_config` for PWA not applicable

## API client (Android)

- OkHttp in foundation layer
- Blocking calls — no certificate pinning in Phase 12
- Token refresh via `TokenRefresher` + Authenticator pattern

## Strava / third-party

- `@fitconnect/strava-integration` — HTTPS to Strava API only
- Webhook endpoints must verify signatures

## Threats

| Threat | Mitigation | Status |
|--------|------------|--------|
| Cleartext MITM (release) | NS config deny | PASS |
| Cleartext MITM (debug) | Loopback only | Acceptable dev risk |
| TLS downgrade | System trust store | No pinning yet |
| Insecure webhook | HMAC verification | Strava/Stripe when live |

## Recommendations

1. Certificate pinning for API base URL in release APK
2. `network_security_config` pin-set when backend domain fixed
3. HSTS on web (Vercel default)

## Verdict

**Release cleartext: denied.** **Debug loopback exception: scoped and overlay-isolated.** Pinning and full MITM test **not done**.
