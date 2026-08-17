# FITCONNECT SQUAD OS™ — MEGA PROMPT (Opus 5 Max)

**How to use / Como usar**

1. Open a **new** Cursor agent chat on model **Claude Opus 5 Max** (or the closest available Opus).
2. Paste **only** the block between `BEGIN_MEGA_PROMPT` and `END_MEGA_PROMPT`.
3. Do not attach a second mission. Do not ask the agent to “also fix unrelated bugs” in the same prompt.
4. Let it run **S0 → S18**. If it skips S0, stop it and restart.
5. Accept `ENGINEERING_COMPLETE = PASS` only if the exit gate in this prompt is satisfied with **real evidence**. Production credentials may remain `PENDING_HUMAN`.

1. Abre um **novo** chat de agente no **Claude Opus 5 Max**.
2. Cola **apenas** o bloco entre `BEGIN_MEGA_PROMPT` e `END_MEGA_PROMPT`.
3. Não envies uma segunda missão no mesmo prompt.
4. Exige **S0 → S18**. Se saltar o audit, interrompe.
5. Só aceita PASS com evidência. Credenciais de produção podem ficar `PENDING_HUMAN`.

---

```
BEGIN_MEGA_PROMPT
```

You are simultaneously:

- Principal Product Architect
- Lead Principal Android Engineer
- UX / UI Director
- Motion Designer
- Gamification Designer
- Data / Domain Architect
- Realtime Systems Integrator
- QA Lead (unit, instrumentation, emulator, visual)
- Ecosystem Auditor (web, PWA, landing, dashboards, Wear, Coach OS, Athlete OS)

You have full authority to inspect, refactor, create, delete obsolete prototypes, install safe local tooling, run Gradle, run the Android Emulator, capture screenshots, and write documentation.

You MUST NOT:

- invent passing tests
- claim device / emulator verification without execution evidence
- fabricate Firebase / Supabase / Google Cloud / signing / Play credentials
- weaken fail-closed production gates
- replace real integrations with fake production implementations
- skip a phase gate
- claim production readiness because LOCAL_DEMO works
- create a colorful generic “groups” social app
- create public humiliation rankings, fake scarcity, guilt streaks, or calorie punishment
- fabricate population statistics (“owned by 2.4%”) unless real data exists
- expose live location / HR / GPS without explicit per-member visibility
- duplicate ASCEND XP math inside Compose
- add a sixth unrelated visual language

Human-owned production infrastructure remains HUMAN:

Supabase production, Firebase production, FCM, Google Cloud Test Lab, production signing, Play Console.

If a tool is missing and can safely be installed: INSTALL IT.
If an external production system is unavailable: USE LOCAL_DEMO.
If evidence cannot be produced: DO NOT CLAIM PASS.
If a test fails: STOP THE CURRENT GATE, FIX, RERUN. Do not bank known failures.

Do not ask the user for confirmation. Start with phase **S0**.

---

## 0. PRODUCT MISSION

Implement **FITCONNECT // SQUAD OS™** as a foundational layer of FitConnect Elite OS.

This is NOT “a group of friends.”
This is a **collective performance unit**.

The athlete must feel:

> “I am training alone, but I am never alone.”

Philosophy (do not bury this in a settings footnote):

> ONE ATHLETE CAN TRAIN.
> A SQUAD CAN TRANSFORM.

The goal is not “Squad OS implemented.”
The goal is:

**FITCONNECT FEELS ALIVE.**

Athlete, Coach, Squad, Map, Telemetry, ASCEND gamification, missions, badges, boosts, realtime, progress, and performance must feel like **one product, one identity, one experience**.

The user must be able to launch the Android Emulator and inhabit a complete FitConnect world without production credentials.

---

## 1. NON-NEGOTIABLE IDENTITY

Squad OS must visually and verbally belong to **FITCONNECT — ELITE OS**.

Do not redesign FitConnect into Discord + Strava clubs + a mobile game.

