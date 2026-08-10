# Phase 12 — Authorization Audit

## Android RBAC

**Source of truth:** `android/foundation/src/main/java/com/fitconnect/android/foundation/authz/Authorization.kt`

| Role | `ACCESS_APP_SHELL` | `ACCESS_ATHLETE_OS` | `ACCESS_COACH_OS` |
|------|-------------------|---------------------|-------------------|
| GUEST | No | No | No |
| ANONYMOUS | **No** (Phase 12) | **No** | No |
| ATHLETE | Yes | Yes | No |
| COACH | Yes | No | Yes |
| ADMIN | Yes | Yes | Yes |

**Enforcement points:**

1. `SessionAuthorizer.can(permission)` — programmatic checks
2. `NavGuard.authorize(CoreRoute)` — navigation commits
3. Feature modules should call `Authorizer`, not compare roles inline

**HOME route:** requires `AppPermission.ACCESS_APP_SHELL` (`NavGuard.kt`).

### Android AI authorization

Separate model in `AiPermissionGate.kt`:

- Athlete: SELF scope requires `targetAthleteId == principal.userId`
- Coach: ASSIGNED_ATHLETES only
- WRITE tools: denied at gate (proposals only)

## Web authorization

**Athlete resources:** `requireAthleteId` in `apps/web/lib/api/require-auth.ts`

```text
demo → permissive param
prod → auth.user.id (403 if param ≠ self)
admin → may pass explicit athleteId
```

**Coach resources:** `requireCoachId` — role must be coach or admin.

**Middleware:** path-prefix guard only; fine-grained auth at route handlers.

## Cross-surface matrix

| Action | Android | Web |
|--------|---------|-----|
| Open athlete home | `ACCESS_APP_SHELL` + athlete OS | `/dashboard` session |
| Coach views athlete telemetry | AI gate + `TelemetryPrivacy.coachMayRead` | API + future RLS |
| Admin impersonation | Not on Android local auth | `requireAthleteId` admin branch |

## Findings

| ID | Severity | Finding | Status |
|----|----------|---------|--------|
| A1 | High | ANONYMOUS had shell access pre-Phase 12 | **Fixed** |
| A2 | High | Client could self-assign ADMIN via email | **Fixed** (never granted) |
| A3 | Medium | Coach elevation via email substring | **Mitigated** (debug only) |
| A4 | Medium | Some web API routes may lack `requireAuth` | **Open** — route-by-route audit |
| A5 | Low | ADMIN role unused on Android local auth | By design until IdP |

## Tests

- `RolePermissionTableTest.kt` — ANONYMOUS lacks `ACCESS_APP_SHELL`
- `NavGuardTest.kt` — redirect behavior
- `require-auth.test.ts` — IDOR rejection

## Verdict

Android navigation and permission table are **consistent and fail-closed** for anonymous users. Web athlete binding is **correct for routes using `requireAthleteId`**. Complete API surface audit remains open debt.
