# FitConnect iOS — iPhone 14 Pro

Windows cannot compile or install this app. All remaining work is Mac + Apple account.

## One-time (Mac)

```bash
xcode-select --install
brew install xcodegen
git checkout feat/elite-os-v2
cp iosApp/Config/Local.xcconfig.example iosApp/Config/Local.xcconfig
# paste DEVELOPMENT_TEAM (Apple Developer → Membership)
cp iosApp/GoogleService-Info.plist.example iosApp/GoogleService-Info.plist
# replace REPLACE_ME with the Firebase iOS app (Bundle ID com.fitconnect.ios). Never commit this file.
./scripts/ios-device-check
./scripts/ios-sim-test
```

Firebase Console: add iOS app `com.fitconnect.ios`, enable Email + Apple, download plist.

Xcode (first signed run): open `iosApp/FitConnect.xcodeproj` → target FitConnect → Signing & Capabilities → Team. Enable only: Sign in with Apple, HealthKit, Push Notifications, Background Modes (Workout, Background processing, Remote notifications), App Groups `group.com.fitconnect.ios`.

## iPhone 14 Pro

1. Unlock, Trust This Computer.
2. Settings → Privacy & Security → Developer Mode → On.
3. USB connect.
4. `./scripts/ios-device-install`

If install fails, Xcode → select the iPhone → Run. Development signing is enough. Not App Store.

## First device tests (in order)

1. ONE LOGIN — Apple or email → Athlete → switch Coach → no logout.
2. TRAIN — start → lock → Dynamic Island → background → pause/resume → complete. Missing HR stays DATA UNAVAILABLE.
3. Martial Arts — Boxing / Muay Thai / BJJ Fight Mode rounds.
4. HealthKit — authorize / deny / revoke. Never invent samples.
5. Widgets + Live Activity + Watch if paired.

Fill results in `iosApp/DeviceQAMatrix.json`.

LOCAL_DEMO is Debug-only and hidden when the Firebase plist is present. Release cannot enable it.
Physical iPhone never uses localhost; API defaults to `https://fitconnect-phi.vercel.app`.