Identity (already canonical — reuse tokens, do not invent hues):

- Floor / obsidian / carbon (`--eos-floor` / Elite Surface floor)
- Voltline `#C8FF00`
- Connect teal `#00DDB4`
- Telemetry cyan, Iris, Performance, Recovery amber, Alert crimson
- Type: Syne (display), Plus Jakarta Sans (body), JetBrains Mono (SYS.* / metrics)
- Glass, hairline borders, localized glow, F1-style hierarchy, Linear/Raycast restraint
- Technical labels used sparingly: `SQUAD // VELOCITY`, `LIVE // SQUAD`, `SQUAD // SIGNAL`, `COMMAND // SQUAD`

Gamification must feel like **PERFORMANCE INTELLIGENCE**, not a children’s game.

Motion: premium, fast, interruptible, reduced-motion compatible. No particle spam.

Copy: EN + PT at minimum. Do not translate brand/system names (ASCEND, SQUAD OS, PRIME RECOVERY, PERFORMANCE VAULT, SQUAD MOMENTUM, LIVE SQUAD, SQUAD MAP, SQUAD SIGNAL).

---

## 2. CURRENT REPOSITORY — YOU MUST AUDIT THIS FIRST (S0)

Repo: FitConnect monorepo. Android is a Gradle multi-module app. Web is Next.js. Design tokens live in Elite Surface (`--eos-*`, `EliteSurfaceColors`).

**Already exists — DO NOT duplicate as a second XP universe:**

| Surface | Location | How Squad OS must treat it |
|---|---|---|
| ASCEND™ engine | `android/ascend` (`AscendEngine`, `ascend.xp.v1`, idempotent `eventId`) | Canonical **individual** XP. Squad XP is a **contribution slice** of processed events, not a parallel calculator in UI. |
| ASCEND squad challenge stub | `ChallengeType.SQUAD`, `squad-fc-week`, `AscendEngine.squadChallenge()` | Evolve into Squad missions; do not leave a second competing squad XP. |
| Athlete Home / Vault / Activity complete | `:athlete` | Home must surface Squad Momentum with progressive disclosure. Vault may show collective badges. Post-workout must show Individual XP **and** Squad contribution. |
| Coach LIVE SQUAD | `:coach` `OverviewScreen.LiveSquadCard` | Privacy: location only if `coachMayRead(LOCATION)`. Extend into COMMAND // SQUAD. Do not become Big Brother. |
| Coach ASCEND card | `SquadAscendCard` | Replace/merge into Squad OS command health. |
| Community | `:community` (feed, reactions, groups, challenges, leaderboards, `VisibilityResolver`) | Social graph/feed primitives. Squad Signal is **operational**, not a clone of Community posts. Reuse privacy/visibility. Do not humiliation-rank via `LeaderboardEngine`. |
| Athlete Community tab | `AthleteDest.COMMUNITY` bottom tab | Product decision in S1: either **replace Community tab with SQUADS** as primary collective home, or nest Squads as the first surface inside Community. Do not add a sixth bottom tab that wrecks the bar. Default recommendation: **SQUADS replaces Community as the bottom-tab label**, Community feed becomes a destination inside Squad / Discover. Document the decision. |
| Wear | `:wear` ASCEND pane, Data Layer `WearPaths`, pairing often **UNVERIFIED** | Mirror momentum / live / boost as compact instrument. Never duplicate phone UI. Never fake pairing. |
| Capture / map | `:core-capture` `LiveActivityEngine`, `EliteRouteMap`, `QaGpsRoute` | Squad Map reuses routes. Demo segments already must stay LOCAL_DEMO labeled. |
| Notifications | `NotificationCategory` including `PROGRESSION` | Add `SQUAD` category. User can disable. No guilt notifications. |
| Web | `apps/web` landing, `/community`, elite mobile cockpit tabs home/discover/activity/community/profile, i18n | Same language. Landing + cockpit + Android must not look like three products. |
| LOCAL_DEMO personas | Inês, Marina, Tomás (`DemoPersona`) | Deterministic Squad VELOCITY members. |
| Realtime | In-process / Broadcast / Convex planned | Local in-process bus for emulator. Production Convex/Supabase = PENDING_HUMAN. |

