# ANDROID_AUTHORIZATION_MATRIX.md

Source: `supabase/migrations/*.sql` (schema intent). **Live RLS against production DB: NOT VERIFIED.**

| Table / object | SELECT | INSERT/UPDATE/DELETE | Notes |
|----------------|--------|------------------------|-------|
| `profiles` | own `auth.uid() = id` | update own | `001_auth.sql` |
| `athlete_profiles` | own id | (policies limited in migration) | `003_athletes.sql` — coach access via relationship **needs live review** |
| Coach / sessions / programs / community / payments | see migrations 002–010 | | Dual Prisma/Supabase debt remains |

## Client rules (Android)

| Action | Client | Server |
|--------|--------|--------|
| Role in session | Cached from IdP metadata | Authoritative |
| Athlete OS entry | `ACCESS_ATHLETE_OS` | API must re-check |
| Coach share telemetry | `actorId == athleteId` | Server consent |
| AI tools | `AiPermissionGate` | Domain ports |

**Client-only authz is insufficient.** Live RLS regression = **OPEN**.
