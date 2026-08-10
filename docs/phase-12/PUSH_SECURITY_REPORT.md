# Phase 12 — Push Security Report

## Components

| Surface | Path |
|---------|------|
| Android permission | `AppPermission.REQUEST_PUSH` — athlete/coach only |
| Prisma / Supabase | `PushToken` model, `009_notifications.sql` |
| Web push | PWA prod-only manifest |
| Android push port | NoOp in current release graph |

## Authorization

- Anonymous/guest: no `REQUEST_PUSH` in `RolePermissionTable`
- Token registration must bind to authenticated user ID on server

## Threats

| Threat | Mitigation | Status |
|--------|------------|--------|
| Register token for another user | Server binds token to session | **Open** — API audit |
| Token leakage in logs | Logger must redact | Convention — verify |
| Silent push data exfil | Payload minimization | Not implemented |
| Spoofed FCM sender | Firebase project isolation | Deploy config |

## Storage

- `push_tokens` table: RLS enabled in migration — not live-tested
- Local: no push token persistence in Phase 12 native (NoOp)

## Recommendations

1. Upsert push token only via authenticated route
2. Invalidate tokens on logout (server + client)
3. No PII in notification payload — use opaque IDs

## Verdict

Push is **low exposure on Android native** (NoOp). **Web/DB push token binding not security-verified** in Phase 12.
