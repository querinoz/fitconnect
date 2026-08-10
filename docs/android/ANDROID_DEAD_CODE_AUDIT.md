# ANDROID_DEAD_CODE_AUDIT.md

**Date:** 2026-08-09

## Deleted (reference-proven)

| Artifact | Proof | Action |
|----------|-------|--------|
| `NoOpNotificationGateway` | DI unused; replaced by Fake/Dev/FailClosed/FCM | Deleted |
| `NoOpRealtimeClient` | DI unused | Deleted |
| `ArchitectureCoachAiPort` | Only EngineCoachAiPort wired | Deleted class |

## Kept with justification

| Artifact | Why keep |
|----------|----------|
| `apps/mobile` Expo | ADR freeze — not Android dead code |
| `:wear` / `:core-capture` | Explicit scaffolds |
| `NoOpAnalytics` / `NoOpImageLoader` | Actively wired until providers chosen |
| Local* repositories | Debug/demo product data path |

## Orphan resolved

`:community` now depended by `:athlete` + CommunityScreen + unit test.
