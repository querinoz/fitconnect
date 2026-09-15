# FitConnect — TestFlight without a Mac

Windows cannot run `xcodebuild`. Delivery path:

**GitHub → GitHub Actions `macos-15` → Archive → App Store Connect → TestFlight → iPhone 14 Pro**

Xcode Cloud is optional (same Apple account, configured in the browser). Do not commit certificates, `.p8` keys, provisioning profiles, or `GoogleService-Info.plist`.

App identity (already in the repo):

| Field | Value |
| --- | --- |
| iOS bundle ID | `com.fitconnect.ios` |
| Watch | `com.fitconnect.ios.watchkitapp` |
| Widgets / Live Activity | `com.fitconnect.ios.widgets` |
| App Group | `group.com.fitconnect.ios` |
| SKU | `fitconnect-ios` |
| Version | `1.0.0` |
| Build | GitHub `run_number` (unique per upload) |
| Min iOS | 17.0 (iPhone 14 Pro OK) |

---

## Human actions (minimum)

Do these on a phone or Windows browser. The agent cannot enroll you in Apple programs or see your keys.

### 1. Apple Developer Program

1. Open [https://developer.apple.com/programs/](https://developer.apple.com/programs/)
2. Enroll → complete purchase (**paid program required** for TestFlight).
3. Wait until Membership is Active.
4. Account → Membership details → copy **Team ID** (10 characters).

### 2. Identifiers (developer.apple.com)

Open [https://developer.apple.com/account/resources/identifiers/list](https://developer.apple.com/account/resources/identifiers/list)

1. **Identifiers** → **+** → **App Groups** → Continue  
   Description `FitConnect` → Identifier `group.com.fitconnect.ios` → Register.
2. **Identifiers** → **+** → **App IDs** → App → Continue  
   Description `FitConnect` → Bundle ID **Explicit** `com.fitconnect.ios` → Register.  
   Edit it → enable **Sign In with Apple**, **HealthKit**, **Push Notifications**, **App Groups** (select `group.com.fitconnect.ios`) → Save.
3. Repeat App ID for `com.fitconnect.ios.watchkitapp` (Watch) with HealthKit + App Groups.
4. Repeat App ID for `com.fitconnect.ios.widgets` with App Groups only.

If you skip this, automatic signing *may* create IDs on first upload when the API key is **Admin**. Creating them first avoids a cryptic first-run failure.

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

### 4. App Store Connect API key

Open [https://appstoreconnect.apple.com/access/integrations/api](https://appstoreconnect.apple.com/access/integrations/api)

1. **Integrations** → **App Store Connect API** → **Team Keys** → **Generate API Key** (or **Request Access** first if shown)
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
2. Wait for **Archive + App Store Connect upload** (often 20–60 min the first time)
3. If **secrets-gate** is skipped/red: a secret name is missing or empty

After secrets exist, a push that touches `iosApp/` on `feat/elite-os-v2` also uploads.

### 7. TestFlight internal tester (you)

1. [App Store Connect](https://appstoreconnect.apple.com/apps) → **Apps** → **FitConnect** → **TestFlight**
2. Wait until the build leaves **Processing** (email from Apple)
3. **Internal Testing** → **+** → create group `Owner` if needed
4. **Add Testers** → add the Apple ID you use on the iPhone 14 Pro
5. Enable the latest build for that group
6. Answer **Export Compliance** only if asked — repo sets `ITSAppUsesNonExemptEncryption=NO` (HTTPS only). Confirm that still matches the app.

### 8. iPhone 14 Pro install

1. iPhone → App Store → search **TestFlight** → **Get** (Apple’s TestFlight app)
2. Open the TestFlight invitation email/SMS **on that iPhone** → **View in TestFlight** → **Install** → **Open**
3. Or: TestFlight app → **FitConnect** → **Install**
4. First launch: Sign in with Apple or email (ONE LOGIN). Allow HealthKit only for types you want. Deny must leave metrics as DATA UNAVAILABLE.

Developer Mode is **not** required for TestFlight (it is required only for USB Xcode installs).

---

## Optional: Xcode Cloud (browser)

Use this if you prefer Apple-hosted builds instead of GitHub Actions.

1. App Store Connect → **Apps** → **FitConnect** → **Xcode Cloud** → **Get Started**
2. Connect the GitHub repo `fitconnect` → grant access
3. Product: iOS app FitConnect. If the UI asks for an `.xcodeproj` and none is listed, stay on GitHub Actions — the project is generated by `iosApp/ci_scripts/ci_post_clone.sh` (`xcodegen`).
4. Environment variables: `IOS_GOOGLE_SERVICE_INFO_PLIST` (secret), optionally `APPLE_TEAM_ID`
5. Workflow: Archive → TestFlight Internal
6. Latest Xcode + latest macOS

---

## What the repo already does

- `xcodegen` project: iOS 17, watchOS 10, widgets, tests
- Release entitlements: HealthKit, Sign in with Apple, App Group, **APS production**
- Debug entitlements keep APS **development** for USB debugging
- GitHub Actions `ios.yml`: unsigned simulator build/tests on `macos-15`
- GitHub Actions `ios-testflight.yml`: signed archive + upload when secrets exist
- Firebase plist injected in CI, never committed
- Build number = `github.run_number`
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
