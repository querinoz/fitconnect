# FitConnect — Master data cohesion report

**Date:** 2026-08-19  
**Rule:** The same person must have the same id, name, XP, and activity records everywhere. Demo seeds are still identities if the product treats them as the user.

## Canonical ids actually in the tree

| Store | Id | Display name (evidence) |
|---|---|---|
| Android `LocalDemoIdentity` / `LocalAthleteRepository` | `ath-1` | **Inês Costa** (`profile()`) |
| Web `DEMO_ATHLETE_ID` | `a-ines` | **Inês M.** / “Inês's Athlete OS” (live dashboard) |
| Web coach roster card | (seed athlete) | **Inês Correia** (live coach OS) |
| Web coach demo user | coach seed | **Tomás Ribeiro** |
| Wear telemetry/Ascend (after this session) | `ath-1` | No display name on watch |
| Wear session handle | default `sessionId = "wear-local"` | Not a user; still a naming trap |

**Conclusion:** Android↔Wear can share `ath-1` in code. Web is a different person. Coach roster is a third Inês. P0.

## Profile fields

| Field | Android | Web | Watch | Match? |
|---|---|---|---|---|
| User id | ath-1 | a-ines | ath-1 (code) | NO vs web |
| Display name | Inês Costa | Inês M. | n/a | NO |
| Avatar | LOCAL_DEMO asset names in community | initials in sidebar | n/a | NO shared URI |
| Title / badges | Ascend + achievement list | Helium Lv2 | rank code on pane | NO |
| XP / level | AscendEngine in-memory | 120 XP · 10% to Lv 3 | Ascend snapshot ath-1 | NO |
| Streak | Ascend streaks | “5-week PR streak” copy | streak n LOCAL_DEMO | NO |
| Squad | Label only | none | none | NO |
| Accent | ThemeSettings (now exposed) | appearance settings | brand Volt | NO sync |
| Privacy | Telemetry coach-share API | not the 4-level model | n/a | NO |

## Contracts

| Contract | Android | Web | Adapter? |
|---|---|---|---|
| Session ownership codes | `SESSION_OWNED_BY`, epoch, 8s transfer | `apps/web/lib/sync/session-ownership.ts` mirror | **YES** (unit 14 tests PASS) |
| Activity phase enums | Kotlin `LiveActivityPhase` | Insights demo ownership UI | Partial (insights test “no second START”) |
| JSON status `active` vs `ACTIVE` | Kotlin enums uppercase | TS unions mixed strings | Risk remains wherever a network DTO is invented; no live shared API this run |
| Workout completed event id | `userId:sessionId:WORKOUT_COMPLETED` | Not consumed by web XP | Native-only |

## Single-event propagation (RUN 10KM)

**Not executed.** No emulator GPS, no shared backend.

Expected 16 steps from the master prompt vs actual:

| Step | Actual |
|---|---|
| 1 Activity created | Android engine **can** (code). Web will not receive it. |
| 2 Telemetry stored | Local capture / LOCAL_DEMO |
| 3 Performance score | Engine field exists |
| 4 XP awarded | AscendEngine only |
| 5 Badge progress | AscendEngine only |
| 6 Streak | AscendEngine only |
| 7 PR eval | RecordLogic native |
| 8 Squad XP | **MISSING** |
| 9 Squad Momentum | **MISSING** |
| 10 Feed story | Community seed/posts, not wired to capture automatically as one id |
| 11 Profile stats | Native profile ≠ web |
| 12 Journey | **MISSING** |
| 13 Memory | **MISSING** |
| 14 Coach sees event | Seed alerts, not the session |
| 15 Watch | BLOCKED live |
| 16 Notification | PENDING_HUMAN |

## Duplicate / race

- AscendEngine: `store.append` false → `ProcessStatus.DUPLICATE`, 0 XP. **PASS inside one process.**
- Community create post: `idempotencyKey = UUID.randomUUID()` — **FAIL** for replay.
- Cross-platform replay: **untested** (no bus).

## Offline reconciliation

`OfflineCoordinator` exists. **Not executed** (no device network toggle). Do not mark PASS.

## Timezones / streaks

Not executed with TZ changes. **BLOCKED.**

## Data cohesion status

**FAIL.** Phone-watch id alignment is an incremental engineering fix, not ecosystem cohesion.
