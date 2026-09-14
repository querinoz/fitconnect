---
name: mobile-e2e
description: Android Compose + Wear + Maestro; iOS only on macOS. Do not treat assembleDebug as UX proof.
---

# Mobile E2E

## Android

IMPLEMENT → Gradle assemble → adb install → launch → Maestro or Compose UI tests → a11y/touch targets.

Use `d:\fitconnect\.cursor\skills\android-emulator-skill` when an emulator is required.

## Wear

Glanceability, reconnect, do not copy phone chrome.

## iOS

On Windows: source/config only. Never claim Simulator success.

Maestro is the preferred cross-platform UI layer when a device/emulator exists. Install from the official Maestro docs when missing; do not invent a paid wrapper.
