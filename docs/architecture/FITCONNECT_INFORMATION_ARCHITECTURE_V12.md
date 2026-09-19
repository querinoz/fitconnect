# FitConnect Information Architecture V12

**Status:** Canonical product IA  
**Branch tip at authoring:** `b74e3b0` → IA polish commits  
**Primary nav (FROZEN):** Feed · Ascend · TRAIN · Dashboard · Profile  
**Rule:** **CONTEXTUAL LINKS ≠ AGGLUTINATION** — each domain owns its home; cross-domain surfaces expose snapshots + CTAs only.

---

## 1. Research synthesis (IA only)

| Source | Lesson applied |
|--------|----------------|
| **Strava** | Social Home ≠ personal training tools. Record is a primary *action*, not a metrics dump. |
| **Garmin Connect** | Personal metrics live under a dashboard/you space; activities and maps are nested destinations. |
| **Nike Run Club** | Sport/activity start is focused; plans and history are separate stacks. |
| **Apple Fitness+** | Workout library ≠ live session ≠ rings overview. |
| **WHOOP** | Progressive disclosure: glance tiles → trend → deep dive. Tiles are doorways, not destinations. |
| **Oura** | Readiness/recovery own the “should I train?” answer; training execution is elsewhere. |
| **Cronometer** | Nutrition owns diary/targets/foods; training apps link in, they do not embed the full diary. |
| **Material 3 Expressive** | Flexible/floating bar + FAB; nested destinations via push routes / secondary sheets — never a 6th primary tab. |

Zenith reinterpretation: OLED `#070B14`, voltline `#C8FF00`, iris `#6C63FF`, telemetry `#3CD7FF`. No competitor assets or clones.

---

## 2. Domain ownership

| Domain | Owner surface | May show | Must NOT embed |
|--------|---------------|----------|----------------|
| **FEED** | Primary tab | Social posts, kudos, discovery CTAs | Metrics walls, nutrition diary, GPS editor |
| **ASCEND** | Primary tab | Readiness, recovery, load, ACWR, achievements, intelligence | Full meal diary, live GPS map editor, workout builder |
| **TRAIN** | FAB / `athlete/activity` | Active sport, today, plan *summary*, upcoming, progress, START | Full nutrition UI, full routes library, sport registry wall |
| **NUTRITION** | Secondary `athlete/nutrition` (+ web `/nutrition`) | Today / Targets / Meals / Foods / Recipes / Grocery | Live GPS, social feed, fight mode |
| **GPS / ROUTES** | Secondary `athlete/routes` (+ route detail) | Route list, map, OPEN ROUTE | Nutrition diary, plan catalog wall |
| **DASHBOARD** | Primary tab | Command-center snapshots → owners | Foreign full UIs |
| **PROFILE** | Primary tab | Identity, devices, settings, prefs | Nutrition data tables, training plan catalog |

Cross-domain CTAs are one-line snapshots + button (e.g. TRAIN → “Fuel ESTIMATE … · OPEN NUTRITION”).

---

## 3. PRIMARY navigation (frozen)

```
Feed ── Ascend ── [TRAIN FAB] ── Dashboard ── Profile
```

- Exactly four bottom destinations + center Train action.
- Train is **not** a fifth tab (`AthleteDest.ACTIVITY.bottom = false`).

---

## 4. SECONDARY navigation / nested routes

### TRAIN stack
| Route | Purpose |
|-------|---------|
| `athlete/activity` | Training hub (decluttered) |
| `athlete/sport-selector` | L1 groups → L2 sports + search → confirm Active Training Sport |
| `athlete/train-plan` | Dedicated plan overview / guided catalog entry |
| `athlete/training` | Sessions list |
| `athlete/training/{id}` | Session detail |
| `athlete/workout` | Guided strength execution |
| `athlete/fight` | Combat mode |
| `athlete/activity/route/{id}` | Single activity route detail (during/after session) |

### NUTRITION stack
| Route / subsurface | Purpose |
|--------------------|---------|
| `athlete/nutrition` | Host with subsurface switcher |
| Today | Diary snapshot for day |
| Targets | ESTIMATE macros (sport-aware) |
| Meals | Meal plan week |
| Foods | Search + confirm-to-log |
| Recipes | Recipe surface (web parity; Android links when API present) |
| Grocery | Grocery from meal plan |

Web: `/nutrition`, `/nutrition/meals`, `/nutrition/recipes`, `/nutrition/grocery`.

### GPS / ROUTES stack
| Route | Purpose |
|-------|---------|
| `athlete/routes` | Dedicated routes hub |
| `athlete/activity/route/{id}` | Open route / trace |

TRAIN shows route **snapshot** → `OPEN ROUTE` / `OPEN ROUTES` only when `gpsSupported` for Active Training Sport.

---

## 5. Sport selector

1. **Level 1** — sport **groups** from FitConnect registry categories (`SportCategory`: ENDURANCE, STRENGTH, TEAM, …) — not a Strava type dump.
2. **Level 2** — sports in group + search (`SportsRegistry.discover`).
3. **Confirm** → persist Active Training Sport via `sportsIdentity.putIdentity`.
4. Propagate context: TRAIN today/plan metrics, nutrition targets sport wire id, GPS visibility via capabilities.
5. Recent/favorites only when real usage exists (no fabricated lists).
6. **Capabilities:** `gpsSupported` ⇔ `WearableCapability.GPS` in definition. No fake GPS chrome for strength/indoor-only sports.

---

## 6. TRAIN hub content (allowed)

1. Active Training Sport summary + CHANGE  
2. Today session card → START  
3. Plan summary (phase / next block) → OPEN PLAN  
4. Upcoming / progress (honest empty if none)  
5. Session adaptation confirm-only strip (WHAT/WHY/DATA/CONFIDENCE)  
6. Nutrition CTA snapshot  
7. GPS/Routes CTA if `gpsSupported`  
8. Free / guided / fight starts (capability-aware)

---

## 7. State / data

| Concern | Source of truth |
|---------|-----------------|
| Active Training Sport | `sportsIdentity` API + local session fallback |
| Sport definitions | `DefaultSportsCatalog` / `SportsRegistry` (Android); `SPORT_REGISTRY` (web) |
| Today session | `trainingToday` remote |
| Plan catalog | `GuidedPlanCatalog` / web train catalog |
| Nutrition targets/logs | nutrition remotes / `/api/v1/nutrition/*` |
| GPS traces | `GpsRouteStore` + map phases |
| Provenance | MANUAL ≠ REAL; no fabricated biometrics |

Security invariants (V12) unchanged: device isolation, coach consent, private events, MCP `strainScore`, device POST ACL.

---

## 8. Web ↔ Android parity

| Concept | Android | Web |
|---------|---------|-----|
| Feed | `athlete/feed` | `/feed` |
| Ascend | `athlete/ascend` | `/achievements` (+ recovery insights) |
| Train | `athlete/activity` | `/train` |
| Dashboard | `athlete/dashboard` | `/dashboard` |
| Profile | `athlete/profile` | `/profile` |
| Nutrition | `athlete/nutrition` | `/nutrition*` |
| Routes | `athlete/routes` | `/map` |
| Sport selector | `athlete/sport-selector` | Train sport group picker (registry groups) |

---

## 9. Anti-patterns (forbidden)

- Mega-scroll hub embedding nutrition diary + full plan catalog + GPS editor + all sports chips  
- Fake GPS map for non-GPS sports  
- Fifth primary tab for Nutrition or Routes  
- Demo/mock biometric filler in product UX  
- Parallel sport registries outside FitConnect catalog  
