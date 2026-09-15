# FitConnect — TestFlight without a Mac

Windows cannot run `xcodebuild`. Delivery path:

**GitHub → GitHub Actions `macos-26` + Xcode 26 + iOS 26 SDK → Archive → App Store Connect → TestFlight → public join URL → Vercel `IOS_TESTFLIGHT_URL` → https://fitconnect-phi.vercel.app/ios → QR → iPhone 14 Pro**

Apple requirement (since **28 April 2026**): uploads must be built with **Xcode 26 or later** using an **iOS 26 / watchOS 26 SDK**. The previous `macos-15` + `latest-stable` path was unsafe: GitHub’s macOS 15 image still defaults to **Xcode 16.4**. FitConnect CI now uses `macos-26` and pins `xcode-version: "26"`, then fail-closes if the SDK is older.

Xcode Cloud is optional (same Apple account, browser). Do not duplicate it unless GitHub-hosted macOS is unavailable. Do not commit certificates, `.p8` keys, provisioning profiles, or `GoogleService-Info.plist`.

App identity (already in the repo):

| Field | Value |
| --- | --- |
| iOS bundle ID | `com.fitconnect.ios` |
| Watch | `com.fitconnect.ios.watchkitapp` |
| Widgets / Live Activity | `com.fitconnect.ios.widgets` |
| App Group | `group.com.fitconnect.ios` |
| SKU | `fitconnect-ios` |
| Version | `0.1.0` |
| Build | max(App Store Connect builds+1, GitHub `run_number`) |
| Min iOS | 17.0 (iPhone 14 Pro OK; Dynamic Island + Live Activities) |
| Compile SDK | iOS 26 / watchOS 26 (CI-enforced) |

`/ios` never shows a QR until `IOS_TESTFLIGHT_URL` is a real `https://testflight.apple.com/join/{code}`. The QR encodes `https://fitconnect-phi.vercel.app/ios/install`, not the join code.

---

## Video method (`ZuT3N3wPpL0`)

