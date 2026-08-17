# FitConnect — Social Product Audit

**Date:** 2026-08-17  
**Rule:** Every claim is from repository inspection. Named files ≠ shipped features.  
**Floor color:** `#070B14` (Elite Surface). Prompt `#090402` is **rejected** — would fork landing ↔ Android.

---

## EXISTING (verified implementation)

### Android — real engines (in-process, LOCAL_DEMO)

| System | Path | What actually runs |
| ------ | ---- | ------------------ |
| Community domain | `android/community` | Posts, comments (nested), reactions, feed ranker, groups, moderation, rate limits, media metadata, visibility |
| Social graph | `SocialGraph.kt` | Follow, connection, coach-athlete, team member, block, mute — **in-memory** |
| Feed | `FeedEngine.kt` | PERSONAL / FOLLOWING / COACH / GROUP / SPORT / OFFICIAL + ChronoEngagementRanker |
| Privacy | `VisibilityResolver.kt` | PUBLIC/FOLLOWERS/CONNECTIONS/GROUP/COACH_ONLY/PRIVATE; **telemetry facts redacted unless `shareTelemetryFacts`** |
| ASCEND | `android/ascend` | XP, 15 levels, achievements + rarity, streaks, missions, anti-abuse (impossible speed/distance), squad **challenge contribution** |
| Athlete UI | `:athlete` | Home cockpit, Discover marketplace, Activity capture, Community composer + reactions, Profile **player card + settings** |
| Workout → XP | `ActivityScreen` + `ActivityAscendBridge` | Process event → `PerformanceCompleteOverlay` + `EliteShareCard` |
| Coach | `:coach` Overview | Command KPIs + LIVE SQUAD (honest Wear pairing) + ASCEND squad km |
| Wear | `:wear` | Time/HR/pace/readiness panes — not a shrunk phone |
| Notifications | `CommunityNotifier` + FCM helper | Local burst cap; FCM **PENDING_HUMAN** |

### Web — real product, different social depth

| Surface | Reality |
| ------- | ------- |
| Landing | Elite OS cinematic, Volt, LOCAL DEMO labeled |
| Athlete/Coach dashboards | Coaching SaaS, not a social OS |
| Profile | `AthleteProfilePlaceholderPage` + form + Stitch panel — **not a player card** |
| Gamification | Zustand `lib/gamification` — **periodic-table levels**, **not ASCEND** |
| Community | No web feed consuming `:community` |
| tRPC | Auth required; roster/sessions return **empty arrays** |

### Database

| Store | Social tables | Notes |
| ----- | ------------- | ----- |
| Prisma | User, Athlete, Coach, Session, Message (preview), wearables, readiness | **No** posts, squads, XP, follows |
| Supabase `007_community.sql` | `community_posts`, `post_reactions` (emoji) | RLS **enabled**, **no policies** in that file → deny-all in Postgres RLS |
| Supabase `009_notifications.sql` | `notifications`, `push_tokens` | RLS on, **no policies** in file |
| Dual schema | Prisma vs 10 SQL migrations | Ununified (known P1) |

### Tests

- `:community` `CommunityContainerTest` (feed seed)
- `:ascend` `AscendEngineTest` (XP, streaks, anti-abuse)
- Web gamification tests exist separately
- No E2E for social graph persistence (there is none)

---

## MISSING (verified absence)

- Profile 2.0 **web** player card, banner, pinned posts, customization
- Hover / long-press mini performance card (web + Android sheet)
- CREATE hub as a sheet (composer kinds exist; no FAB/sheet yet; no PHOTO/VIDEO pipeline)
- Stories / Moments (24h)
- Reels / Motion with performance overlay
- Friends activity layer
- Repost with attribution
- 1:1 / squad / coach chat (Prisma `Message` is inbox preview, not a messenger)
- Squad OS (identity, live board, squad XP economy) — only `squad-fc-week` km contribution
- Leaderboards with consistency/recovery/teamwork categories in UI
- Emotional check-in (“how are you feeling?”)
- Performance story timeline / memories
- AI social coach prompts (AI exists as athlete/coach chat, not social graph observer)
- Notification preferences + quiet mode
- Close friends / restrict
- Persistent social DB + realtime
- Web community / squads / profile identity
- Unified XP across web and Android

---

## BROKEN / STUB

| Item | Evidence |
| ---- | -------- |
| Squads as product | Home/Coach cards labeled `LOCAL_DEMO`; no Squad destination |
| Community UI | Composer + Like/Fire only; engines for groups/follow/visibility unused in UI |
| tRPC roster/sessions | Empty lists |
| Dual XP | Web Zustand vs Android ASCEND — different curves |
| Dual achievements | `:community` AchievementEngine **and** `:ascend` AchievementRegistry |
| Community tab vs Squads | Prompt-level conflict; current tab is Community feed |

---

## DUPLICATED

- XP/levels: `apps/web/lib/gamification` vs `android/ascend`
- Achievements: community rules vs ASCEND registry
- Messages: Prisma Message vs coach inbox vs `CommunityNotifier`
- Community SQL (emoji reactions) vs Kotlin `ReactionType` enum
- Squad language in landing/pricing vs no Squad OS

---

## LEGACY

- `ui-glass/` (~47 web imports)
- `--volt-*` aliases
- Expo `apps/mobile` frozen Path A
- `docs/squad/SQUAD_OS_MEGA_PROMPT.md` (spec, not code)
- Web profile page still named `AthleteProfilePlaceholderPage`

---

## UNUSED / UNDERUSED

- `FeedKind.PERSONAL`, groups, challenges, programs in Community UI
- `ProfileDirectory.search`
- Comment replies in UI (engine supports nesting)
- Reaction types beyond LIKE/FIRE
- `VisibilityResolver` not exposed in composer

---

## INCONSISTENT

- Landing readiness 87% vs Android Prime 59% (both LOCAL_DEMO — honest labels, unsynced numbers)
- Nav: Android Home/Discover/Activity/Community/Profile vs web Today/Sessions/Coach/Inbox/Profile
- Floor prompt `#090402` vs token `#070B14`

---

## SECURITY RISK

- In-memory social graph: gone on process death; not multi-device
- Supabase community/notifications RLS with **no policies** = locked or unusable, not a social network
- Health data: Android redact is correct; web dashboards still show demo biometrics
- Location: coach live squad already requires `coachMayRead(LOCATION)` — keep
- Do not invent production keys

---

## UX ISSUE

- Profile reads as settings, not identity
- Community is a form, not a performance story
- No CREATE path from a finished run except Share card on Activity
- Home squad is a contribution readout, not belonging

---

## ARCHITECTURE ISSUE

- Three “sources of truth”: Prisma, Supabase SQL, Android in-memory
- Social OS cannot ship on in-memory engines alone
- ASCEND must remain **individual** XP; Squad XP = contribution slice, not a second calculator

---

## Classification (honest)

| Layer | Status |
| ----- | ------ |
| Social OS | **ENGINEERING_PARTIAL** — domain engines, almost no product surface |
| Gamification | **ENGINE_EXISTS** (ASCEND) / **FORKED** (web) |
| Squads | **STUB** |
| Profile identity | **PARTIAL** — Android player card + unlockable titles; web still placeholder |
| Feed product | **THIN UI on real engine** |
| Production social | **NOT READY** |