**Known honesty constraints from prior work (do not lie about them):**

- Wear Data Layer pairing: often UNVERIFIED
- Live GPS/HR: LOCAL_DEMO or PENDING_DEVICE
- Garmin/WHOOP/Oura/Strava OAuth: PENDING_HUMAN
- Client XP is not production-authoritative
- Coach emulator walkthrough for ASCEND squad card was previously NOT_RUN — you must verify it

Create:

`docs/squad/SQUAD_ARCHITECTURE_AUDIT.md`

Document: what exists, what to reuse, what to refactor, what to create, what to remove, risks, dependencies.

STOP S0 until the audit file exists and is accurate against the repo.

---

## 3. ABSOLUTE ARCHITECTURAL RULE

Squad OS is a **domain system**, testable without Compose.

Create a dedicated module (preferred: `android/squad` kotlin-jvm, same pattern as `:ascend` and `:shared`).

Conceptual engine (adapt names to existing packages; do not blindly create empty folders):

```
SquadEngine
├── SquadIdentity
├── SquadMembers
├── SquadPresence
├── SquadTelemetry
├── SquadXP
├── SquadLevel
├── SquadMissions
├── SquadChallenges
├── SquadStreak
├── SquadBadges
├── SquadFeed          // SQUAD // SIGNAL
├── SquadBoost
├── SquadMap
├── SquadMomentum
├── SquadSeasons
├── SquadPrivacy
└── SquadAnalytics
```

Adapters:

```
Athlete / Coach / Wear / Web
        │
        ▼
   Squad Engine
        │
        ├── LOCAL_DEMO (canonical for emulator)
        ├── in-process realtime bus
        ├── future Supabase  (PENDING_HUMAN)
        └── future Firebase  (PENDING_HUMAN)
```

UI never computes authoritative Squad XP, Momentum, or Level.

ASCEND processes the activity event **once** (idempotent `eventId`).
SquadEngine **subscribes** to accepted ASCEND results (or shared `PerformanceEvent` log) and applies contribution rules.
One event → one individual award → one squad contribution. Never double-award from phone + watch + server + squad.

---

## 4. DOMAIN MODEL (minimum)

Immutable where appropriate:

- `SquadId`, `SquadCode` (e.g. `FC-7X92`)
- `SquadIdentity` (name, logo seed, color token, motto)
- `SquadMember` (userId, role ATHLETE/COACH/ADMIN, joinedAt, status)
- `LiveVisibility`: `INVISIBLE` | `ACTIVITY_ONLY` | `PERFORMANCE` | `FULL_TELEMETRY`  (**default INVISIBLE or ACTIVITY_ONLY — never FULL**)
- `SquadPresence` (IDLE / LIVE / RECOVERING / OFFLINE)
- `SquadMomentum` (percent 0–100, deltaVsYesterday, activeCount, memberCount, computedAt)
- `SquadXpAward` (individualXp, squadContributionXp, eventId, explanations)
- `SquadLevel` + unlock table
- `SquadMission` (GLOBAL distance, COOPERATIVE everyone-moves, NO_ONE_LEFT_BEHIND)
- `SquadChallenge`
- `SquadStreak` (PERSONAL shown in context, SQUAD, optional GLOBAL as community-wide LOCAL_DEMO labeled)
- `SquadBadge`
- `SquadSignal` (operational feed item — not a social post)
- `SquadBoost`
- `SquadSeason`
- `SquadMapFrame` (aggregated shared routes only)
- `SquadAura` (LOW / ACTIVE / HIGH_MOMENTUM / ZENITH) — visual state from momentum, not a second score
- `SquadSnapshot` — the only object UI may render

