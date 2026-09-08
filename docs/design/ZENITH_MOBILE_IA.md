# FitConnect Zenith — Mobile Information Architecture (DEFINITIVE)

**Principle:** SOCIAL FIRST → PROGRESS → TRAIN → PERFORMANCE → IDENTITY  
**Product:** Social Performance Network (Feed core + Map/Spots + Music metadata + Distribution)

> Do **not** turn Feed into a metrics dashboard. Metrics appear as context inside posts/activity; analytical depth lives in Dashboard.
> Strava = personal sync only — never social. Spotify = metadata/link only — never audio copy.
> Zapier = automation/distribution orchestrator — never the database.

See also: `docs/integrations/platform-capabilities.md`

## Bottom navigation (canonical)

```text
Feed · Ascend · [TRAIN] · Dashboard · Profile
```

| Area | Answers |
|------|---------|
| **Feed** | What is happening? |
| **Ascend** | How am I progressing? |
| **Train** | What am I doing right now? (central FAB — stronger than tabs) |
| **Dashboard** | How am I performing? |
| **Profile** | Who am I and what am I connected to? |

Secondary destinations never occupy the bottom bar.

## Feed side bar (Instagram-style)

**Primary open gesture:** horizontal swipe from the **in-app left edge zone** (~28dp), not the OS gesture-nav edge (which is Android Back).

Also:

- drag drawer closed / swipe back
- tap backdrop to dismiss
- Android Back dismisses when open
- soft animation + scrim (blocks touch-through)
- safe areas, a11y
- **no permanent hamburger** occupying chrome
- thin start-edge control (`feed_menu_open`) for TalkBack / Maestro / tap-to-open
- does not become a second bottom bar
- does not fight bottom navigation

### Side bar structure

```text
PROFILE / IDENTITY
  Profile

DISCOVER
  Find a Coach
  Find a Specialist
  Sports
  Programs
  Nearby

SOCIAL
  Community
  Following
  Saved
  Notifications

PERFORMANCE
  Training History
  Achievements
  Records
  Goals

OTHER
  Help
```

**Settings** are not a side-bar primary. Path:

```text
Profile → Connections → Settings
```

**Connections** hold Wear OS, Spotify, social accounts, devices.

## Routes (Android)

- Athlete start: `athlete/feed`
- Coach start: `coach/feed`
- Same five concepts for Coach (role-aware content)

## Verification anchors

- `athlete_feed`, `athlete_tab_feed|ascend|dashboard|profile`
- `feed_side_sheet`, `feed_menu_open` (a11y/edge), `feed_menu_find_coach`
- `athlete_train_fab`
- `profile_connections`
- Maestro: swipe from left edge **or** tap `feed_menu_open` / “Open discovery menu”
