# FitConnect Zenith™ — Unified Identity Final Report

**Date:** 2026-09-09  
**Branch:** `feat/elite-os-v2`  
**Focus:** Remove Athlete/Coach selection from authentication

---

## Root cause

Two UI paths forced “login as Athlete / Coach”:

1. **`AuthScreen` LOCAL_DEMO persona buttons** — Inês (Athlete), Tomás (Coach), etc. presented as the primary debug login.
2. **`RoleSelectScreen`** — post-Firebase gate with **“Entrar no Athlete OS / Entrar no Coach OS”** when `needsIdentityRoleSelection` was true.

Neither is authentication. Both violated: **one user → entitlements → active mode**.

---

## Before

```text
Login
 → Choose Athlete/Coach (persona buttons OR RoleSelectScreen)
 → Enter application
```

## After

```text
Login (email / Google / Apple — one account)
 → Firebase / local identity
 → Entitlements → capabilities
 → Default activeMode
 → Application
 → Profile → Switch Athlete/Coach (no logout)
```

---

## Changes

| Area | Change |
|---|---|
| `AuthScreen` | Unified welcome + email/password; **no persona chooser** |
| `RoleSelectScreen` | **Deleted** |
| `FitConnectNavHost` | Never mounts role selection |
| `needsIdentityRoleSelection` | Always `false` |
| `FirebaseAuthRepository` | Never sets `needsRoleSelection`; hydrates capabilities/activeMode from `/me` bootstrap |
| Strings EN/PT/ES | Removed “Entrar como Athlete/Coach” login copy |
| Maestro / androidTest | Email/password sign-in helpers |
| `UnifiedLoginArchitectureTest` | Locks default `EMAIL_SIGN_IN` |

---

## Gate results

| Gate | Result |
|---|---|
| OLD LOGIN MODEL | **REMOVED** |
| NEW LOGIN MODEL | **PASS** (code + unit test + assembleDebug) |
| ONE USER | **PASS** |
| ONE SESSION | **PASS** (design) |
| ATHLETE CAPABILITY | **PASS** (entitlement/DemoPersona map) |
| COACH CAPABILITY | **PASS** |
| PROFILE MODE SWITCH | **PASS** (`ActiveExperienceSwitcher`) |
| NO LOGOUT WHEN SWITCHING | **PASS** (Profile `setActiveMode`) |
| SERVER AUTHORIZATION | **PASS** (existing `/identity/active-mode` + requireCoachCapability) |
| PHYSICAL ANDROID | **BLOCKED** — awaiting manual WiFi install of `FitConnect-Zenith-ONE-LOGIN.apk` |
| REGRESSION | **PARTIAL** — unit tests PASS; full suite / Maestro not re-run on device |

---

## APK handoff (WiFi only)

```text
Phone Downloads: FitConnect-Zenith-ONE-LOGIN.apk
Local copy:      docs/qa/physical/FitConnect-Zenith-ONE-LOGIN.apk
```

Install manually. Expected login screen:

- **Welcome back**
- Email / Password / Sign in
- **No** Athlete / Coach / persona buttons
- **No** “Entrar no Athlete OS / Coach OS”

Mode switch only after login → **Profile → ACTIVE EXPERIENCE**.

---

## Production promotion

Still **not** automatic. Vercel Production remains on older deploy until physical QA of this APK passes and release gate is re-run.