Privacy: if visibility is INVISIBLE, Live Squad and Map must not show that member. Coach Command Center must still honor the same flags. Missing sensors ≠ zeros.

---

## 5. SQUAD MOMENTUM™

The hero metric. A living 0–100 index of collective energy/performance.

Must be:

- deterministic
- versioned (`squad.momentum.v1`)
- explainable
- unit tested
- **not** “more volume = higher momentum” if recovery of the unit is poor
- not a medical claim

Suggested inputs (configurable weights summing to 100, document exact algorithm):

- Active member ratio (today)
- Mission progress
- Recovery distribution (reward rest that is declared; do not punish recovery days)
- Quality of sessions (reuse ASCEND quality dimension, not raw km)
- Cooperative participation (everyone moves)

UI example (copy, not a pixel-perfect mandate — Elite OS layout):

```
SQUAD // VELOCITY
87%
SQUAD MOMENTUM
▲ +12.4% vs yesterday
24 ACTIVE  •  28 MEMBERS

TODAY'S COLLECTIVE OUTPUT
142.8 KM DISTANCE
18.4 H TRAINING
18,420 KCAL ENERGY DEPLOYED   ← never “burned as punishment”
+12,840 SQUAD XP
```

Kcal copy: **ENERGY DEPLOYED** / collective output. Illustrative equivalents allowed (pizzas, Eiffel, Porto→Madrid) with the same ASCEND disclaimer:

> Illustrative equivalent. Not nutritional advice. Not a food reward.

LOCAL_DEMO totals must be labeled LOCAL_DEMO. Never send demo aggregates to production.

---

## 6. INDIVIDUAL XP ↔ SQUAD XP

Reuse ASCEND awards. Do not invent a second workout XP table that disagrees with `ascend.xp.v1`.

On each accepted ASCEND `ProcessResult`:

```
INDIVIDUAL XP     = result.awardedXp          (already recovery-weighted)
SQUAD CONTRIBUTION = floor(awardedXp * contributionRate)
```

`contributionRate` is versioned (example 0.25). Document it. Cap contribution. Do not siphon so hard that the athlete feels they “work for free.”

Show both on Performance Complete:

```
+420 XP
SQUAD CONTRIBUTION +105
VELOCITY MOMENTUM +1.2
```

WHY / RESULT / NEXT (ASCEND UX principle) must still answer:

- WHAT did I accomplish?
- WHY does it matter (personal + squad)?
- WHAT changed?
- WHAT can I do next?

---

## 7. SQUAD LEVEL

Separate from personal ASCEND rank. Centralized thresholds. Extensible names (product concepts):

| Level | Name | Unlocks (examples — do not paywall safety) |
|---|---|---|
| 1 | FORMATION | Squad created |
| 5 | CONNECTED | First collective mission |
| 10 | UNIT | Live Squad |
| 15 | PERFORMANCE | Squad analytics |
| 18 | VELOCITY (demo default) | — |
| 20 | ELITE UNIT | Advanced challenges |
| 30 | APEX | Special events |
| 50 | ZENITH | FitConnect Zenith Squad identity |

Demo persona squad **VELOCITY** may start at Level 18 with `48,240 / 60,000 XP` **labeled LOCAL_DEMO**.

Unlocks never hide Prime Recovery, injury-adjacent safety, or privacy controls.

---

## 8. MISSIONS (the addictive layer — without guilt)

Types:

1. **GLOBAL / THE 500** — e.g. 500 km this week. Contributions listed as participation, not shame.
2. **EVERYONE MOVES** — every member records at least one valid session or recovery protocol. `24 / 28 MEMBERS`. Remaining copy: “4 members still have a window” — never “4 members failed.”
3. **NO ONE LEFT BEHIND** — 100% active in the week. Cinematic complete overlay, dismissible, reduced-motion safe. Bonus XP. Animation must not jank the emulator; if it does, simplify.

Principle: **NO MEMBER LEFT BEHIND** motivates; it does not punish.

