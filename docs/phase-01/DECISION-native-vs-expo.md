# Phase 01 Decision — Native foundation, not Expo

**Date:** 2026-08-07 · **Authority:** ADR-005 (owner-approved D1) + Phase 00 approval

## Conflict

The Phase 01 execution prompt asks for Expo Router, MMKV, Detox, FlashList, and an `apps/mobile` package tree (`auth/`, `network/`, …).

Phase 00 + ADR-005 already decided the opposite: **Kotlin + Jetpack Compose** under `android/`, with `apps/mobile` frozen legacy.

## Resolution

**Phase 01 builds the Android foundation on Track C (native).** Expo-specific steps in the prompt are treated as legacy wording and are **not executed**.

| Prompt ask | What we do instead |
|------------|--------------------|
| Expo Router / typed routes | Compose Navigation + typed routes (F3 expands) |
| MMKV / SecureStore | DataStore + EncryptedSharedPreferences (foundation interfaces) |
| FlashList | LazyColumn / later Compose lists (no RN) |
| Detox | Maestro (+ JUnit/Compose UI tests) |
| `packages/auth|network|…` under RN | `android/foundation/*` Gradle modules |
| Athlete/Coach/Maps/AI packages | **Not created** (explicitly forbidden; empty feature packages = debt) |

Cleanup Wave W1 from Phase 00 **is** executed (REMOVE_CANDIDATE only).

Elite Core (F1) remains the shared domain foundation and continues in parallel with the Android shell foundation — both are required before feature work.
