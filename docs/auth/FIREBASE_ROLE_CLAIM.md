# Firebase `role: authenticated` claim (Supabase bridge)

**Project:** `fitconnect-5d2ba`  
**Supabase:** Third-Party Firebase Auth **ENABLED**  
**Billing:** Blaze (`billingEnabled: true`, account `015969-A071A4-798EF1`)  
**Identity Platform:** enabled — blocking functions registered in Console

Supabase Data API requires every Firebase ID token to include:

```json
{ "role": "authenticated" }
```

Without it, PostgREST assigns `anon` and RLS denies access (401/403).

## Status (2026-08-31 — certified)

| Check | Status |
| --- | --- |
| `functions/` build (`npm run build`) | **PASS** |
| Deploy (`beforecreated`, `beforesignedin`, `processSignUp`) | **PASS** — all **us-central1** |
| Console → Blocking functions | **PASS** — `beforecreated` + `beforesignedin` registered |
| `pnpm p1-auth:bridge` | **PASS** — `JWT_ROLE=authenticated`, `SUPABASE_REST_STATUS=200` |
| `pnpm p1-auth:backfill` | **PASS** — ADC, existing users updated |

---

## What we learned (not obvious from Firebase docs)

### 1. Billing account must be linked before anything else works

Cloud Functions Gen2, Artifact Registry, and Identity Platform upgrade all require **Blaze (pay-as-you-go)**. Link billing account `015969-A071A4-798EF1` to the project:

```powershell
gcloud billing projects link fitconnect-5d2ba --billing-account=015969-A071A4-798EF1
gcloud billing projects describe fitconnect-5d2ba
# billingEnabled: true
```

Identity Platform upgrade is included with Blaze (trial credits covered our deploy). Without billing linked, deploy fails before you ever see a function.

### 2. Local Node 20 is mandatory for predeploy

`firebase.json` runs `npm run build` (TypeScript) on the **local** Node before upload. Functions **runtime** is Node 20; local Node 25 is unsupported and risks tooling mismatches.

```powershell
nvm use 20          # or Node 20 LTS MSI
node -v             # v20.19.0
cd functions && npm install && npm run build
```

### 3. Audience mismatch on Gen2 blocking functions (us-east1 → us-central1 + SDK bump)

**Symptom:** sign-up returns 503 / Error 47. Function logs:

```text
Firebase Auth Blocking token has incorrect "aud" (audience) claim.
Expected "run.app" but got "https://us-east1-fitconnect-5d2ba.cloudfunctions.net/beforecreated"
```

**Root cause:** first deploy landed blocking functions in **us-east1** (Firebase CLI default). Identity Platform registered the `cloudfunctions.net` URL as audience, but `firebase-functions@6.4.0` expected `run.app` for Gen2.

**Fix (two parts):**

1. Delete stale us-east1 functions and redeploy with explicit region:

   ```typescript
   // functions/src/index.ts
   import { setGlobalOptions } from "firebase-functions/v2";
   setGlobalOptions({ region: "us-central1" });
   ```

   ```powershell
   npx firebase-tools functions:delete beforecreated --region us-east1 --project fitconnect-5d2ba --force
   npx firebase-tools functions:delete beforesignedin --region us-east1 --project fitconnect-5d2ba --force
   npx firebase-tools deploy --only functions --project fitconnect-5d2ba
   ```