Forbidden copy:

- “You lost your streak”
- “You failed the squad”
- “Last place”

Required copy energy:

- “Your Squad is waiting for you.”
- “3 members are already moving.”
- “+2.4 km needed to complete today’s mission.”

---

## 9. STREAKS

Three layers, clearly labeled:

- PERSONAL STREAK (ASCEND — already recovery-protected)
- SQUAD STREAK (at least one valid collective activity per UTC day)
- GLOBAL STREAK (optional LOCAL_DEMO community counter — never fake production)

Squad streak must respect recovery: a recovery-protocol day from enough members can protect the squad day. Document the exact rule.

---

## 10. COLLECTIVE BADGES

Curated registry, not hundreds of junk badges. Examples:

FIRST FORMATION, UNITED, NO ONE LEFT BEHIND, 100 KM, 1,000 KM, NIGHT SHIFT, EARLY UNIT, IRON WEEK, CENTURY, APEX.

Rarity display: no fabricated “owned by X%.” Demo: `LOCAL_DEMO · simulated rarity`.

Connect to ASCEND vault where it does not confuse personal vs collective.

---

## 11. LIVE // SQUAD

Who is training **now**.

Show only what visibility allows:

- INVISIBLE: absent from live list and map
- ACTIVITY_ONLY: name + sport + “in session”
- PERFORMANCE: + distance / duration / pace or sets (no HR, no GPS)
- FULL_TELEMETRY: HR/zone/route if sensors AVAILABLE; never invent HR

Default: **not FULL_TELEMETRY**.

Coach sees aggregated health (`87% READY`, `24 ACTIVE / 4 RECOVERING / 2 OFFLINE`) without forcing per-athlete HR.

Reuse Wear / capture presence when pairing exists; otherwise LOCAL_DEMO live members (Marina run, Tomás ride, Inês strength) explicitly labeled.

---

## 12. SQUAD MAP™

Reuse `EliteRouteMap`. Collective luminous traces from **shared** activities only.

- No map pin for INVISIBLE
- No live location without PERFORMANCE/FULL + location permission
- Demo routes LOCAL_DEMO
- On weekly mission complete: **SQUAD ROUTE COMPLETE** visualization (restrained, interruptible)

Do not fabricate public live rankings on the map.

---

## 13. SQUAD // SIGNAL (operational feed)

NOT a traditional social feed.

Items: PR, mission %, badge unlock, session complete, momentum delta, boost.

Reactions (not empty likes): FIRE, BOOST, RESPECT, READY, LEGEND.

BOOST on a live member:

```
SQUAD BOOST
Tomás, Inês, João are behind you.
+150 MOTIVATION XP
```

Motivation XP must flow through ASCEND/SquadEngine with idempotent boost IDs (`boost:{sessionId}:{fromUserId}`). Cap boosts per session. No spam.

Notifications: only if progression/squad prefs enabled. Deep link to live session or signal item.

---

## 14. SEASONS

Each squad has seasons (e.g. SEASON 01 ROAD TO ZENITH, 42 days).

Goals example: 10,000 KM / 100 H / 1,000 sessions.

On complete: medal, summary, optional LOCAL_DEMO rank among demo squads **labeled simulated**. No fake global Play-Store ranking.

---

## 15. IDENTITY + AURA

Squad identity: name, code, generated mark (token colors only), motto.

Aura from momentum:

- LOW — subtle glow
- ACTIVE — stronger pulse
- HIGH_MOMENTUM — restrained aurora
- ZENITH — cinematic field, reduced-motion = static

Aura is decoration of Momentum, not a third score.

---

## 16. NAVIGATION

Athlete (target):

HOME · DISCOVER · TRAIN/ACTIVITY · **SQUADS** · PROFILE

Squads hub:

- MY SQUADS (cards: name, level, members, momentum, XP today)
- CREATE SQUAD
- JOIN SQUAD (code)

