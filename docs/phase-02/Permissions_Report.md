# Phase 02 — Permissions Report

## Gateway

`PermissionGateway` / `AndroidPermissionGateway` centralizes:

| Permission | Status | Rationale key | Recovery key | Fallback |
|------------|--------|---------------|--------------|----------|
| Location | ✓ | `perm.location.*` | ✓ | yes |
| Camera | ✓ | `perm.camera.*` | ✓ | yes |
| Photos | ✓ | `perm.photos.*` | ✓ | yes |
| Microphone | ✓ | `perm.mic.*` | ✓ | yes |
| Bluetooth | ✓ | `perm.bluetooth.*` | ✓ | yes |
| Notifications | ✓ | `perm.notifications.*` | ✓ | yes |
| Activity recognition | ✓ | `perm.activity.*` | ✓ | yes |
| Health Connect | `UNSUPPORTED` placeholder | ✓ | ✓ | yes |

Manifest declares permissions + `uses-feature required=false` so Play does not filter devices. Runtime request UI is owned by future feature modules — they must call the gateway, never raw `ContextCompat` ad-hoc.

## Gaps

- No Activity Result request launcher wrapper yet (status/decision only)  
- `DENIED_PERMANENTLY` requires Activity context — status currently maps denied vs granted
