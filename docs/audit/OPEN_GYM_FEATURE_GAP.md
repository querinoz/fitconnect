# Open Gym Feature Gap (audit 2026-09-02)

Reference: public openGym capabilities (AGPL â€” **ideas only**, no code copied).
Canonical product matrix: [`docs/product/open-gym-gap-analysis/FINAL_FEATURE_MATRIX.md`](../product/open-gym-gap-analysis/FINAL_FEATURE_MATRIX.md)

**Rule:** schema or engine file â‰  FULL product capability.

| ID | Feature | Reference | FitConnect | STATUS | Value | Priority | Dependencies |
|----|---------|-----------|------------|--------|-------|----------|--------------|
| D | Guided workout | Full session UI | Spec + `strength_sessions` only | **MISSING** | Transforms dashboard â†’ training tool | **P0/P1** | 017 apply, session FSM, Athlete UI |
| H | Progression engine | Linear / GSLP / double / time | TS+Kotlin engine + tests | **PARTIAL** | Feeds performance â†’ ASCEND | **P1** | Wire to guided UI |
| I | Progression explain | â€œWhy this targetâ€ | `rationale` string in engine | **PARTIAL** | Trust | **P1** | PREP screen |
| F | Supersets | Pair rest | `superset_group_id` column | **PARTIAL** | Execution quality | **P1** | Guided UI |
| G | Timed sets | Work/rest timers | Columns only | **PARTIAL** | Plank/carry | **P1** | Guided UI |
| Q | Exercise library | Search/filter/media | Small seed + `exercises` table | **PARTIAL** | Athlete + Coach | **P1** | Catalog, lazy media |
| â€” | Offline workout | Local log | Queue docs; no Room | **MISSING** | Gym connectivity | **P1** | DurableSyncQueue + 017 |
| â€” | Idempotent completion | One XP | `ascend_events` PK; not wired to strength finish | **PARTIAL** | No duplicate XP | **P1** | `activity.completed` |
| O | Estimated 1RM | Per-exercise | Estimator only; insights charts DEMO | **PARTIAL** | Analysis | **P2** | Analysis UI |
| P | RPE/RIR | Per-set | Post-workout modal; set columns untracked | **PARTIAL** | Coach feedback | **P2** | Set logging |
| X | Muscle map | Front/back volume | Spec only | **MISSING** | Analysis visual | **P2** | MuscleLoadEngine + original assets |
| W | Training heatmap | Year duration | Other heatmaps exist | **MISSING** | Journey/ASCEND | **P2** | Activities history |
| U/V | Import/Export | FitNotes/Strong/Hevy | Spec only | **MISSING** | Migration friction | **P2** | Pipeline + merge |
| R | Equipment filter | Composable chips | Field on model | **PARTIAL** | Discover/builder | **P2** | Library UI |
| S | Custom exercises | Full parity | `is_custom` RLS | **PARTIAL** | Flexibility | **P2** | Create UI |
| Y | Rest notifications | Native | FCM exists; REST_TIMER missing | **MISSING** | Real training | **P2** | FCM + prefs |
| B | Weekly plan | Routines | Demo plan-builder + 017 tables | **PARTIAL** | Coach | **P1** | Postgres wire |
| C | Reschedule occurrence | Not mutate template | `workout_occurrences` | **STUB** | Plan vs execution | **P1** | Occurrence API |
| A | Body weight | Chart + goal | Demo kg + 017 table | **PARTIAL** | Profile/readiness | **P2** | Chart UI |
| E | Keep screen awake | During workout | No FLAG_KEEP_SCREEN_ON | **MISSING** | Execution | **P1** | Guided UI |
| J/K/L/M | Fail/stall/BW/per-side | Engine rules | Engine tests PASS | **PARTIAL** | Integrity | **P1** | UI |
| N | Cardio in strength | Duration/speed | Endurance DEMO; schema modes | **PARTIAL** | Hybrid sessions | **P2** | Telemetry link |
| T | Plan share | JSON no health | Realtime diffs only | **MISSING** | Coach/social | **P3** | Export spec |
| Z | Passkeys | Self-hosted WebAuthn | Not FitConnect auth | **NOT_RELEVANT** | Extra method later | â€” | P1-AUTH |
| AB | Theming | Light/dark/accent | Voltline Elite OS | **FULL** (own system) | Brand | â€” | Do not copy OG colors |
| AD | Guest | Standalone APK | LOCAL_DEMO / guest screens | **PARTIAL** | Onboarding | **P3** | Separate GUEST vs REAL |
| AE | No telemetry | Product principle | Incompatible | **REJECTED** | Observability | â€” | Consent analytics |
| AA | Admin | User mgmt | Partial admin routes | **PARTIAL** | Ops | **P3** | Server authz |
| AC | i18n | Full | 6 langs; dashboards incomplete | **PARTIAL** | Market | **P3** | Copy pass |

### Counts (honest)

| STATUS | Count (approx) |
|--------|----------------|
| FULL | 1 (theming â€” FitConnectâ€™s own) |
| PARTIAL | 16 |
| MISSING | 8 |
| STUB | 1 |
| REJECTED | 1 |
| NOT_RELEVANT | 1 |

**Do not implement from this audit.** Highest product-value missing item: **Guided Workout (D)** after identity/data freeze.
