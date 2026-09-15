# FitConnect iOS + Apple Watch

First-class native SwiftUI platform. This is not a Path A demo shell and not Expo.

Windows authors and statically validates this tree. **Compile, simulator, HealthKit authorization, Sign in with Apple, and Watch runtime require macOS + Xcode.** That is an Apple execution environment constraint, not an iOS implementation gap.

Next human step after macOS CI: **signed build on an iPhone 14 Pro** (Firebase Auth, HealthKit, TRAIN, Fight Mode, Recovery, battery). Not App Store submission.

## Product shape

- **ONE LOGIN** — `FirebaseApp.configure()` when `GoogleService-Info.plist` is present. Sign in with Apple uses a SHA-256 nonce and Firebase credential exchange. Athlete and Coach are modes of one session.
- Navigation: **Feed → Ascend → TRAIN → Dashboard → Profile**
- TRAIN uses `HKWorkoutSession` + `HKLiveWorkoutBuilder` + `HKLiveWorkoutDataSource`. Heart rate is DATA UNAVAILABLE until HealthKit delivers a sample.
- Core Motion uses `CMDeviceMotion` (attitude, rotation, user acceleration). Acceleration is never DIRECT force.
- Apple Watch: glanceable Fight Mode, haptics on warning, background workout via the live builder.
- Booking / Stripe / empty catalog: fail closed. No fabricated HR, readiness, EUR, or bookings.

## Generate and run (macOS)

```bash
cd iosApp
brew install xcodegen
cp GoogleService-Info.plist.example GoogleService-Info.plist   # then fill Firebase Apple values — never commit the live plist
xcodegen generate
xcodebuild -scheme FitConnect -destination 'generic/platform=iOS Simulator' -configuration Debug build CODE_SIGNING_ALLOWED=NO
xcodebuild -scheme FitConnectWatch -destination 'generic/platform=watchOS Simulator' -configuration Debug build CODE_SIGNING_ALLOWED=NO
```

CI: `.github/workflows/ios.yml` on `macos-15`.
