# FitConnect iOS

A Mac is **not** required to install on the iPhone 14 Pro.

**GitHub → Actions `macos-15` → App Store Connect → TestFlight → iPhone**

Click-by-click: [`TESTFLIGHT.md`](TESTFLIGHT.md)

```text
pnpm ios:testflight-check
pnpm ios:device-check
```

USB/Xcode install remains optional for people who have a Mac (`scripts/ios-device-install`). TestFlight does not need Developer Mode.

Release archives use `FitConnectRelease.entitlements` (`aps-environment` = production). Debug USB builds keep development APS.

`GoogleService-Info.plist` and App Store Connect `.p8` keys are gitignored. CI injects them from GitHub Secrets.