2. Bump `firebase-functions` **^6.4.0 → ^7.2.2** — accepts both `run.app` and `cloudfunctions.net` audiences ([firebase-tools#9997](https://github.com/firebase/firebase-tools/issues/9997)). Without this bump, nobody reconstructs the fix in six months.

**Orphan cost:** failed us-east1 deploy left a `gcf-artifacts` repo in us-east1 (~87 MB). Safe to delete after human approval (no functions remain in us-east1):

```powershell
gcloud artifacts repositories delete gcf-artifacts --location=us-east1 --project=fitconnect-5d2ba
```

Active repo: `gcf-artifacts` in **us-central1** (~564 MB). Cleanup policy: images older than 1 day auto-deleted (`firebase functions:artifacts:setpolicy`).

### 4. Backfill via ADC, not service-account JSON on disk

Preferred for local maintenance scripts:

```powershell
gcloud auth application-default login
gcloud auth application-default set-quota-project fitconnect-5d2ba
pnpm p1-auth:backfill
```

Requires ADC principal with **Firebase Authentication Admin** (`roles/firebaseauth.admin`) or Owner. Fallback: `GOOGLE_APPLICATION_CREDENTIALS` pointing to a gitignored JSON.

---

## Implementation (this repo)

| Artifact | Purpose |
| --- | --- |
| `functions/src/index.ts` | v2 `beforeUserCreated` / `beforeUserSignedIn` + v1 `processSignUp` fallback |
| `firebase.json` | predeploy: `npm run build` in `functions/` |
| `.firebaserc` | project `fitconnect-5d2ba` |
| `scripts/p1-auth-firebase-role-backfill.mjs` | Admin SDK claim backfill (ADC or SA JSON) |
| `scripts/p1-auth-live-bridge-check.mjs` | Live probe; auto-deletes `@fitconnect-qa.invalid` unless `P1_AUTH_KEEP_TEST_USER=1` |
| `scripts/p1-auth-cleanup-test-users.mjs` | Dry-run list / `--confirm` bulk delete of synthetic accounts |

**API versions:**

| Export | API | Auto-registers in Console? |
| --- | --- | --- |
| `beforecreated` | v2 `firebase-functions/v2/identity` | Yes (blocking `beforeCreate`) |
| `beforesignedin` | v2 | Yes (blocking `beforeSignIn`) |
| `processSignUp` | v1 `auth.user().onCreate` | No — classic Auth trigger (async fallback) |

Client force-refresh after auth:

- Web: `getIdToken(true)` in `firebase-web-auth.ts`
- Android: `getIdToken(forceRefresh = true)` in `AndroidFirebaseAuthGateway`

---

## Prerequisites (human gates)

### GATE 1 — Node 20

```powershell
nvm install 20 && nvm use 20
node -v    # v20.x.x
cd D:\fitconnect\functions
npm install && npm run build
```

### GATE 2 — gcloud + Firebase CLI auth

```powershell
gcloud auth login
gcloud config set project fitconnect-5d2ba
npx firebase-tools login
```

### GATE 3 — Enable APIs

```powershell
gcloud services enable cloudfunctions.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com eventarc.googleapis.com run.googleapis.com pubsub.googleapis.com logging.googleapis.com --project=fitconnect-5d2ba
gcloud services list --enabled --project=fitconnect-5d2ba --filter="name:identitytoolkit"
```

### GATE 4 — Identity Platform

Firebase Console → Authentication → Settings → Identity Platform enabled.  
Blocking functions panel must show `beforecreated(us-central1)` and `beforesignedin(us-central1)`.

---

## Deploy

```powershell
cd D:\fitconnect
npx firebase-tools deploy --only functions --project fitconnect-5d2ba
```

Expected:

```text
beforecreated  (v2, us-central1, user.beforeCreate)
beforesignedin (v2, us-central1, user.beforeSignIn)
processSignUp  (v1, us-central1, user.create)
```

Artifact cleanup policy:

```powershell
npx firebase-tools functions:artifacts:setpolicy --project fitconnect-5d2ba
```

---

## Backfill existing users

```powershell
gcloud auth application-default login
gcloud auth application-default set-quota-project fitconnect-5d2ba
pnpm p1-auth:backfill
```

Expected: `BACKFILL=PASS`, `FAILED=0`.

---

## Verify

```powershell
$env:P1_AUTH_TEST_EMAIL = "p1auth.new.$(Get-Date -Format 'yyyyMMddHHmmss')@fitconnect-qa.invalid"
$env:P1_AUTH_TEST_PASSWORD = "FcP1NewUserCert9z"
pnpm p1-auth:bridge
```

Expected exit **0**:

```text
JWT_ROLE = authenticated
SUPABASE_REST_STATUS = 200
SUPABASE_BRIDGE = PASS
IDENTITY_BOOTSTRAP = PASS
TEST_USER_CLEANUP = DELETED
```

Keep synthetic account for debugging: `P1_AUTH_KEEP_TEST_USER=1 pnpm p1-auth:bridge`

---

## Synthetic test account hygiene

Bridge auto-deletes `@fitconnect-qa.invalid` accounts it creates. For bulk cleanup of accumulated accounts:

```powershell
pnpm p1-auth:cleanup-test-users          # dry-run — lists accounts, no deletes
pnpm p1-auth:cleanup-test-users --confirm   # deletes after human reviews dry-run list
```

---

## Secrets / gitignore

Never commit: `.env*.local`, `**/firebase-adminsdk*.json`, `*.service-account.json`, `.firebase/`, `users.json`, ADC files.
