# FitConnect — Glass Redesign & Coach × Athlete Live Loop

**Date:** 2026-05-17
**Status:** Design — awaiting user review
**Scope:** Authenticated app only (`/dashboard`, `/coach/dashboard`, `/coach/athletes/[id]`, `/signin`, `/signup`) + new mobile shell + PWA wrapper

## 1 — Goal

Turn the existing FitConnect mock into a **PWA-installable**, **glass-aesthetic** mobile-first product whose authenticated experience feels like a real fitness app and whose **coach × athlete loop is the headline feature**. Inspirations: [Sportly Fittech UI Kit](https://ui8.net/dhuhacreative/products/sportly---fittech-app-ui-kit) and [Fitness Healthcare Mobile App](https://www.behance.net/gallery/178304479).

Success looks like:

- A user opens `https://<host>/dashboard` on iOS Safari or Android Chrome, taps "Add to Home Screen", and the app launches full-screen with no browser chrome.
- A coach and an athlete on two devices (or two tabs) can drive the **morning handshake**, **live session**, **celebration**, and **AI co-pilot** loops end-to-end on the same demo data.
- A user can switch the global accent through 5 theme presets and the change is instant and persists.
- Lighthouse mobile score ≥ 90 across Performance / Accessibility / Best Practices / PWA.

Out of scope for v1: form-check video annotation, group/class mode, real Supabase backend (kept behind interface), real wearable APIs (HealthKit / Health Connect — Capacitor-only).

## 2 — Architecture

### 2.1 Stack and packaging

- Stay on Next.js 14 App Router (current codebase).
- Add **`@ducanh2912/next-pwa`** (Next 14-compatible fork of `next-pwa`, pinned to ^10) for service worker, manifest, offline shell, install prompt.
- Manifest: standalone display, dark theme, lime-green theme color (`#C7FB3A`), 5 maskable icon sizes, iOS apple-touch-icon, Android adaptive icon.
- Service worker strategy: stale-while-revalidate for `/dashboard`, `/coach/*`, network-first for `/api/*` (when added).
- iOS PWA quirks: `viewport-fit=cover`, safe-area insets, `apple-mobile-web-app-capable`.

### 2.2 Real-time abstraction (Hybrid · Q7-C)

A single hook is the only thing the UI calls:

```ts
// lib/realtime/use-channel.ts
export function useChannel<T>(channelId: string): {
  send: (msg: T) => void;
  messages: T[];
  presence: Record<string, "online" | "offline">;
};
```

Two implementations behind a `RealtimeProvider`:

- **`local`** (default) — `BroadcastChannel` API for cross-tab on the same origin. Adequate for demo on one laptop. Falls back to `localStorage` events on Safari < 18.
- **`supabase`** (flag `NEXT_PUBLIC_REALTIME=supabase`) — Supabase Realtime channels. Wires into the same hook signature. Not implemented in v1; the hook contract just lives behind the same interface so the swap is trivial later.

Channels we use:

- `roster:{coachId}` — coach broadcasts plan updates; athletes listen.
- `athlete:{athleteId}` — bi-directional (live HR ticks, nudges).
- `celebration:{athleteId}` — PR detections + reactions.

Synthetic data ticker (`lib/realtime/synthetic.ts`) emits HRV / pace / cadence ticks for demo athletes during simulated sessions.

### 2.3 State

Existing `lib/dashboard-store.ts` (Zustand) stays as the source of truth. Three additions:

- `liveSessions: Record<athleteId, LiveSession>` — current in-progress session metrics.
- `reactions: Record<eventId, Reaction[]>` — celebration reactions.
- `aiAlerts: AICoPilotAlert[]` — coach-side anomaly detection results.

Persistence: same `fitconnect-dashboard` localStorage key. Real-time messages mutate the store via reducers in `lib/realtime/handlers.ts`.

## 3 — Design system: "Voltline"

### 3.1 Tokens (CSS variables on `:root`)

```
--ink-950  #07080A   --ink-900  #0E0F12   --ink-800  #15171B
--ink-700  #21242A   --ink-600  #2E323A   --ink-500  #5B606B
--ink-400  #8A8F99   --ink-300  #BFC3CC   --ink-100  #F2F3F6
--ink-50   #FAFBFC

--volt-300 #E9FFB5   --volt-400 #DAFE7E   --volt-500 #C7FB3A
--volt-600 #9CD81A   --volt-glow rgba(199,251,58,.45)

--jade-500  #2DD4BF   --amber-400 #F5B844   --coral-500 #FF5470

--glass-lo     rgba(255,255,255,.03)
--glass-md     rgba(255,255,255,.06)
--glass-hi     rgba(255,255,255,.10)
--glass-volt   rgba(199,251,58,.06)
--glass-border rgba(255,255,255,.08)
--glass-edge   rgba(199,251,58,.30)

--grad-pulse linear-gradient(135deg,#DAFE7E,#C7FB3A,#9CD81A)
--grad-text  linear-gradient(135deg,#FAFBFC,#DAFE7E 60%,#C7FB3A)
```

### 3.2 Component primitives

- `<GlassCard tone="default|active|live">` — backdrop-blur card, optional active/live edge glow.
- `<VoltButton>` — primary CTA, lime fill, `box-shadow: 0 8px 22px var(--volt-glow)`.
- `<ReadinessRing>` — conic gradient ring, configurable percent + label.
- `<HRRibbon>` — animated bar columns for live HR pulse.
- `<SparkLine>` — 7-point sparkline using `--grad-pulse`.
- `<Pill variant="volt|live|amber|coral">` — standard 9px uppercase pill.

### 3.3 Theme system

Five presets all use Voltline structure; only the `--volt-*` vars and `--volt-glow` differ.

```ts
// lib/theme/themes.ts
export type ThemeId = "voltline" | "pulse" | "tide" | "solar" | "aurora";
export const THEMES: Record<ThemeId, ThemeTokens> = { ... };
```

- `<ThemeProvider>` wraps the app, reads `localStorage["fitconnect.theme"]`, sets `document.documentElement.style` CSS vars.
- `<ThemePicker variant="dock"|"settings">` — 5-dot picker for the dashboard top bar; full preview cards for Settings → Appearance.
- **"Match my coach"** — when athlete is linked to a coach with a non-default theme, settings exposes a one-click "Match Marina's theme" toggle. Stored as `fitconnect.theme.matchCoach: boolean`. When enabled, the athlete's theme follows the coach's theme reactively.

## 4 — Mobile shell

### 4.1 Layout

```
┌─────────────────────┐
│   Top bar           │  greeting · avatar · 5-dot theme picker
├─────────────────────┤
│                     │
│   Scroll content    │  page content, edge-to-edge with safe-area
│                     │
├─────────────────────┤
│  ┌────────────────┐ │  floating glass dock, 14px from bottom edge
│  │ ⌂ ⌚ ★ ✉ ☰ │ │  active = filled lime tile + glow bar above
│  └────────────────┘ │
└─────────────────────┘
```

- `components/shell/mobile-shell.tsx` — owns top bar, content slot, dock.
- 5 dock items: Today, Sessions, Coach (athlete) / Roster (coach), Inbox, Profile.
- Active state on the dock: tile fills with lime gradient, 24×3 glow bar appears above; non-active items are `--ink-400` outlined icons.
- `safe-area-inset-bottom` accounted for; on iPad / desktop the dock disappears and a left rail takes over.

### 4.2 Transitions

- Default: cross-fade 160ms (`AnimatePresence` + `motion.div initial/animate/exit opacity`).
- Key transitions use Framer Motion `layoutId` for shared-element morph (320ms, `ease: [0.16, 1, 0.3, 1]`):
  - Roster athlete card → athlete detail page (coach side)
  - Today's session card → live session view (athlete side)
  - Plan-update card → plan detail
- Reduced-motion: respects `prefers-reduced-motion`, falls back to instant change.

## 5 — Coach × Athlete loops (the headline)

### 5.1 Loop A — Morning readiness handshake

**Flow:**

1. Synthetic ticker (or wearable, later) writes overnight HRV / sleep / RHR into the athlete's `metrics` record at app load between 04:00–10:00 local time.
2. Athlete dashboard shows the readiness card prominently with conic ring + delta vs 7-day baseline.
3. Coach dashboard shows the **roster heat-map**: a grid of colored cells, one per athlete, green/amber/red based on readiness score and HRV delta. Sortable, tappable.
4. Coach taps any cell → opens the athlete's plan for today. One-tap edit chips: "Lighter day", "Swap to Z2", "Add recovery". Each chip is a pre-built diff template.
5. Coach's diff is broadcast on `roster:{coachId}` and `athlete:{athleteId}`. Athlete sees a banner: "Marina updated today's plan — view changes". Tap to apply (or "Keep current").

**Failure modes:** No wearable data → shows "No data yet — log feel" with a 5-emoji tap selector that synthesizes a readiness score.

### 5.2 Loop B — Live training companion

**Flow:**

1. Athlete taps the today's-session card → shared-element morphs into live session view.
2. "Start" button kicks the synthetic ticker (or, with Capacitor, listens to wearable). HR / pace / cadence stream every 1-2s.
3. Coach dashboard surfaces an in-progress card: "Inês is in Z2 base, 23 min in. Watching live?" Coach taps in.
4. Coach view shows the same metrics + 3 nudge buttons: ↓ Slow down · ↑ Push · ★ Great work.
5. Tapping a nudge plays a soft notification on the athlete's screen with `navigator.vibrate(80)` for haptic.
6. End of session → auto-summary card pops up with PR detection and writes to celebration channel.

**Failure modes:** No live coach connected → nudges are queued for inbox; no HR data → keep timer + RPE input.

### 5.3 Loop D — Celebrations & streaks

**Flow:**

1. PR auto-detection runs on session end (`detectPRs(session, history)` → returns `Achievement[]`).
2. Achievement triggers a celebration animation: full-screen burst, lime + coral gradient, the achievement number scaled and gradient-text. ~2s.
3. Coach gets a celebration card in their inbox with one-tap reactions (🔥 ⚡ 💪 👏 🚀). Reactions are broadcast back; athlete sees "Marina reacted with 🔥" within seconds.
4. Streaks (`streak:{athleteId}`) tick on consecutive training days; coach × athlete shared streak ("training together · day 47") shown on both dashboards.

### 5.4 Loop E — AI co-pilot for coach

**Flow:**

1. On coach dashboard mount and on every roster metrics update, run `evaluateRoster(athletes, history)` returning `AICoPilotAlert[]`.
2. Rules (v1, deterministic):
   - HRV down ≥ 15% over 3+ days → suggest plan swap (intervals → Z2).
   - Sleep avg < 6h × 3 days → suggest recovery day.
   - 3 missed sessions → flag retention risk.
3. Each alert appears as a glass card with 2 buttons: "Approve plan swap" and "Open athlete".
4. When approved, a plan-update is broadcast (Loop A path) with attribution "Marina (with co-pilot)".

## 6 — Pages affected

| Path | Change |
|---|---|
| `/dashboard` (athlete) | Full rebuild on mobile shell. Hero readiness card, coach update card, today's session card, recent celebrations, streak. Theme picker in top bar. |
| `/coach/dashboard` | Full rebuild. Roster heat-map, AI co-pilot alerts feed, today's calendar, recent celebrations, revenue strip. |
| `/coach/athletes/[id]` | Full rebuild. Athlete detail with shared-element header, plan editor with quick-diff chips, live session widget, message thread. |
| `/signin` | Re-skin to Voltline. **Existing behavior preserved**: already-signed-in banner (no auto-redirect), demo accounts unchanged, `?demo=coach` query param triggers auto-fill + auto-submit for the demo flow. |
| `/signup` | Re-skin to Voltline. Form behavior unchanged. |
| `/settings/appearance` (NEW) | Theme picker preview cards + "Match my coach" toggle. |

Marketing pages (`/`, `/discover`, `/programs`, `/community`, `/methodology`, `/pricing`, `/trainer`) are **untouched** in v1.

## 7 — File layout (new + changed)

```
app/
  (app)/                          # NEW route group with mobile shell layout
    layout.tsx                    # mobile shell + theme provider
    dashboard/page.tsx            # rewritten
    coach/dashboard/page.tsx      # rewritten
    coach/athletes/[id]/page.tsx  # rewritten
    settings/appearance/page.tsx  # NEW
  signin/page.tsx                 # re-skinned
  signup/page.tsx                 # re-skinned
  manifest.ts                     # NEW · web manifest
  apple-icon.tsx                  # NEW · iOS icon
  icon.tsx                        # already exists, refresh

components/
  shell/
    mobile-shell.tsx              # NEW · top bar + dock + content slot
    floating-dock.tsx             # NEW
    theme-picker.tsx              # NEW
    install-prompt.tsx            # NEW
  ui-glass/                       # NEW design-system primitives
    glass-card.tsx
    volt-button.tsx
    readiness-ring.tsx
    hr-ribbon.tsx
    spark-line.tsx
    pill.tsx
    celebration-burst.tsx
  loops/                          # NEW coach × athlete loops
    morning-handshake/
      readiness-card.tsx
      roster-heatmap.tsx
      plan-update-banner.tsx
      quick-diff-chips.tsx
    live-session/
      session-card.tsx
      live-metrics.tsx
      nudge-bar.tsx
    celebrations/
      celebration-overlay.tsx
      reaction-row.tsx
      streak-card.tsx
    ai-copilot/
      alert-card.tsx
      alert-feed.tsx

lib/
  theme/
    themes.ts                     # 5 presets
    theme-provider.tsx
    use-theme.ts
  realtime/
    use-channel.ts                # the one hook
    local-channel.ts              # BroadcastChannel impl
    supabase-channel.ts           # stub
    handlers.ts                   # message → store mutation
    synthetic.ts                  # HRV / pace ticker for demo
  ai/
    rules.ts                      # evaluateRoster + detectPRs
  pwa/
    register-sw.ts
    install-prompt.tsx

public/
  icons/                          # NEW · maskable + apple-touch
  splash/                         # NEW · iOS splash screens

next.config.mjs                   # add next-pwa
tailwind.config.ts                # extend with Voltline tokens

tests/
  e2e/
    morning-handshake.spec.ts     # Playwright multi-context
    live-session.spec.ts
    celebrations.spec.ts
    theme-switching.spec.ts
  unit/
    ai-rules.test.ts
    pr-detection.test.ts
    realtime-channel.test.ts
```

## 8 — Testing

- **Unit (Vitest):** AI rules, PR detection, realtime handlers, theme reducer.
- **Component (Vitest + Testing Library):** `<ReadinessRing>`, `<RosterHeatmap>`, `<NudgeBar>`, `<ThemePicker>`.
- **E2E (Playwright, 2 browser contexts):** simulate coach + athlete on the same machine.
  - `morning-handshake.spec`: athlete loads → coach sees roster → coach taps cell → applies "Lighter day" → athlete sees banner → applies → plan changes.
  - `live-session.spec`: athlete starts session → coach watches → coach sends "Push" → athlete sees nudge.
  - `celebrations.spec`: athlete finishes session triggering PR → coach sees achievement → reacts 🔥 → athlete sees reaction.
  - `theme-switching.spec`: athlete switches to Pulse → CSS vars update → persists across reload → "Match my coach" makes athlete inherit Marina's theme.
- **Manual mobile:** test on at least one iPhone Safari and one Android Chrome before declaring done. Screen-record the install + offline launch.

TDD per the test-driven-development skill: every new function gets a failing test first.

## 9 — Performance & accessibility

- Lighthouse mobile budgets:
  - Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, PWA ≥ 95.
- All glass cards specify a non-blur fallback (solid `--ink-800` background) for browsers without `backdrop-filter`.
- Color-contrast check: lime on charcoal passes WCAG AA for large text. Coral and amber tested for the same surfaces.
- All interactive surfaces ≥ 44×44px tap target.
- Respect `prefers-reduced-motion`: disable shared-element morph, replace with cross-fade.
- All loops keyboard-navigable (focus rings in `--volt-500`).

## 10 — Rollout

- Single deploy. No feature flags in v1 (the hybrid realtime flag is set at build time).
- Demo accounts (existing): `Athlete / Athlete`, `Coach / Coach`, `Marina / Marina`, `Admin / Admin` continue to work.
- New **"Demo as coach"** button on the athlete dashboard (visible only when `?demo=1` or the user is the seeded `Athlete` account). Opens `/signin?demo=coach&next=/coach/dashboard` in a new window, which auto-fills `Coach / Coach` and submits — yielding a coach tab paired with the existing athlete tab. The two share state via `BroadcastChannel`.
- README documents:
  - Install on iOS (Safari → Share → Add to Home Screen)
  - Install on Android (Chrome → menu → Install app)
  - Two-tab demo path
  - How to swap to Supabase later

## 11 — Open questions / risks

- **Service worker + Next.js dev mode** — `@ducanh2912/next-pwa` is build-only. PWA features (install prompt, offline shell) only work on `next build && next start` or production deploys; `next dev` keeps the SW disabled. README will document this clearly.
- **iOS Safari `BroadcastChannel`** — supported since 15.4; older fallbacks via `localStorage` events.
- **`backdrop-filter` on Android Chrome < 76** — fallback to opaque `--ink-800`. We accept that some Android users see a non-glass UI.
- **Network of trust between two tabs** — no auth ties; either tab can broadcast as either role. Acceptable for demo, must be addressed when Supabase is wired.

## 12 — Definition of done

- [ ] All 5 affected pages render correctly on iPhone 13 Pro / Pixel 7 (or equivalent emulators).
- [ ] PWA installs cleanly on both, launches full-screen, works offline (cached shell).
- [ ] All 4 loops (A, B, D, E) demonstrable end-to-end with two browser tabs.
- [ ] All 5 theme presets render correctly; "Match my coach" works.
- [ ] Lighthouse budgets met.
- [ ] E2E suite green.
- [ ] No accessibility regressions vs current dashboard.
