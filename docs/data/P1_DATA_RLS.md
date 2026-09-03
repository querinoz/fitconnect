# P1-DATA â€” RLS

## Cert role (unchanged from P0-SEC)

```
CERT_ROLE=authenticated
rolsuper=false
rolbypassrls=false
SET LOCAL ROLE authenticated
request.jwt.claim.sub = <Firebase UID>
```

Never claim PASS with `service_role` or login `postgres` BYPASSRLS as the evidence role.

## New tables (016)

| Table | Policy summary |
| --- | --- |
| `activities` | Own CRUD; SELECT also public+shareable (STRAVA never shareable) |
| `activity_route_points` | Via parent activity ownership / shareable |
| `readiness_snapshots` | Own only |
| `badge_definitions` | SELECT all |
| `user_badges` | Own select/insert |
| `user_notifications` | Own select/insert/update |
| `domain_events` | Actor own insert; select own/null actor |
| `connected_devices` | Own CRUD |
| `data_schema_meta` | SELECT if `firebase_uid()` present |

## Grants

User-facing: `authenticated`. Catalog: `anon` SELECT on `badge_definitions` only.
**Never** ship `service_role` to clients.

## Tests

| Suite | Result |
| --- | --- |
| `tests/integration/identity-rls.integration.test.ts` | **5/5 PASS** (P0 regression) |
| `tests/data/p1-data-activities-rls.integration.test.ts` | **3/3 PASS** |

Command:

```powershell
$env:P0_SEC_LIVE_RLS='1'
pnpm --filter @fitconnect/web exec vitest run tests/data/p1-data-activities-rls.integration.test.ts tests/integration/identity-rls.integration.test.ts --fileParallelism=false
```