Do not add “Gamification” or “Squad OS” as a junk tab.

Coach: COMMAND // SQUAD on overview — health, presence, mission, not a surveillance wall.

Watch: momentum %, live count, boost receive, daily mission remainder. Concise.

Web landing / cockpit / dashboards: same names, same tokens, same philosophy. If web cannot get a full Squad Engine this phase, add an honest LOCAL_DEMO cockpit panel + architecture adapter — do not ship a mismatched Level 17 vs Android Level 18.

---

## 17. LOCAL DEMO PERSONAS (deterministic)

Squad **VELOCITY** · code **FC-7X92** · motto **NO LIMITS. ONE UNIT.** · Level 18 LOCAL_DEMO.

Members: Inês, Marina, Tomás + additional deterministic athletes as needed (João, Pedro) clearly demo.

Scenarios: new squad, active evening, live 3 athletes, mission 82%, no-one-left-behind incomplete, season in progress, recovery day protecting streak.

Never POST demo events to production backends.

---

## 18. MOTION / HAPTICS / A11Y

Presets: momentum pulse, mission fill, boost send, season complete, no-one-left-behind, aura.

60fps target, cancellable, `LocalReduceMotion` / `EliteMotion` duration 0.

Haptics optional via existing ASCEND prefs.

TalkBack labels on momentum, mission %, live list (do not leak hidden telemetry in contentDescription).

---

## 19. PHASE GATES — NEVER SKIP

**S0 AUDIT** — `SQUAD_ARCHITECTURE_AUDIT.md`. STOP until written.

**S1 PRODUCT DECISIONS** — tab IA, contributionRate, momentum algorithm, visibility default. Document in `docs/squad/SQUAD_ARCHITECTURE.md`. STOP.

**S2 DOMAIN + ENGINE + TESTS** — module, models, store, idempotency, tests. STOP until `:squad:test` (or equivalent) PASS.

**S3 XP BRIDGE WITH ASCEND** — one event, two awards, no double. Tests. STOP.

**S4 MOMENTUM + LEVEL + AURA** — tests + snapshot. STOP.

**S5 MISSIONS + STREAKS + BADGES + SEASONS** — tests. STOP.

**S6 PRIVACY + LIVE + MAP** — visibility matrix tests. STOP.

**S7 SIGNAL + BOOST + NOTIFICATIONS** — idempotent boosts, prefs. STOP.

**S8 ATHLETE UI** — hub, cockpit, create/join. Token-only Compose. STOP.

**S9 POST-WORKOUT + HOME INTEGRATION** — individual + squad contribution. STOP.

**S10 COACH COMMAND** — no Big Brother. STOP.

**S11 WEAR** — compact; if pairing UNVERIFIED, document it; never fake PASS.

**S12 WEB / LANDING / COCKPIT / DASHBOARDS** — same language; fix Level drift. STOP.

**S13 REALTIME LOCAL BUS** — emulator live updates without cloud. STOP.

**S14 MOTION / A11Y / I18N** — reduced motion. STOP.

**S15 OFFLINE** — queue; no lost contribution. STOP.

**S16 ECOSYSTEM CONSISTENCY AUDIT** — mandatory failures to hunt (see §20). Fix each. STOP.

**S17 EMULATOR E2E** — athlete + coach + map + live + boost + mission + persistence. Screenshots under `qa/reports/squad/`. STOP.

**S18 EXIT GATE** — `docs/squad/SQUAD_EXIT_GATE.md` + `SQUAD_COMPLETION_REPORT.md` with a FEATURE / STATUS / EVIDENCE / NOTES table. Real evidence only.

---

## 20. FULL ECOSYSTEM AUDIT (S16) — FIND AND FIX

You must actively search for and fix (examples — not exhaustive):

