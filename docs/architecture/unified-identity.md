# Unified Identity

```text
Firebase Auth (1 session)
        ↓
identity_profiles
        ↓
user_capabilities[]  +  activeMode preference
        ↓
Athlete OS  ↔  Coach OS   (no second login)
```

## APIs

| Endpoint | Purpose |
|---|---|
| `GET /api/v1/identity/me` | Profile + capabilities + activeMode + entitlements |
| `PUT /api/v1/identity/active-mode` | Switch mode (capability-gated) |
| `PUT /api/v1/identity/role` | First grant / add capability (unified) |

## Security

`activeMode` is never trusted for privileged APIs. See `docs/security/role-capability-model.md`.
