# FitConnect iOS Path A

This folder contains the first-party SwiftUI scaffold for the FitConnect iOS app.

## Structure

- `project.yml` — XcodeGen project definition
- `FitConnect/` — app source tree
- `FitConnect/Design/` — Elite Surface-inspired brand primitives
- `FitConnect/Navigation/` — root router plus athlete/coach shells
- `FitConnect/Auth/` — local demo entry flow
- `FitConnect/Athlete/` — athlete surfaces and secondary screens
- `FitConnect/Coach/` — coach command surfaces and secondary screens
- `FitConnect/SharedAdapters/` — Path A contracts and demo catalog
- `FitConnect/Telemetry/` — zone engine bridge contract
- `FitConnect/Health/` — HealthKit contract with external blocker note
- `FitConnect/Maps/` — maps contract

## Generate the project

```bash
xcodegen generate
open FitConnect.xcodeproj
```

## Current scope

This tree is intentionally `LOCAL_DEMO` first:

- Real SwiftUI screens instead of placeholders
- Brand colors based on Elite Surface tokens
- Athlete shell with `Home`, `Analysis`, `Vault`, `Profile` plus `Train`
- Coach shell with `Overview`, `Athletes`, `Calendar`, `Inbox`, `More`
- Shared contracts for API, auth, realtime, offline queue, telemetry, HealthKit, and maps

## Follow-up

- Wire contracts to real backends after Path A provisioning
- Bridge `ZoneEngineContract` to `EliteCore`
- Replace `BLOCKED_EXTERNAL` surfaces once HealthKit entitlements and Apple signing are available
# FitConnect iOS Path A

This tree is a real SwiftUI source scaffold for the Path A native iOS surface.
It is intentionally source-complete on Windows, but physical device builds remain blocked outside this workspace.

Status: `IOS_PHYSICAL_BUILD_BLOCKED_EXTERNAL`

Key notes:
- Path A native iOS shell only; no splash-only placeholder app.
- Expo mobile work was removed from the tree (ADR-005). Recover from git history if needed.
- Build and signing must happen on macOS with Xcode 16+.
- `project.yml` is included for XcodeGen so the project can be generated on a Mac.
- `HealthKitContract.swift` is intentionally honest about local verification limits and does not claim fake PASS status.

Suggested Mac workflow:

```bash
cd iosApp
brew install xcodegen
xcodegen generate
open FitConnect.xcodeproj
```

App shape:
- Athlete IA: `Today`, `Analysis`, `Vault`, `Profile` plus a primary `Train` action.
- Coach IA: `Overview`, `Athletes`, `Calendar`, `Inbox`, `More`.
- All screens render local demo data with `LOCAL_DEMO` banners and working in-app navigation.
