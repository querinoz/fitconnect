# Auth + RLS security report

Date: 2026-08-20

## Verdicts

| Gate | Status |
| --- | --- |
| RLS | **PASS** (identity tables: default deny + explicit own-row policies + FORCE RLS) |
| IDOR_TEST | **PASS** (API/unit). Live Postgres RLS suite **BLOCKED** here (no container runtime) |
| ROLE_AUTHORIZATION | **PASS** |
| Service-role on clients | **PASS** (not used) |

## Subject

Firebase UID in JWT `sub`. Helper: `public.firebase_uid()`.

**Do not** use `auth.uid() = id` on these tables (`auth.uid()` is uuid).

## Policy answers (identity tables)

| Question | Result |
| --- | --- |
| SELECT own row? | Yes (`id/uid = firebase_uid()`) |
| UPDATE own row? | Yes for profile, preferences, onboarding. **No** for `user_roles` (no UPDATE policy) |
| INSERT own profile? | Yes |
| Access another user's row? | No (RLS) |
| Athlete access coach-private identity? | No (own-row only) |
| Coach access athlete-private identity? | No |
| Unauthenticated access? | No (`FORCE RLS`, empty `sub`) |
| Self-assign ADMIN? | No (`WITH CHECK role in ('athlete','coach')`) |
| Change ATHLETE → COACH after insert? | No (no UPDATE policy; API returns `role_locked`) |

## API authorization

- `requireAuth` binds `user.id` to Firebase `sub`.
- `requireAthleteId` / `requireCoachId` reject cross-user query params (except demo + admin).
- `GET /api/v1/integrations/status` no longer defaults to `a-ines` without auth.
- `GET /api/v1/integrations/strava/coach` is fail-closed (`strava_not_shareable`).

## Privileged paths (explicit)

- Prisma remains for trusted server jobs.
- `INTEGRATION_AUTH_SECRET` machine header on Strava job routes — server-side only.

## Secrets

- Firebase web config is public client config, not a service account.
- `SUPABASE_SERVICE_ROLE_KEY` must never ship to Android/Web.
- Tokens are not logged.

## Still open P0 (not claimed fixed)

- Web Strava proxy allowlist still includes banned club/kudos/comments/explore paths in `packages/strava-integration`.
- No account-deletion flow.
- Live production JWT verification depends on HUMAN third-party Firebase setup on the Supabase project.