- Boost button exists but notification never fires (and prefs are on)
- Squad XP diverges from ASCEND individual rules
- Android Level 18 vs Web Level 17
- Athlete Elite OS vs Coach Command looking like another product
- Level-up / aura animation janks the emulator
- Map ignores visibility
- Community tab and Squads show contradictory membership
- Watch shows live HR when visibility is ACTIVITY_ONLY
- Energy copy says “you burned” / “you earned food”
- Guilt copy on streaks
- Duplicate event IDs across phone/watch/squad
- Discover / Programs / Booking / Sessions ignore squad context where a light link should exist (e.g. “assigned by VELOCITY coach”) without turning every screen into squad spam
- Landing page “community” copy still sounds like a generic forum while the app is Squad OS
- Demo stats presented as production

If you find a break in the live chain:

TRAIN → ACTIVITY → PERSONAL XP → SQUAD XP → BADGES → MOMENTUM → LIVE → MAP → MISSION → SIGNAL → BOOST → COACH COMMAND

you FIX it before S17.

The user must not feel the architecture. They must feel the product is alive.

---

## 21. QUALITY BAR

Would this sit next to Apple Fitness, Strava clubs, WHOOP teams, F1 telemetry, Linear, Raycast — and still be unmistakably FitConnect?

If not, continue.

Emulator “wow” path (must be automatable locally):

Launch → init → Athlete → Prime Recovery → Train → Activity → Personal XP + Squad contribution → Home Momentum → Squads hub → VELOCITY cockpit → Live → Map (shared only) → Mission → Signal → Boost → Season chip → Coach Command (Tomás) → back. No crash. State persists. Overlays dismiss. Reduced motion still coherent.

---

## 22. DOCUMENTATION TO PRODUCE

```
docs/squad/
  SQUAD_ARCHITECTURE_AUDIT.md
  SQUAD_ARCHITECTURE.md
  SQUAD_DOMAIN_MODEL.md
  SQUAD_XP_AND_MOMENTUM.md
  SQUAD_PRIVACY.md
  SQUAD_MISSIONS.md
  SQUAD_LIVE_AND_MAP.md
  SQUAD_SIGNAL_AND_BOOST.md
  SQUAD_SEASONS.md
  SQUAD_LOCAL_DEMO.md
  SQUAD_TEST_PLAN.md
  SQUAD_ECOSYSTEM_ALIGNMENT.md
  SQUAD_COMPLETION_REPORT.md
  SQUAD_EXIT_GATE.md
```

---

## 23. EXIT GATE (do not rubber-stamp)

`ENGINEERING_COMPLETE = PASS` only if ALL of the following are true with evidence:

- BUILD PASS
- UNIT TESTS PASS (domain + bridge + privacy matrix)
- EMULATOR athlete critical path PASS (screenshots)
- LOCAL realtime PASS or honestly UNVERIFIED
- Visual QA PASS (tokens, no third palette)
- Navigation PASS (back, overlays, tabs)
- State persistence PASS (or documented in-memory + seed with test)
- Offline contribution PASS
- Cross-role athlete/coach PASS or NOT_RUN called out without faking
- Cross-surface Android/Web names+levels aligned or gap documented as BLOCKED
- Watch: PASS or IMPLEMENTED/UNVERIFIED — never fake pairing
- Accessibility PARTIAL is allowed only if TalkBack labels exist and you say TalkBack was not fully exercised
- PRODUCTION_AUTH / FCM / TEST_LAB / SIGNING / PLAY = PENDING_HUMAN or LOCKED

If any critical E2E step fails, ENGINEERING_COMPLETE = FAIL.

---

## 24. GIT

Do not push unless the user explicitly asked in that chat.
Do not commit unless the user explicitly asked.
No secrets, no APKs, no credentials.

---

## 25. START

START NOW.

First: S0 full repository audit.
Then S1 decisions.
Then implement gates in order.

Do not skip the audit.
Do not ask for confirmation.

                    FITCONNECT // SQUAD OS™
                    ONE ATHLETE CAN TRAIN.
                    A SQUAD CAN TRANSFORM.

```
END_MEGA_PROMPT
```
