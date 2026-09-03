# P1-AUTH — Security

## Boundaries

| Layer | Rule |
| --- | --- |
| Client role field | UI only — never authority |
| API role | `lookupIdentityRole` from `user_roles` |
| RLS | `firebase_uid()` = JWT `sub` |
| Admin | Cannot self-assign via client insert |
| Passwords / tokens | Never logged; Android uses EncryptedSharedPreferences + MasterKey |
| service_role | Never shipped to clients |

## Closed this phase (agent)

1. AuthGate `?demo=` bypass when demo mode is off.
2. MobileAppLauncher demo persona login when demo mode is off.
3. Middleware: demo off + Firebase missing → redirect (no open dashboards).
4. tRPC context uses Firebase `requireAuth` (not Supabase Auth cookies).
5. Identity bootstrap upsert + re-read on race.

## Still HUMAN / limited

| Item | Status |
| --- | --- |
| Web `NEXT_PUBLIC_FIREBASE_*` | ABSENT on this machine → live signup **BLOCKED** |
| `google-services.json` | ABSENT → Android live IdP **BLOCKED** |
| Supabase third-party Firebase JWT claim `role=authenticated` | PENDING_HUMAN |
| Middleware JWT **signature** verify | Shape-only at edge; API verifies RS256 |
| Apple Sign-In production | Later |
| Physical device / Maestro | See exit report |

## IDOR / RLS

Must remain PASS under `authenticated` (re-run after P1-AUTH). Do not weaken policies to “fix” auth.