Watched: [How to Get a Redeem Code on TestFlight](https://www.youtube.com/watch?v=ZuT3N3wPpL0) (Quick How To's!, ~2:02). Captions were unavailable. Opening frames show the **TestFlight App Store listing**.

That video is a **tester-side redeem-code walkthrough**. It is **not**:

- a cloud Mac / Xcode / GitHub Actions pipeline
- Xcode Cloud
- Ad Hoc or third-party signing
- automatic public-link generation
- a QR → TestFlight shortcut

**Applicable part:** after Apple issues an invitation, the tester installs Apple’s TestFlight app and redeems/opens the invite. **FitConnect uses a public join URL** (`/join/{code}`) on `/ios`, which is the current official external-tester path — not email redeem codes. Do not copy unofficial IPA sideloading from other videos.

---

## Human actions (minimum)

The agent cannot enroll you in Apple programs, complete 2FA, pay the $99 fee, or see your keys. After the five GitHub Secrets exist, CI archives, uploads, polls processing, creates TestFlight groups, and **retrieves a public link only if Apple actually returns one**.

### 1. Apple Developer Program

1. Open [https://developer.apple.com/programs/](https://developer.apple.com/programs/)
2. Enroll → complete purchase (**paid program required** for TestFlight).
3. Wait until Membership is **Active**.
4. Account → Membership details → copy **Team ID** (10 characters).

### 2. Identifiers (developer.apple.com)

Open [https://developer.apple.com/account/resources/identifiers/list](https://developer.apple.com/account/resources/identifiers/list)

1. **Identifiers** → **+** → **App Groups** → Continue  
   Description `FitConnect` → Identifier `group.com.fitconnect.ios` → Register.
2. **Identifiers** → **+** → **App IDs** → App → Continue  
   Description `FitConnect` → Bundle ID **Explicit** `com.fitconnect.ios` → Register.  
   Edit it → enable **Sign In with Apple**, **HealthKit**, **Push Notifications**, **App Groups** (select `group.com.fitconnect.ios`) → Save.  
   Do **not** enable Bluetooth unless you ship a real BLE accessory in that build.
3. Repeat App ID for `com.fitconnect.ios.watchkitapp` (Watch) with HealthKit + App Groups.
4. Repeat App ID for `com.fitconnect.ios.widgets` with App Groups only.

If you skip this, automatic signing *may* create IDs on first upload when the API key is **Admin**.

### 3. App Store Connect app record

Open [https://appstoreconnect.apple.com/apps](https://appstoreconnect.apple.com/apps)

1. **Apps** → **+** → **New App**
2. Platforms: **iOS** (watchOS ships as the companion)
3. Name: `FitConnect`
4. Primary language: **English (U.S.)**
5. Bundle ID: **com.fitconnect.ios**
6. SKU: `fitconnect-ios`
7. User access: Full Access → **Create**
8. Open the app → **App Information** → confirm bundle ID.
9. **Agreements, Tax, and Banking** (account top nav) → accept **Paid Applications** / **Free Applications** if yellow.
10. **App Information** → **Age Rating** — answer the 2026 questionnaire (required since 31 Jan 2026).

CI `scripts/asc-testflight.mjs ensure` can create the app record **only after** the bundle ID exists and the API key is Admin. If Apple returns a legal/agreement error, finish this screen first.

### 4. App Store Connect API key

Open [https://appstoreconnect.apple.com/access/integrations/api](https://appstoreconnect.apple.com/access/integrations/api)

1. **Integrations** → **App Store Connect API** → **Team Keys** → **Generate API Key** (or **Request Access** first)
2. Name: `FitConnect GitHub Actions`
3. Access: **Admin** (needed so `-allowProvisioningUpdates` can create distribution profiles). **App Manager** can upload only after profiles already exist.
4. **Generate**
5. Copy **Issuer ID** (top of the API page, UUID)
6. Copy **Key ID**
7. **Download** the `.p8` — Apple lets you download **once**. Store it in a password manager. Never commit it.

### 5. Firebase iOS app

Open [https://console.firebase.google.com/](https://console.firebase.google.com/)

1. Project **FitConnect** (existing) → gear → **Project settings** → **Your apps** → **Add app** → **iOS**
2. Bundle ID: `com.fitconnect.ios` → Register
3. Download `GoogleService-Info.plist` — do not commit
4. Authentication → Sign-in method → enable **Email/Password** and **Apple**
5. Apple provider: Services ID / Team ID / Key as Firebase documents for Sign in with Apple

### 6. GitHub Secrets (this is what starts TestFlight)

Open the repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Create exactly these five names (values never go in git):

| Secret name | What to paste |
| --- | --- |
| `APPLE_TEAM_ID` | 10-character Team ID |
| `APP_STORE_CONNECT_API_KEY_ID` | Key ID from step 4 |
| `APP_STORE_CONNECT_ISSUER_ID` | Issuer ID UUID |
| `APP_STORE_CONNECT_API_KEY_P8` | Full `.p8` text including `BEGIN PRIVATE KEY` |
| `IOS_GOOGLE_SERVICE_INFO_PLIST` | Full `GoogleService-Info.plist` XML |

Then:

1. GitHub → **Actions** → **iOS TestFlight** → **Run workflow** → branch `feat/elite-os-v2` → **Run workflow**
2. Confirm the macOS job logs **XCODE 26 + iOS 26 + watchOS 26 SDK OK**. If it fails the SDK gate, do not upload.
3. Wait for **Archive + App Store Connect upload** (often 20–90 min the first time)
4. If **secrets-gate** is skipped/red: a secret name is missing or empty

After secrets exist, a push that touches `iosApp/` on `feat/elite-os-v2` also uploads.

### 7. TestFlight internal tester (you)

1. [App Store Connect](https://appstoreconnect.apple.com/apps) → **Apps** → **FitConnect** → **TestFlight**
2. Wait until the build leaves **Processing** (email from Apple). CI also polls; `FAILED`/`INVALID` is a hard fail and must be fixed, then re-uploaded with a new build number.
3. **Internal Testing** → group `Owner` (CI creates this when the API allows)
4. **Add Testers** → add the Apple ID you use on the iPhone 14 Pro
5. Enable the latest build for that group
6. Export compliance: repo sets `ITSAppUsesNonExemptEncryption=NO` (HTTPS / system crypto only). Confirm that still matches the app.

### 8. External testing + public link (required for `/ios`)

Apple’s current help: [Invite external testers](https://developer.apple.com/help/app-store-connect/test-a-beta-version/invite-external-testers).

1. TestFlight → **External Testing** → group `Public Testers` (CI creates this when the API allows)
2. Fill **Test Information** (required before a public link / beta review):
   - What to Test: see `iosApp/AppStore/BetaReview.json` `whatsNew` / `notes`
   - Feedback email: **your real email** (do not invent a mailbox)
   - Privacy policy: `https://fitconnect-phi.vercel.app/privacy`
3. Add the processed build to the external group
4. Submit **Beta App Review** if Apple shows **Submit for Review**
5. Testers tab → **Create Public Link** → Open to Anyone (or filter iPhone / iOS 17+)
6. Copy the URL. It must look like `https://testflight.apple.com/join/XXXXXXXX` with **no** query, hash, or extra path.
7. If CI already printed `PUBLIC_LINK=https://testflight.apple.com/join/...` in the job log, use **that** URL. Never invent a code.

External distribution often waits on **Beta App Review**. That is a real Apple blocker. Do not bypass it.

### 9. Vercel `IOS_TESTFLIGHT_URL` (after the URL is real)

Do **not** put the join URL in git.

1. Open Vercel → FitConnect project → **Settings** → **Environment Variables**
2. Key: `IOS_TESTFLIGHT_URL`
3. Environment: **Production** only
4. Value: the real `https://testflight.apple.com/join/{code}`
5. Save → **Deployments** → Production → **Redeploy** (the `/ios` page is `force-dynamic`)

If GitHub already has `VERCEL_TOKEN` + `VERCEL_PROJECT_ID` and CI obtained a real public link, the **Set Vercel IOS_TESTFLIGHT_URL** job runs `scripts/set-ios-testflight-url.mjs` for you. Then still **redeploy** production.

### 10. iPhone 14 Pro install

1. iPhone Camera → scan the QR on https://fitconnect-phi.vercel.app/ios  
   The QR must open `https://fitconnect-phi.vercel.app/ios/install` → 302 → TestFlight
2. Or tap **Install on iPhone**
3. If TestFlight is missing: [Get TestFlight](https://apps.apple.com/app/testflight/id899247664)
4. TestFlight → **Install** → **Open** FitConnect
5. First launch: Sign in with Apple or email (ONE LOGIN). Allow HealthKit only for types you want. Deny must leave metrics as DATA UNAVAILABLE.

Developer Mode is **not** required for TestFlight (it is required only for USB Xcode installs).

---

## Optional: Xcode Cloud (browser)

Use this if GitHub-hosted `macos-26` is unavailable. Still require **Xcode 26**.

1. App Store Connect → **Apps** → **FitConnect** → **Xcode Cloud** → **Get Started**
2. Connect the GitHub repo `fitconnect` → grant access
3. Product: iOS app FitConnect. If the UI asks for an `.xcodeproj` and none is listed, `iosApp/ci_scripts/ci_post_clone.sh` runs `xcodegen`.
4. Environment: Latest Release **Xcode 26**. `ci_pre_xcodebuild.sh` fail-closes on older Xcode.
5. Environment variables: `IOS_GOOGLE_SERVICE_INFO_PLIST` (secret), optionally `APPLE_TEAM_ID`
6. Workflow: Archive → TestFlight. Xcode Cloud builds still need to be added to tester groups unless the workflow is set to auto-distribute.

Do not run Xcode Cloud **and** GitHub upload of the same build number.

---

## Legitimate fallbacks (if TestFlight is blocked by Apple)

Ranked. No jailbreak, unsigned IPA, or certificate abuse.

1. **TestFlight** (this pipeline) — required for a public `/ios` QR
2. **Xcode Cloud → TestFlight** — same Apple account, different Mac
3. **Ad Hoc** — needs each iPhone UDID registered; no public QR; still needs a paid Apple Developer account and signing
4. **Development USB** — needs a Mac + Developer Mode; not usable from this Windows agent

---

## What the repo already does

- `xcodegen` project: iOS 17 deploy, watchOS 10 deploy, widgets, tests, compiled with iOS/watchOS 26 SDKs in CI
- Release entitlements: HealthKit, Sign in with Apple, App Group, **APS production**
- Debug entitlements keep APS **development** for USB debugging
- GitHub Actions `ios.yml`: simulator build/tests on `macos-26` / Xcode 26
- GitHub Actions `ios-testflight.yml`: signed archive + upload + processing poll + beta groups when secrets exist
- `scripts/asc-testflight.mjs`: App Store Connect JWT (ES256), next build number, public link read-back
- Firebase plist injected in CI, never committed
- iPhone 14 Pro: Live Activities + Dynamic Island (`NSSupportsLiveActivities`)
- LOCAL_DEMO is Debug-only; physical device API is `https://fitconnect-phi.vercel.app`

## What is still NOT proven until a build is on the phone

Simulator CI ≠ TestFlight processing ≠ real HealthKit / Island / Watch hardware.

---

## After TestFlight install — real iPhone 14 Pro QA

Fill `DeviceQAMatrix.json`. Never fabricate HR / HRV / sleep / force.

1. Launch FitConnect from TestFlight
2. Auth — Apple or email
3. ONE LOGIN — Athlete → Coach → Athlete, no logout
4. Feed · Ascend · TRAIN FAB · Dashboard · Profile
5. TRAIN → START → lock → Live Activity → Dynamic Island (compact / expanded / minimal) → unlock → pause → resume → complete → sync
6. Martial Arts Fight Mode — round / rest / pause / resume / complete
7. HealthKit allow / deny / revoke
8. Add widgets: Today, TRAIN, Recovery, Progress, Martial Arts, Coach, Device — tap deep links
9. Watch companion if a Watch is paired (TestFlight installs it with the iOS app)
10. Failure: Airplane mode, kill app, relaunch, denied HealthKit, interrupted Live Activity
