# FitConnect Voltline Glass Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a PWA-installable, glass-aesthetic FitConnect with a Voltline design system, theme selector, mobile shell, and four end-to-end coach × athlete loops (morning handshake · live session · celebrations · AI co-pilot) demonstrable across two browser tabs.

**Architecture:** Build on the existing Next.js 14 App Router app. Add a new `(app)` route group housing the authenticated experience under a mobile-first shell with floating glass dock. Introduce a Voltline design token layer (CSS vars + Tailwind extension), a theme provider with five presets and a "Match my coach" affordance, and a single `useChannel` realtime hook backed by `BroadcastChannel` today and Supabase later. Wrap the app with `@ducanh2912/next-pwa` for installability. Extend the existing Zustand dashboard store with `liveSessions`, `reactions`, and `aiAlerts` slices. Test with Vitest (unit + component) and Playwright (multi-context E2E).

**Tech Stack:** Next.js 14 · TypeScript 5.6 · Tailwind 3.4 · Zustand 5 · Framer Motion 11 · `@ducanh2912/next-pwa` 10 · `BroadcastChannel` web API · Vitest 2 · Playwright 1.49.

**Source spec:** `docs/superpowers/specs/2026-05-17-fitconnect-glass-redesign-design.md`

**Branch:** `feat/voltline-glass-redesign`

---

## Conventions used by every task

- **Tests live next to code:** `lib/foo.ts` ↔ `lib/foo.test.ts`. Component tests sit at `components/.../foo.test.tsx`. E2E specs go to `tests/e2e/*.spec.ts`.
- **Run a single test file:** `npx vitest run path/to/file.test.ts`. Run all unit tests: `npm run test`. Run E2E: `npm run test:e2e`.
- **Commit cadence:** Commit at the end of every task. Conventional commits: `feat(theme): add Voltline tokens`, `test(realtime): add useChannel cross-tab spec`.
- **No `any` in new code.** Strict TS only.
- **Pre-existing files are noted as `Modify` and a line range is given when known.**
- **All new components are React Server Components by default; only `"use client"` files when interactivity, hooks, or browser APIs are used.**

---

## File structure (locked)

### New files

```
app/
  (app)/
    layout.tsx                              # mobile shell + theme provider gate
    dashboard/page.tsx                      # athlete dashboard rebuild
    coach/dashboard/page.tsx                # coach dashboard rebuild
    coach/athletes/[id]/page.tsx            # athlete detail rebuild
    settings/appearance/page.tsx            # theme picker page
  manifest.ts                               # PWA web app manifest
  apple-icon.tsx                            # iOS touch icon

components/
  shell/
    mobile-shell.tsx                        # top bar + content slot + dock
    floating-dock.tsx                       # 5-item lime dock
    top-bar.tsx                             # greeting + avatar + theme picker
    theme-picker.tsx                        # 5-dot variant + settings variant
    install-prompt.tsx                      # PWA install banner
    page-transition.tsx                     # AnimatePresence wrapper

  ui-glass/
    glass-card.tsx
    volt-button.tsx
    pill.tsx
    readiness-ring.tsx
    hr-ribbon.tsx
    spark-line.tsx
    celebration-burst.tsx

  loops/
    morning-handshake/
      readiness-card.tsx                    # athlete-side
      roster-heatmap.tsx                    # coach-side
      quick-diff-chips.tsx                  # coach-side
      plan-update-banner.tsx                # athlete-side
    live-session/
      session-card.tsx                      # athlete entry point
      live-metrics.tsx                      # athlete + coach view
      nudge-bar.tsx                         # coach-side
      nudge-toast.tsx                       # athlete-side
      session-summary.tsx                   # post-session card
    celebrations/
      celebration-overlay.tsx
      reaction-row.tsx
      streak-card.tsx
    ai-copilot/
      alert-card.tsx
      alert-feed.tsx

lib/
  theme/
    themes.ts                               # 5 preset definitions
    theme-provider.tsx                      # context + localStorage sync
    use-theme.ts                            # hook
    apply-theme.ts                          # writes CSS vars
  realtime/
    types.ts                                # RealtimeMessage union
    use-channel.ts                          # primary hook
    local-channel.ts                        # BroadcastChannel adapter
    supabase-channel.ts                     # stub for future
    handlers.ts                             # message → store mutation
    synthetic.ts                            # demo HRV/HR ticker
  ai/
    rules.ts                                # evaluateRoster
    pr-detection.ts                         # detectPRs
  pwa/
    register-sw.ts                          # client-side SW registration
    use-install-prompt.ts                   # install prompt hook
    haptics.ts                              # navigator.vibrate wrapper

tests/
  setup/vitest.setup.ts                     # jest-dom + mocks
  e2e/morning-handshake.spec.ts
  e2e/live-session.spec.ts
  e2e/celebrations.spec.ts
  e2e/theme-switching.spec.ts
  e2e/install-pwa.spec.ts
```

### Modified files

```
app/layout.tsx                              # wrap with ThemeProvider, register SW
app/dashboard/page.tsx                      # delete (replaced by (app)/dashboard)
app/coach/dashboard/page.tsx                # delete
app/coach/athletes/[id]/page.tsx            # delete
app/signin/page.tsx                         # re-skin + ?demo=coach handling
app/signup/page.tsx                         # re-skin
lib/dashboard-store.ts                      # +liveSessions/reactions/aiAlerts
lib/dashboard/types.ts                      # +LiveSession, Reaction, AICoPilotAlert
lib/dashboard/seed.ts                       # +seed initial state extras
tailwind.config.ts                          # extend with Voltline tokens
next.config.mjs                             # wrap with withPWA
package.json                                # +deps for next-pwa, vitest, playwright
.gitignore                                  # +playwright-report, /coverage
README.md                                   # PWA install + demo instructions
```

### Deleted files

The following marketing-coupled dashboard preview components are obsolete after the (app) rebuild and get removed in Phase 9 to keep the codebase clean:

```
components/dashboard/preview-athlete.tsx
components/dashboard/preview-coach.tsx
components/dashboard/role-dashboard-preview.tsx
components/dashboard/browser-frame.tsx
```

The remaining `components/dashboard/*` files (athlete-dashboard-view, coach-dashboard-view, coach-athlete-detail-view, dashboard-shell, dashboard-header, kpi-tile, readiness-card, coach-plan-panel) are also removed in Phase 9 once their replacements in `components/loops/` and `components/ui-glass/` are wired in.

---

## Phase index

| Phase | Tasks | Outcome |
|---|---|---|
| 1 — Tooling | 1–4 | Vitest + Playwright + lint config baseline |
| 2 — Voltline tokens | 5–8 | CSS vars, Tailwind tokens, glass primitives |
| 3 — Theme system | 9–12 | 5 presets, provider, picker, "Match my coach" |
| 4 — PWA | 13–16 | Manifest, icons, SW, install prompt |
| 5 — Mobile shell | 17–22 | Floating dock, top bar, layout, transitions |
| 6 — Realtime layer | 23–28 | useChannel + local impl + synthetic ticker + handlers |
| 7 — Loop A (morning) | 29–33 | Readiness, heatmap, diff chips, banner, wired |
| 8 — Loop B (live) | 34–39 | Session card, live metrics, nudge bar, summary, wired |
| 9 — Loop D (celebrations) | 40–44 | PR detection, overlay, reactions, streak, wired |
| 10 — Loop E (AI) | 45–48 | Rules, alert card, feed, approval flow |
| 11 — Pages | 49–55 | (app) routes, signin/signup re-skin, demo button, cleanup |
| 12 — E2E + polish | 56–61 | Playwright suite, Lighthouse, README, mobile smoke |

Total: **61 tasks**, each 2–5 minutes of focused work.

---

## Phase 1 — Tooling

Sets up unit testing (Vitest), e2e (Playwright), and `next-pwa`. No app code yet; this gives every later task a TDD foothold.

### Task 1: Add Vitest + Testing Library

**Files:**
- Modify: `package.json` (scripts + devDependencies)
- Create: `vitest.config.ts`
- Create: `tests/setup/vitest.setup.ts`
- Create: `lib/sanity.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/sanity.test.ts
import { describe, it, expect } from "vitest";

describe("sanity", () => {
  it("knows 1+1=2", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 2: Verify the test currently cannot run**

Run: `npx vitest run lib/sanity.test.ts`
Expected: `command not found` or `Cannot find module 'vitest'` — Vitest not installed yet.

- [ ] **Step 3: Install dependencies and config**

```bash
npm install -D vitest@^2.1.5 @vitest/ui@^2.1.5 jsdom@^25 @testing-library/react@^16 @testing-library/jest-dom@^6 @testing-library/user-event@^14
```

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup/vitest.setup.ts"],
    include: ["lib/**/*.test.{ts,tsx}", "components/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "tests/e2e/**"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

```ts
// tests/setup/vitest.setup.ts
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});
```

```bash
npm install -D @vitejs/plugin-react@^4
```

Edit `package.json` scripts to add: `"test": "vitest run"`, `"test:watch": "vitest"`, `"test:ui": "vitest --ui"`.

- [ ] **Step 4: Run the sanity test, expect PASS**

Run: `npm run test -- lib/sanity.test.ts`
Expected: 1 passed, exit 0.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts tests/setup/vitest.setup.ts lib/sanity.test.ts
git commit -m "chore(test): add vitest + testing-library baseline"
```

---

### Task 2: Add Playwright

**Files:**
- Modify: `package.json` (scripts + devDependencies)
- Create: `playwright.config.ts`
- Create: `tests/e2e/smoke.spec.ts`
- Modify: `.gitignore` (+playwright-report, +test-results)

- [ ] **Step 1: Write the failing test**

```ts
// tests/e2e/smoke.spec.ts
import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/FitConnect/i);
});
```

- [ ] **Step 2: Verify the test currently cannot run**

Run: `npx playwright test tests/e2e/smoke.spec.ts`
Expected: `Cannot find module '@playwright/test'`.

- [ ] **Step 3: Install + config**

```bash
npm install -D @playwright/test@^1.49
npx playwright install --with-deps chromium
```

```ts
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
    viewport: { width: 390, height: 844 }, // iPhone 13 Pro
    deviceScaleFactor: 3,
  },
  projects: [
    { name: "mobile-chrome", use: { ...devices["Pixel 7"] } },
    { name: "mobile-safari", use: { ...devices["iPhone 13"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

Add `package.json` scripts: `"test:e2e": "playwright test"`, `"test:e2e:ui": "playwright test --ui"`.

Append to `.gitignore`:
```
playwright-report/
test-results/
/coverage/
```

- [ ] **Step 4: Run smoke E2E, expect PASS**

Run: `npm run test:e2e -- --project=mobile-chrome smoke.spec.ts`
Expected: 1 passed.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json playwright.config.ts tests/e2e/smoke.spec.ts .gitignore
git commit -m "chore(test): add playwright e2e baseline"
```

---

### Task 3: Add `@ducanh2912/next-pwa`

**Files:**
- Modify: `package.json`
- Modify: `next.config.mjs`

- [ ] **Step 1: Write the failing assertion**

```ts
// lib/pwa/config.test.ts
import { describe, it, expect } from "vitest";
import nextConfig from "@/next.config.mjs";

describe("next-pwa", () => {
  it("wraps the next config", () => {
    expect(nextConfig).toHaveProperty("pwa");
    expect((nextConfig as any).pwa.disable).toBe(process.env.NODE_ENV !== "production");
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

Run: `npm run test -- lib/pwa/config.test.ts`
Expected: failure — `pwa` property missing.

- [ ] **Step 3: Install + wrap**

```bash
npm install @ducanh2912/next-pwa@^10
```

Replace `next.config.mjs` content with:

```js
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV !== "production",
  register: true,
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pwa: {
    disable: process.env.NODE_ENV !== "production",
  },
};

export default withPWA(nextConfig);
```

- [ ] **Step 4: Run, expect PASS**

Run: `npm run test -- lib/pwa/config.test.ts`
Expected: 1 passed.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json next.config.mjs lib/pwa/config.test.ts
git commit -m "chore(pwa): wire @ducanh2912/next-pwa (disabled in dev)"
```

---

### Task 4: Strict TypeScript baseline check

**Files:**
- (no source changes — verification only)

- [ ] **Step 1: Run `npx tsc --noEmit`**

Expected: exit 0. If failures appear, fix them inline (probably none — current main is clean).

- [ ] **Step 2: Add `typecheck` script to `package.json`**

```json
"typecheck": "tsc --noEmit"
```

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore(ts): add typecheck script"
```

---

## Phase 2 — Voltline tokens

Locks the design language. CSS variables on `:root`, Tailwind extension reading from those vars, and the four atomic primitives that everything else composes from.

### Task 5: Voltline CSS variables

**Files:**
- Create: `app/voltline.css`
- Modify: `app/globals.css` (import voltline.css)
- Test: `lib/theme/tokens.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/theme/tokens.test.ts
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("voltline tokens", () => {
  const css = fs.readFileSync(
    path.resolve(process.cwd(), "app/voltline.css"),
    "utf8"
  );

  it.each([
    ["--ink-950", "#07080A"],
    ["--ink-900", "#0E0F12"],
    ["--volt-500", "#C7FB3A"],
    ["--volt-400", "#DAFE7E"],
    ["--jade-500", "#2DD4BF"],
    ["--coral-500", "#FF5470"],
    ["--glass-md", "rgba(255,255,255,.06)"],
    ["--glass-edge", "rgba(199,251,58,.30)"],
  ])("defines %s as %s", (name, expected) => {
    const re = new RegExp(`${name}\\s*:\\s*${expected.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}`);
    expect(re.test(css)).toBe(true);
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

Run: `npm run test -- lib/theme/tokens.test.ts`
Expected: file does not exist.

- [ ] **Step 3: Create `app/voltline.css`**

```css
:root {
  --ink-950: #07080A;
  --ink-900: #0E0F12;
  --ink-800: #15171B;
  --ink-700: #21242A;
  --ink-600: #2E323A;
  --ink-500: #5B606B;
  --ink-400: #8A8F99;
  --ink-300: #BFC3CC;
  --ink-100: #F2F3F6;
  --ink-50:  #FAFBFC;

  --volt-300: #E9FFB5;
  --volt-400: #DAFE7E;
  --volt-500: #C7FB3A;
  --volt-600: #9CD81A;
  --volt-glow: rgba(199,251,58,.45);

  --jade-500:  #2DD4BF;
  --amber-400: #F5B844;
  --coral-500: #FF5470;

  --glass-lo:    rgba(255,255,255,.03);
  --glass-md:    rgba(255,255,255,.06);
  --glass-hi:    rgba(255,255,255,.10);
  --glass-volt:  rgba(199,251,58,.06);
  --glass-border: rgba(255,255,255,.08);
  --glass-edge:   rgba(199,251,58,.30);

  --grad-pulse: linear-gradient(135deg, #DAFE7E, #C7FB3A, #9CD81A);
  --grad-text:  linear-gradient(135deg, #FAFBFC, #DAFE7E 60%, #C7FB3A);

  --safe-top:    env(safe-area-inset-top);
  --safe-bottom: env(safe-area-inset-bottom);

  color-scheme: dark;
}

html, body {
  background: var(--ink-950);
  color: var(--ink-100);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
}
```

Edit `app/globals.css` to add `@import "./voltline.css";` at the top.

- [ ] **Step 4: Run, expect PASS**

Run: `npm run test -- lib/theme/tokens.test.ts`
Expected: 8 passed.

- [ ] **Step 5: Commit**

```bash
git add app/voltline.css app/globals.css lib/theme/tokens.test.ts
git commit -m "feat(theme): add Voltline CSS token layer"
```

---

### Task 6: Tailwind extension reading the tokens

**Files:**
- Modify: `tailwind.config.ts`
- Test: `lib/theme/tailwind.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/theme/tailwind.test.ts
import { describe, it, expect } from "vitest";
import config from "@/tailwind.config";

describe("tailwind voltline extension", () => {
  const colors = (config.theme?.extend?.colors ?? {}) as Record<string, any>;

  it("registers ink palette", () => {
    expect(colors.ink?.["950"]).toBe("var(--ink-950)");
    expect(colors.ink?.["500"]).toBe("var(--ink-500)");
  });

  it("registers volt palette", () => {
    expect(colors.volt?.["500"]).toBe("var(--volt-500)");
  });

  it("registers glass surfaces", () => {
    expect(colors.glass?.md).toBe("var(--glass-md)");
    expect(colors.glass?.edge).toBe("var(--glass-edge)");
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

Run: `npm run test -- lib/theme/tailwind.test.ts`
Expected: ink/volt/glass missing.

- [ ] **Step 3: Extend `tailwind.config.ts`**

Replace the `theme.extend` block with:

```ts
extend: {
  colors: {
    ink: {
      50:  "var(--ink-50)",
      100: "var(--ink-100)",
      300: "var(--ink-300)",
      400: "var(--ink-400)",
      500: "var(--ink-500)",
      600: "var(--ink-600)",
      700: "var(--ink-700)",
      800: "var(--ink-800)",
      900: "var(--ink-900)",
      950: "var(--ink-950)",
    },
    volt: {
      300: "var(--volt-300)",
      400: "var(--volt-400)",
      500: "var(--volt-500)",
      600: "var(--volt-600)",
    },
    jade:  { 500: "var(--jade-500)" },
    amber: { 400: "var(--amber-400)" },
    coral: { 500: "var(--coral-500)" },
    glass: {
      lo:     "var(--glass-lo)",
      md:     "var(--glass-md)",
      hi:     "var(--glass-hi)",
      volt:   "var(--glass-volt)",
      border: "var(--glass-border)",
      edge:   "var(--glass-edge)",
    },
  },
  boxShadow: {
    "volt-glow": "0 8px 22px var(--volt-glow)",
    "glass-edge": "inset 0 0 0 1px var(--glass-border), 0 1px 0 var(--glass-edge)",
  },
  backgroundImage: {
    "grad-pulse": "var(--grad-pulse)",
    "grad-text":  "var(--grad-text)",
  },
  borderRadius: {
    "glass": "20px",
    "glass-lg": "28px",
  },
  backdropBlur: {
    "glass": "18px",
    "glass-lg": "32px",
  },
  fontFamily: {
    display: ["var(--font-display, ui-sans-serif)", "system-ui", "sans-serif"],
    mono:    ["ui-monospace", "monospace"],
  },
  transitionTimingFunction: {
    "soft": "cubic-bezier(0.16, 1, 0.3, 1)",
  },
}
```

- [ ] **Step 4: Run, expect PASS**

Run: `npm run test -- lib/theme/tailwind.test.ts`
Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.ts lib/theme/tailwind.test.ts
git commit -m "feat(theme): extend Tailwind with Voltline tokens"
```

---

### Task 7: `<GlassCard>`, `<VoltButton>`, `<Pill>` primitives

**Files:**
- Create: `components/ui-glass/glass-card.tsx`
- Create: `components/ui-glass/volt-button.tsx`
- Create: `components/ui-glass/pill.tsx`
- Test: `components/ui-glass/glass-card.test.tsx`
- Test: `components/ui-glass/volt-button.test.tsx`
- Test: `components/ui-glass/pill.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
// components/ui-glass/glass-card.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GlassCard } from "./glass-card";

describe("<GlassCard />", () => {
  it("renders children inside a glass surface", () => {
    render(<GlassCard data-testid="g">hello</GlassCard>);
    const el = screen.getByTestId("g");
    expect(el).toHaveTextContent("hello");
    expect(el.className).toMatch(/backdrop-blur/);
  });

  it("applies the live tone glow", () => {
    render(<GlassCard tone="live" data-testid="g">x</GlassCard>);
    expect(screen.getByTestId("g").className).toMatch(/shadow-volt-glow/);
  });
});
```

```tsx
// components/ui-glass/volt-button.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VoltButton } from "./volt-button";

describe("<VoltButton />", () => {
  it("calls onClick", async () => {
    const fn = vi.fn();
    render(<VoltButton onClick={fn}>Go</VoltButton>);
    await userEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(fn).toHaveBeenCalledOnce();
  });

  it("has lime fill by default", () => {
    render(<VoltButton>Go</VoltButton>);
    expect(screen.getByRole("button").className).toMatch(/bg-volt-500/);
  });
});
```

```tsx
// components/ui-glass/pill.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Pill } from "./pill";

describe("<Pill />", () => {
  it("renders volt by default", () => {
    render(<Pill>Live</Pill>);
    expect(screen.getByText("Live").className).toMatch(/bg-volt-500/);
  });

  it("supports coral variant", () => {
    render(<Pill variant="coral">Hot</Pill>);
    expect(screen.getByText("Hot").className).toMatch(/bg-coral-500/);
  });
});
```

- [ ] **Step 2: Run, expect FAIL** (modules don't exist)

Run: `npm run test -- components/ui-glass`
Expected: 6 failures.

- [ ] **Step 3: Implement primitives**

```tsx
// components/ui-glass/glass-card.tsx
import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "active" | "live";

const toneClass: Record<Tone, string> = {
  default: "bg-glass-md border-glass-border",
  active:  "bg-glass-volt border-volt-500/30",
  live:    "bg-glass-volt border-volt-500/40 shadow-volt-glow",
};

export type GlassCardProps = HTMLAttributes<HTMLDivElement> & { tone?: Tone };

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ tone = "default", className, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-glass border backdrop-blur-glass p-5 transition-colors",
        toneClass[tone],
        className,
      )}
      {...rest}
    />
  ),
);
GlassCard.displayName = "GlassCard";
```

```tsx
// components/ui-glass/volt-button.tsx
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "subtle";

const variantClass: Record<Variant, string> = {
  primary: "bg-volt-500 text-ink-950 hover:bg-volt-400 shadow-volt-glow",
  ghost:   "bg-transparent text-volt-500 hover:bg-glass-volt",
  subtle:  "bg-glass-md text-ink-100 hover:bg-glass-hi border border-glass-border",
};

export type VoltButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export const VoltButton = forwardRef<HTMLButtonElement, VoltButtonProps>(
  ({ variant = "primary", className, ...rest }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 h-11 min-w-11 px-5 rounded-full font-semibold tracking-tight transition-all active:scale-[0.98]",
        variantClass[variant],
        className,
      )}
      {...rest}
    />
  ),
);
VoltButton.displayName = "VoltButton";
```

```tsx
// components/ui-glass/pill.tsx
import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "volt" | "live" | "amber" | "coral" | "neutral";

const variantClass: Record<Variant, string> = {
  volt:    "bg-volt-500 text-ink-950",
  live:    "bg-coral-500 text-ink-50 animate-pulse",
  amber:   "bg-amber-400 text-ink-950",
  coral:   "bg-coral-500 text-ink-50",
  neutral: "bg-glass-md text-ink-300 border border-glass-border",
};

export type PillProps = HTMLAttributes<HTMLSpanElement> & { variant?: Variant };

export function Pill({ variant = "volt", className, ...rest }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center h-6 px-2.5 text-[9px] uppercase tracking-[0.12em] font-extrabold rounded-full",
        variantClass[variant],
        className,
      )}
      {...rest}
    />
  );
}
```

- [ ] **Step 4: Run, expect PASS**

Run: `npm run test -- components/ui-glass`
Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add components/ui-glass
git commit -m "feat(ui-glass): add GlassCard, VoltButton, Pill primitives"
```

---

### Task 8: Indicator primitives — `<ReadinessRing>`, `<HRRibbon>`, `<SparkLine>`

**Files:**
- Create: `components/ui-glass/readiness-ring.tsx`
- Create: `components/ui-glass/hr-ribbon.tsx`
- Create: `components/ui-glass/spark-line.tsx`
- Test: `components/ui-glass/readiness-ring.test.tsx`
- Test: `components/ui-glass/hr-ribbon.test.tsx`
- Test: `components/ui-glass/spark-line.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
// components/ui-glass/readiness-ring.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReadinessRing } from "./readiness-ring";

describe("<ReadinessRing />", () => {
  it("renders the percentage label", () => {
    render(<ReadinessRing percent={82} label="Readiness" />);
    expect(screen.getByText("82")).toBeInTheDocument();
    expect(screen.getByText("Readiness")).toBeInTheDocument();
  });

  it("clamps percent into 0..100", () => {
    render(<ReadinessRing percent={140} label="x" />);
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("uses red track when low", () => {
    render(<ReadinessRing percent={30} label="x" data-testid="r" />);
    expect(screen.getByTestId("r").getAttribute("style")).toContain("--coral");
  });
});
```

```tsx
// components/ui-glass/hr-ribbon.test.tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { HRRibbon } from "./hr-ribbon";

describe("<HRRibbon />", () => {
  it("renders one bar per data point", () => {
    const { container } = render(<HRRibbon data={[60, 70, 80, 90, 100]} />);
    expect(container.querySelectorAll("[data-bar]").length).toBe(5);
  });
});
```

```tsx
// components/ui-glass/spark-line.test.tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { SparkLine } from "./spark-line";

describe("<SparkLine />", () => {
  it("renders a polyline with the right number of points", () => {
    const { container } = render(<SparkLine values={[1, 2, 3, 4]} />);
    const poly = container.querySelector("polyline");
    expect(poly).toBeTruthy();
    expect(poly!.getAttribute("points")?.split(" ").length).toBe(4);
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

Run: `npm run test -- components/ui-glass`
Expected: ring/ribbon/spark missing.

- [ ] **Step 3: Implement**

```tsx
// components/ui-glass/readiness-ring.tsx
import { cn } from "@/lib/utils";

type Props = {
  percent: number;
  label: string;
  size?: number;
  className?: string;
  ["data-testid"]?: string;
};

function clamp(n: number) { return Math.max(0, Math.min(100, Math.round(n))); }

function trackVar(p: number) {
  if (p < 40) return "var(--coral-500)";
  if (p < 65) return "var(--amber-400)";
  return "var(--volt-500)";
}

export function ReadinessRing({ percent, label, size = 96, className, ...rest }: Props) {
  const p = clamp(percent);
  const color = trackVar(p);
  return (
    <div
      className={cn("relative grid place-items-center", className)}
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${color} ${p * 3.6}deg, var(--ink-700) 0deg)`,
        borderRadius: "50%",
      }}
      {...rest}
    >
      <div className="absolute inset-1.5 rounded-full bg-ink-900 grid place-items-center">
        <span className="text-2xl font-extrabold text-ink-100">{p}</span>
        <span className="text-[9px] uppercase tracking-[0.18em] text-ink-400 mt-0.5">{label}</span>
      </div>
    </div>
  );
}
```

```tsx
// components/ui-glass/hr-ribbon.tsx
type Props = {
  data: number[];
  className?: string;
};

export function HRRibbon({ data, className = "" }: Props) {
  const max = Math.max(...data, 1);
  return (
    <div className={`flex items-end gap-1 h-12 ${className}`}>
      {data.map((v, i) => (
        <span
          key={i}
          data-bar
          className="flex-1 rounded-sm bg-grad-pulse transition-all"
          style={{ height: `${(v / max) * 100}%`, minHeight: 4 }}
        />
      ))}
    </div>
  );
}
```

```tsx
// components/ui-glass/spark-line.tsx
type Props = {
  values: number[];
  width?: number;
  height?: number;
  className?: string;
};

export function SparkLine({ values, width = 96, height = 24, className }: Props) {
  if (values.length === 0) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = Math.max(max - min, 0.0001);
  const step = width / Math.max(values.length - 1, 1);
  const points = values
    .map((v, i) => `${i * step},${height - ((v - min) / span) * height}`)
    .join(" ");
  return (
    <svg width={width} height={height} className={className} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id="sl-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="var(--volt-400)" />
          <stop offset="100%" stopColor="var(--volt-500)" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke="url(#sl-grad)" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}
```

- [ ] **Step 4: Run, expect PASS**

Run: `npm run test -- components/ui-glass`
Expected: 11 passed (3 + 1 + 1 + 6 from earlier).

- [ ] **Step 5: Commit**

```bash
git add components/ui-glass/readiness-ring.tsx components/ui-glass/hr-ribbon.tsx components/ui-glass/spark-line.tsx components/ui-glass/*.test.tsx
git commit -m "feat(ui-glass): add ReadinessRing, HRRibbon, SparkLine"
```

---

## Phase 3 — Theme system (5 presets + Match my coach)

### Task 9: Theme definitions

**Files:**
- Create: `lib/theme/themes.ts`
- Test: `lib/theme/themes.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/theme/themes.test.ts
import { describe, it, expect } from "vitest";
import { THEMES, isThemeId, type ThemeId } from "./themes";

describe("THEMES", () => {
  it("has the 5 locked presets", () => {
    expect(Object.keys(THEMES).sort()).toEqual(
      ["aurora", "pulse", "solar", "tide", "voltline"]
    );
  });

  it("each theme defines 4 token vars", () => {
    for (const t of Object.values(THEMES)) {
      expect(t.tokens["--volt-300"]).toBeDefined();
      expect(t.tokens["--volt-400"]).toBeDefined();
      expect(t.tokens["--volt-500"]).toBeDefined();
      expect(t.tokens["--volt-600"]).toBeDefined();
      expect(t.tokens["--volt-glow"]).toBeDefined();
    }
  });

  it("isThemeId guards", () => {
    expect(isThemeId("voltline")).toBe(true);
    expect(isThemeId("nope")).toBe(false);
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```ts
// lib/theme/themes.ts
export type ThemeId = "voltline" | "pulse" | "tide" | "solar" | "aurora";

export type ThemeTokens = Record<
  "--volt-300" | "--volt-400" | "--volt-500" | "--volt-600" | "--volt-glow",
  string
>;

export type Theme = {
  id: ThemeId;
  label: string;
  description: string;
  tokens: ThemeTokens;
};

export const THEMES: Record<ThemeId, Theme> = {
  voltline: {
    id: "voltline",
    label: "Voltline",
    description: "Default — electric lime on charcoal",
    tokens: {
      "--volt-300": "#E9FFB5",
      "--volt-400": "#DAFE7E",
      "--volt-500": "#C7FB3A",
      "--volt-600": "#9CD81A",
      "--volt-glow": "rgba(199,251,58,.45)",
    },
  },
  pulse: {
    id: "pulse",
    label: "Pulse",
    description: "Coral heat for high-output athletes",
    tokens: {
      "--volt-300": "#FFC2C2",
      "--volt-400": "#FF9090",
      "--volt-500": "#FF5470",
      "--volt-600": "#D43959",
      "--volt-glow": "rgba(255,84,112,.45)",
    },
  },
  tide: {
    id: "tide",
    label: "Tide",
    description: "Deep teal for endurance and recovery",
    tokens: {
      "--volt-300": "#9EF5E2",
      "--volt-400": "#56E5C9",
      "--volt-500": "#2DD4BF",
      "--volt-600": "#1AAE9C",
      "--volt-glow": "rgba(45,212,191,.45)",
    },
  },
  solar: {
    id: "solar",
    label: "Solar",
    description: "Amber sunrise for morning sessions",
    tokens: {
      "--volt-300": "#FFE3A1",
      "--volt-400": "#FFCB69",
      "--volt-500": "#F5B844",
      "--volt-600": "#D69727",
      "--volt-glow": "rgba(245,184,68,.45)",
    },
  },
  aurora: {
    id: "aurora",
    label: "Aurora",
    description: "Violet glow for late-night training",
    tokens: {
      "--volt-300": "#D5C2FF",
      "--volt-400": "#B68FFF",
      "--volt-500": "#9466FF",
      "--volt-600": "#714AD9",
      "--volt-glow": "rgba(148,102,255,.45)",
    },
  },
};

export const THEME_IDS = Object.keys(THEMES) as ThemeId[];
export const DEFAULT_THEME: ThemeId = "voltline";

export function isThemeId(v: unknown): v is ThemeId {
  return typeof v === "string" && v in THEMES;
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add lib/theme/themes.ts lib/theme/themes.test.ts
git commit -m "feat(theme): define 5 Voltline-family presets"
```

---

### Task 10: Apply-theme utility

**Files:**
- Create: `lib/theme/apply-theme.ts`
- Test: `lib/theme/apply-theme.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/theme/apply-theme.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { applyTheme } from "./apply-theme";
import { THEMES } from "./themes";

describe("applyTheme", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("style");
    document.documentElement.removeAttribute("data-theme");
  });

  it("writes the theme tokens to documentElement", () => {
    applyTheme("pulse");
    expect(document.documentElement.style.getPropertyValue("--volt-500")).toBe(
      THEMES.pulse.tokens["--volt-500"]
    );
    expect(document.documentElement.dataset.theme).toBe("pulse");
  });

  it("ignores invalid theme ids", () => {
    applyTheme("voltline");
    applyTheme("nope" as never);
    expect(document.documentElement.dataset.theme).toBe("voltline");
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```ts
// lib/theme/apply-theme.ts
import { THEMES, isThemeId, type ThemeId } from "./themes";

export function applyTheme(id: ThemeId): void {
  if (typeof document === "undefined") return;
  if (!isThemeId(id)) return;
  const root = document.documentElement;
  for (const [k, v] of Object.entries(THEMES[id].tokens)) {
    root.style.setProperty(k, v);
  }
  root.dataset.theme = id;
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add lib/theme/apply-theme.ts lib/theme/apply-theme.test.ts
git commit -m "feat(theme): add applyTheme writer"
```

---

### Task 11: ThemeProvider + useTheme hook

**Files:**
- Create: `lib/theme/theme-provider.tsx`
- Create: `lib/theme/use-theme.ts`
- Test: `lib/theme/theme-provider.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// lib/theme/theme-provider.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "./theme-provider";
import { useTheme } from "./use-theme";

function Probe() {
  const { theme, setTheme, matchCoach, setMatchCoach } = useTheme();
  return (
    <div>
      <span data-testid="t">{theme}</span>
      <span data-testid="m">{String(matchCoach)}</span>
      <button onClick={() => setTheme("pulse")}>Pulse</button>
      <button onClick={() => setMatchCoach(true)}>Match</button>
    </div>
  );
}

describe("<ThemeProvider />", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("defaults to voltline", () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId("t").textContent).toBe("voltline");
  });

  it("setTheme persists to localStorage", async () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    await userEvent.click(screen.getByText("Pulse"));
    expect(localStorage.getItem("fitconnect.theme")).toBe("pulse");
    expect(document.documentElement.dataset.theme).toBe("pulse");
  });

  it("matchCoach persists to localStorage", async () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    await userEvent.click(screen.getByText("Match"));
    expect(localStorage.getItem("fitconnect.theme.matchCoach")).toBe("1");
  });

  it("uses coachTheme when matchCoach is true", () => {
    render(
      <ThemeProvider initialMatchCoach coachTheme="solar">
        <Probe />
      </ThemeProvider>
    );
    expect(screen.getByTestId("t").textContent).toBe("solar");
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```tsx
// lib/theme/theme-provider.tsx
"use client";

import { createContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_THEME, isThemeId, type ThemeId } from "./themes";
import { applyTheme } from "./apply-theme";

type Ctx = {
  theme: ThemeId;
  setTheme: (id: ThemeId) => void;
  matchCoach: boolean;
  setMatchCoach: (v: boolean) => void;
  coachTheme: ThemeId | null;
};

export const ThemeContext = createContext<Ctx | null>(null);

const KEY_THEME = "fitconnect.theme";
const KEY_MATCH = "fitconnect.theme.matchCoach";

export function ThemeProvider({
  children,
  initialTheme,
  initialMatchCoach = false,
  coachTheme = null,
}: {
  children: ReactNode;
  initialTheme?: ThemeId;
  initialMatchCoach?: boolean;
  coachTheme?: ThemeId | null;
}) {
  const [theme, setThemeState] = useState<ThemeId>(initialTheme ?? DEFAULT_THEME);
  const [matchCoach, setMatchCoachState] = useState<boolean>(initialMatchCoach);

  useEffect(() => {
    const saved = localStorage.getItem(KEY_THEME);
    if (saved && isThemeId(saved)) setThemeState(saved);
    setMatchCoachState(localStorage.getItem(KEY_MATCH) === "1");
  }, []);

  const effective: ThemeId = matchCoach && coachTheme ? coachTheme : theme;

  useEffect(() => {
    applyTheme(effective);
  }, [effective]);

  const ctx = useMemo<Ctx>(() => ({
    theme: effective,
    setTheme: (id) => {
      setThemeState(id);
      localStorage.setItem(KEY_THEME, id);
    },
    matchCoach,
    setMatchCoach: (v) => {
      setMatchCoachState(v);
      localStorage.setItem(KEY_MATCH, v ? "1" : "0");
    },
    coachTheme,
  }), [effective, matchCoach, coachTheme]);

  return <ThemeContext.Provider value={ctx}>{children}</ThemeContext.Provider>;
}
```

```ts
// lib/theme/use-theme.ts
"use client";
import { useContext } from "react";
import { ThemeContext } from "./theme-provider";

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider />");
  return ctx;
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add lib/theme/theme-provider.tsx lib/theme/use-theme.ts lib/theme/theme-provider.test.tsx
git commit -m "feat(theme): add ThemeProvider + useTheme"
```

---

### Task 12: `<ThemePicker>` component (dock + settings variants)

**Files:**
- Create: `components/shell/theme-picker.tsx`
- Test: `components/shell/theme-picker.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// components/shell/theme-picker.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemePicker } from "./theme-picker";
import { ThemeProvider } from "@/lib/theme/theme-provider";

describe("<ThemePicker />", () => {
  it("dock variant renders 5 dots", () => {
    render(<ThemeProvider><ThemePicker variant="dock" /></ThemeProvider>);
    expect(screen.getAllByRole("button").length).toBe(5);
  });

  it("clicking a dot changes the theme", async () => {
    render(<ThemeProvider><ThemePicker variant="dock" /></ThemeProvider>);
    await userEvent.click(screen.getByRole("button", { name: /pulse/i }));
    expect(document.documentElement.dataset.theme).toBe("pulse");
  });

  it("settings variant shows label + description", () => {
    render(<ThemeProvider><ThemePicker variant="settings" /></ThemeProvider>);
    expect(screen.getByText("Voltline")).toBeInTheDocument();
    expect(screen.getByText(/electric lime/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```tsx
// components/shell/theme-picker.tsx
"use client";

import { useTheme } from "@/lib/theme/use-theme";
import { THEMES, THEME_IDS } from "@/lib/theme/themes";
import { cn } from "@/lib/utils";

type Variant = "dock" | "settings";

export function ThemePicker({ variant = "dock" }: { variant?: Variant }) {
  const { theme, setTheme } = useTheme();

  if (variant === "dock") {
    return (
      <div className="flex items-center gap-1.5" role="group" aria-label="Theme picker">
        {THEME_IDS.map((id) => {
          const t = THEMES[id];
          const active = id === theme;
          return (
            <button
              key={id}
              type="button"
              aria-label={t.label}
              aria-pressed={active}
              onClick={() => setTheme(id)}
              className={cn(
                "h-3 w-3 rounded-full transition-all",
                active && "ring-2 ring-offset-2 ring-offset-ink-950 ring-volt-500 scale-110"
              )}
              style={{ background: t.tokens["--volt-500"] }}
            />
          );
        })}
      </div>
    );
  }

  return (
    <ul className="grid sm:grid-cols-2 gap-3">
      {THEME_IDS.map((id) => {
        const t = THEMES[id];
        const active = id === theme;
        return (
          <li key={id}>
            <button
              type="button"
              aria-pressed={active}
              onClick={() => setTheme(id)}
              className={cn(
                "w-full text-left rounded-glass border p-4 backdrop-blur-glass transition-all",
                active ? "bg-glass-volt border-volt-500/40 shadow-volt-glow" : "bg-glass-md border-glass-border hover:bg-glass-hi"
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="h-7 w-7 rounded-full" style={{ background: t.tokens["--volt-500"] }} />
                <span className="text-base font-semibold">{t.label}</span>
              </div>
              <p className="text-sm text-ink-300">{t.description}</p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add components/shell/theme-picker.tsx components/shell/theme-picker.test.tsx
git commit -m "feat(shell): add ThemePicker with dock + settings variants"
```

---

## Phase 4 — PWA

### Task 13: Web manifest

**Files:**
- Create: `app/manifest.ts`
- Test: `lib/pwa/manifest.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/pwa/manifest.test.ts
import { describe, it, expect } from "vitest";
import manifest from "@/app/manifest";

describe("web manifest", () => {
  const m = manifest();
  it("is standalone with safe theme color", () => {
    expect(m.display).toBe("standalone");
    expect(m.theme_color).toBe("#07080A");
    expect(m.background_color).toBe("#07080A");
  });
  it("declares maskable icons", () => {
    expect(m.icons?.some((i) => i.purpose?.includes("maskable"))).toBe(true);
  });
  it("links the app start url", () => {
    expect(m.start_url).toBe("/dashboard");
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```ts
// app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FitConnect",
    short_name: "FitConnect",
    description: "Coach × athlete training, live.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#07080A",
    theme_color: "#07080A",
    orientation: "portrait",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add app/manifest.ts lib/pwa/manifest.test.ts
git commit -m "feat(pwa): add web manifest"
```

---

### Task 14: PNG icons (programmatic)

**Files:**
- Create: `scripts/generate-pwa-icons.mjs`
- Create: `public/icons/icon-192.png` (generated)
- Create: `public/icons/icon-512.png` (generated)
- Create: `public/icons/icon-maskable-192.png` (generated)
- Create: `public/icons/icon-maskable-512.png` (generated)

- [ ] **Step 1: Add the generator script**

```bash
npm install -D sharp@^0.33
```

```js
// scripts/generate-pwa-icons.mjs
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const OUT = path.resolve("public/icons");
fs.mkdirSync(OUT, { recursive: true });

function svg({ size, padded }) {
  const inset = padded ? size * 0.18 : size * 0.08;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#15171B"/>
      <stop offset="100%" stop-color="#07080A"/>
    </radialGradient>
    <linearGradient id="lime" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#DAFE7E"/>
      <stop offset="100%" stop-color="#9CD81A"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bg)"/>
  <g transform="translate(${inset} ${inset})">
    <circle cx="${(size - 2 * inset) / 2}" cy="${(size - 2 * inset) / 2}" r="${(size - 2 * inset) / 2.6}" fill="none" stroke="url(#lime)" stroke-width="${size * 0.04}"/>
    <path d="M${(size - 2 * inset) * 0.32} ${(size - 2 * inset) * 0.5} L${(size - 2 * inset) * 0.5} ${(size - 2 * inset) * 0.7} L${(size - 2 * inset) * 0.74} ${(size - 2 * inset) * 0.32}" stroke="url(#lime)" stroke-width="${size * 0.06}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </g>
</svg>`;
}

const targets = [
  { name: "icon-192.png", size: 192, padded: false },
  { name: "icon-512.png", size: 512, padded: false },
  { name: "icon-maskable-192.png", size: 192, padded: true },
  { name: "icon-maskable-512.png", size: 512, padded: true },
];

for (const t of targets) {
  await sharp(Buffer.from(svg(t))).png().toFile(path.join(OUT, t.name));
  console.log("wrote", t.name);
}
```

- [ ] **Step 2: Run the generator**

Run: `node scripts/generate-pwa-icons.mjs`
Expected: 4 files written.

- [ ] **Step 3: Verify the manifest test still passes**

Run: `npm run test -- lib/pwa/manifest.test.ts`
Expected: 3 passed.

- [ ] **Step 4: Commit (binary assets okay; small files)**

```bash
git add public/icons/icon-*.png scripts/generate-pwa-icons.mjs package.json package-lock.json
git commit -m "feat(pwa): add maskable + regular icons + generator"
```

---

### Task 15: `<InstallPrompt>` and SW registration

**Files:**
- Create: `lib/pwa/use-install-prompt.ts`
- Create: `components/shell/install-prompt.tsx`
- Test: `lib/pwa/use-install-prompt.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// lib/pwa/use-install-prompt.test.tsx
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useInstallPrompt } from "./use-install-prompt";

describe("useInstallPrompt", () => {
  it("captures the deferred event and exposes prompt()", () => {
    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.canInstall).toBe(false);
    act(() => {
      const ev = new Event("beforeinstallprompt") as Event & { prompt?: () => Promise<void>; userChoice?: Promise<{ outcome: "accepted" | "dismissed" }> };
      ev.prompt = () => Promise.resolve();
      ev.userChoice = Promise.resolve({ outcome: "dismissed" as const });
      window.dispatchEvent(ev);
    });
    expect(result.current.canInstall).toBe(true);
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```ts
// lib/pwa/use-install-prompt.ts
"use client";
import { useEffect, useState, useCallback } from "react";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function useInstallPrompt() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  useEffect(() => {
    const onBIP = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    return () => window.removeEventListener("beforeinstallprompt", onBIP);
  }, []);

  const prompt = useCallback(async () => {
    if (!evt) return "unavailable" as const;
    await evt.prompt();
    const { outcome } = await evt.userChoice;
    setEvt(null);
    return outcome;
  }, [evt]);

  return { canInstall: !!evt, prompt };
}
```

```tsx
// components/shell/install-prompt.tsx
"use client";
import { useInstallPrompt } from "@/lib/pwa/use-install-prompt";
import { VoltButton } from "@/components/ui-glass/volt-button";
import { GlassCard } from "@/components/ui-glass/glass-card";

export function InstallPrompt() {
  const { canInstall, prompt } = useInstallPrompt();
  if (!canInstall) return null;
  return (
    <GlassCard tone="active" className="flex items-center gap-3">
      <div className="flex-1">
        <p className="font-semibold">Install FitConnect</p>
        <p className="text-sm text-ink-300">Add it to your home screen for the full app feel.</p>
      </div>
      <VoltButton onClick={() => void prompt()}>Install</VoltButton>
    </GlassCard>
  );
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add lib/pwa/use-install-prompt.ts components/shell/install-prompt.tsx lib/pwa/use-install-prompt.test.tsx
git commit -m "feat(pwa): add install prompt hook + banner"
```

---

### Task 16: iOS apple-touch-icon route

**Files:**
- Create: `app/apple-icon.tsx`

- [ ] **Step 1: Implement**

```tsx
// app/apple-icon.tsx
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "radial-gradient(60% 60% at 50% 50%, #15171B 0%, #07080A 100%)",
      }}>
        <div style={{
          width: 110, height: 110, borderRadius: 999,
          border: "8px solid #C7FB3A", display: "flex",
          alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 64, fontWeight: 900, color: "#C7FB3A" }}>✓</span>
        </div>
      </div>
    ),
    size
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add app/apple-icon.tsx
git commit -m "feat(pwa): add iOS apple-touch icon"
```

---

## Phase 5 — Mobile shell

### Task 17: `<FloatingDock>`

**Files:**
- Create: `components/shell/floating-dock.tsx`
- Test: `components/shell/floating-dock.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// components/shell/floating-dock.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FloatingDock } from "./floating-dock";
import { Home } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Today", icon: Home },
  { href: "/sessions", label: "Sessions", icon: Home },
  { href: "/coach", label: "Coach", icon: Home },
  { href: "/inbox", label: "Inbox", icon: Home },
  { href: "/profile", label: "Profile", icon: Home },
];

describe("<FloatingDock />", () => {
  it("renders 5 nav items with labels", () => {
    render(<FloatingDock items={items} active="/dashboard" />);
    expect(screen.getAllByRole("link").length).toBe(5);
    expect(screen.getByLabelText("Today")).toHaveAttribute("aria-current", "page");
  });

  it("non-active items are not aria-current", () => {
    render(<FloatingDock items={items} active="/dashboard" />);
    expect(screen.getByLabelText("Inbox")).not.toHaveAttribute("aria-current");
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```tsx
// components/shell/floating-dock.tsx
"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type DockItem = { href: string; label: string; icon: LucideIcon };

export function FloatingDock({ items, active }: { items: DockItem[]; active: string }) {
  return (
    <nav
      aria-label="Primary"
      className="fixed left-1/2 -translate-x-1/2 z-40 bottom-[calc(0.875rem+env(safe-area-inset-bottom))] pointer-events-auto"
    >
      <ul className="flex items-center gap-1 px-2 py-2 rounded-glass-lg bg-glass-md border border-glass-border backdrop-blur-glass-lg shadow-volt-glow">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.href || active.startsWith(item.href + "/");
          return (
            <li key={item.href} className="relative">
              {isActive && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-[3px] w-6 rounded-full bg-volt-500 shadow-volt-glow" />
              )}
              <Link
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "grid place-items-center h-11 w-11 rounded-full transition-all",
                  isActive ? "bg-grad-pulse text-ink-950" : "text-ink-400 hover:text-ink-100"
                )}
              >
                <Icon className="h-5 w-5" />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add components/shell/floating-dock.tsx components/shell/floating-dock.test.tsx
git commit -m "feat(shell): add floating glass dock"
```

---

### Task 18: `<TopBar>` (greeting + avatar + theme picker)

**Files:**
- Create: `components/shell/top-bar.tsx`
- Test: `components/shell/top-bar.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// components/shell/top-bar.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TopBar } from "./top-bar";
import { ThemeProvider } from "@/lib/theme/theme-provider";

describe("<TopBar />", () => {
  it("greets the user", () => {
    render(<ThemeProvider><TopBar greeting="Good morning" name="Iris" avatarUrl="/a.png" /></ThemeProvider>);
    expect(screen.getByText("Good morning")).toBeInTheDocument();
    expect(screen.getByText("Iris")).toBeInTheDocument();
  });
  it("renders the dock-variant theme picker", () => {
    render(<ThemeProvider><TopBar greeting="Hi" name="Iris" avatarUrl="/a.png" /></ThemeProvider>);
    expect(screen.getAllByRole("button").length).toBeGreaterThanOrEqual(5);
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```tsx
// components/shell/top-bar.tsx
"use client";

import Image from "next/image";
import { ThemePicker } from "./theme-picker";

export function TopBar({
  greeting,
  name,
  avatarUrl,
}: {
  greeting: string;
  name: string;
  avatarUrl: string;
}) {
  return (
    <header className="px-5 pt-[calc(env(safe-area-inset-top)+12px)] pb-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <Image
          src={avatarUrl}
          alt={name}
          width={40}
          height={40}
          className="h-10 w-10 rounded-full border border-glass-border object-cover"
        />
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-400">{greeting}</p>
          <p className="text-base font-semibold truncate">{name}</p>
        </div>
      </div>
      <ThemePicker variant="dock" />
    </header>
  );
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add components/shell/top-bar.tsx components/shell/top-bar.test.tsx
git commit -m "feat(shell): add TopBar with theme picker"
```

---

### Task 19: `<PageTransition>` cross-fade wrapper

**Files:**
- Create: `components/shell/page-transition.tsx`

- [ ] **Step 1: Implement**

```tsx
// components/shell/page-transition.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        className="min-h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Verify TS**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add components/shell/page-transition.tsx
git commit -m "feat(shell): add PageTransition cross-fade wrapper"
```

---

### Task 20: `<MobileShell>` composition

**Files:**
- Create: `components/shell/mobile-shell.tsx`
- Test: `components/shell/mobile-shell.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// components/shell/mobile-shell.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MobileShell } from "./mobile-shell";
import { ThemeProvider } from "@/lib/theme/theme-provider";

vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard" }));

describe("<MobileShell />", () => {
  it("renders top bar, content, dock", () => {
    render(
      <ThemeProvider>
        <MobileShell role="athlete" name="Iris" avatarUrl="/a.png">
          <div data-testid="content">x</div>
        </MobileShell>
      </ThemeProvider>
    );
    expect(screen.getByText("Iris")).toBeInTheDocument();
    expect(screen.getByTestId("content")).toBeInTheDocument();
    expect(screen.getByLabelText("Today")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```tsx
// components/shell/mobile-shell.tsx
"use client";

import { usePathname } from "next/navigation";
import { Home, Calendar, Users, Inbox, User, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { TopBar } from "./top-bar";
import { FloatingDock, type DockItem } from "./floating-dock";
import { PageTransition } from "./page-transition";

type Role = "athlete" | "coach" | "admin";

const ATHLETE: DockItem[] = [
  { href: "/dashboard", label: "Today", icon: Home },
  { href: "/sessions", label: "Sessions", icon: Calendar },
  { href: "/coach", label: "Coach", icon: Users },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/profile", label: "Profile", icon: User },
];

const COACH: DockItem[] = [
  { href: "/coach/dashboard", label: "Today", icon: Home },
  { href: "/coach/sessions", label: "Sessions", icon: Calendar },
  { href: "/coach/roster", label: "Roster", icon: Users },
  { href: "/coach/inbox", label: "Inbox", icon: Inbox },
  { href: "/coach/profile", label: "Profile", icon: User },
];

const greetingFor = (h = new Date().getHours()) =>
  h < 5 ? "Late night" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";

export function MobileShell({
  role,
  name,
  avatarUrl,
  children,
}: {
  role: Role;
  name: string;
  avatarUrl: string;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "/";
  const items = role === "coach" ? COACH : ATHLETE;
  return (
    <div className="min-h-dvh bg-ink-950 text-ink-100 pb-[calc(96px+env(safe-area-inset-bottom))]">
      <TopBar greeting={greetingFor()} name={name} avatarUrl={avatarUrl} />
      <main className="px-5">
        <PageTransition>{children}</PageTransition>
      </main>
      <FloatingDock items={items} active={pathname} />
    </div>
  );
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add components/shell/mobile-shell.tsx components/shell/mobile-shell.test.tsx
git commit -m "feat(shell): compose MobileShell with role-aware dock"
```

---

### Task 21: `(app)` route group + layout

**Files:**
- Create: `app/(app)/layout.tsx`
- Modify: `app/layout.tsx` (wrap whole tree with `<ThemeProvider>`)

- [ ] **Step 1: Update root layout**

Modify `app/layout.tsx` so the `<body>` content is wrapped in `<ThemeProvider>`. Keep all existing providers (i18n, auth, etc.) intact and put `<ThemeProvider>` outermost so its CSS vars apply globally.

```tsx
// inside app/layout.tsx body
<ThemeProvider>
  {/* existing providers + children */}
</ThemeProvider>
```

- [ ] **Step 2: Create `(app)` layout**

```tsx
// app/(app)/layout.tsx
"use client";

export const dynamic = "force-dynamic";

import { useAuthStore } from "@/lib/auth-store";
import { useDashboardStore, selectAthlete } from "@/lib/dashboard-store";
import { redirect } from "next/navigation";
import { MobileShell } from "@/components/shell/mobile-shell";
import { useAuthHydrated } from "@/lib/use-auth-hydrated";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const hydrated = useAuthHydrated();
  const user = useAuthStore((s) => s.user);
  const athletes = useDashboardStore((s) => s.athletes);

  if (!hydrated) return null;
  if (!user) redirect("/signin?next=/dashboard");

  const role = user.role as "athlete" | "coach" | "admin";
  const athlete = role === "athlete" ? selectAthlete({ athletes } as any, user.id) : null;

  return (
    <MobileShell
      role={role}
      name={athlete?.name ?? user.name ?? "You"}
      avatarUrl={athlete?.avatar ?? "/icons/icon-192.png"}
    >
      {children}
    </MobileShell>
  );
}
```

- [ ] **Step 3: Verify TS**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx app/\(app\)/layout.tsx
git commit -m "feat(app): add (app) route group with mobile shell"
```

---

### Task 22: Shared-element morph helper

**Files:**
- Create: `components/shell/morph-card.tsx`

The helper expresses a Framer Motion `layoutId`-driven shared element. Used in Loop A (athlete card → detail) and Loop B (session card → live view).

- [ ] **Step 1: Implement**

```tsx
// components/shell/morph-card.tsx
"use client";
import { motion } from "framer-motion";
import type { ReactNode, HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  morphId: string;
  children: ReactNode;
};

export function MorphCard({ morphId, children, className, ...rest }: Props) {
  return (
    <motion.div
      layoutId={morphId}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      {...(rest as any)}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Verify TS**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add components/shell/morph-card.tsx
git commit -m "feat(shell): add MorphCard shared-element helper"
```

---

## Phase 6 — Realtime layer

### Task 23: Realtime types

**Files:**
- Create: `lib/realtime/types.ts`
- Test: `lib/realtime/types.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/realtime/types.test.ts
import { describe, it, expect } from "vitest";
import { isRealtimeMessage } from "./types";

describe("RealtimeMessage", () => {
  it("validates well-formed plan-update", () => {
    expect(isRealtimeMessage({
      kind: "plan-update", planId: "p1", athleteId: "a1", coachId: "c1",
      diff: "lighter-day", at: new Date().toISOString(), origin: "coach",
    })).toBe(true);
  });
  it("rejects bad shape", () => {
    expect(isRealtimeMessage({ kind: "plan-update" })).toBe(false);
    expect(isRealtimeMessage({})).toBe(false);
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```ts
// lib/realtime/types.ts
export type PlanUpdate = {
  kind: "plan-update";
  planId: string;
  athleteId: string;
  coachId: string;
  diff: "lighter-day" | "swap-z2" | "add-recovery" | "custom";
  customNote?: string;
  at: string;
  origin: "coach" | "co-pilot";
};

export type LiveTick = {
  kind: "live-tick";
  athleteId: string;
  hr: number;
  pace: number;
  cadence: number;
  elapsedSec: number;
  at: string;
};

export type Nudge = {
  kind: "nudge";
  athleteId: string;
  coachId: string;
  variant: "slow-down" | "push" | "great-work";
  at: string;
};

export type SessionStart = {
  kind: "session-start";
  athleteId: string;
  sessionId: string;
  at: string;
};

export type SessionEnd = {
  kind: "session-end";
  athleteId: string;
  sessionId: string;
  summary: { distanceKm: number; avgHr: number; maxHr: number; durationSec: number };
  at: string;
};

export type Achievement = {
  kind: "achievement";
  athleteId: string;
  title: string;
  metric: string;
  value: number;
  at: string;
};

export type Reaction = {
  kind: "reaction";
  achievementId: string;
  athleteId: string;
  emoji: "🔥" | "⚡" | "💪" | "👏" | "🚀";
  fromName: string;
  at: string;
};

export type AICoPilotAlert = {
  kind: "ai-alert";
  id: string;
  coachId: string;
  athleteId: string;
  rule: "hrv-down" | "sleep-low" | "missed-sessions";
  recommendation: "lighter-day" | "swap-z2" | "recovery-day";
  body: string;
  at: string;
};

export type RealtimeMessage =
  | PlanUpdate | LiveTick | Nudge | SessionStart | SessionEnd
  | Achievement | Reaction | AICoPilotAlert;

const KINDS = new Set([
  "plan-update", "live-tick", "nudge", "session-start", "session-end",
  "achievement", "reaction", "ai-alert",
]);

export function isRealtimeMessage(v: unknown): v is RealtimeMessage {
  return !!v && typeof v === "object"
    && typeof (v as { kind?: unknown }).kind === "string"
    && KINDS.has((v as { kind: string }).kind)
    && typeof (v as { at?: unknown }).at === "string";
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add lib/realtime/types.ts lib/realtime/types.test.ts
git commit -m "feat(realtime): add RealtimeMessage union + guard"
```

---

### Task 24: `useChannel` hook + local (BroadcastChannel) impl

**Files:**
- Create: `lib/realtime/local-channel.ts`
- Create: `lib/realtime/use-channel.ts`
- Test: `lib/realtime/use-channel.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// lib/realtime/use-channel.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useChannel } from "./use-channel";

class FakeBC {
  static instances: FakeBC[] = [];
  listeners: Array<(e: MessageEvent) => void> = [];
  closed = false;
  constructor(public name: string) { FakeBC.instances.push(this); }
  postMessage(data: unknown) {
    for (const i of FakeBC.instances) {
      if (i === this || i.name !== this.name || i.closed) continue;
      for (const l of i.listeners) l(new MessageEvent("message", { data }));
    }
  }
  addEventListener(_: "message", l: (e: MessageEvent) => void) { this.listeners.push(l); }
  removeEventListener() {}
  close() { this.closed = true; }
}

describe("useChannel", () => {
  beforeEach(() => {
    FakeBC.instances = [];
    (globalThis as any).BroadcastChannel = FakeBC as unknown as typeof BroadcastChannel;
  });

  it("delivers messages to all subscribers on the same channel", () => {
    const a = renderHook(() => useChannel("athlete:a1"));
    const b = renderHook(() => useChannel("athlete:a1"));
    act(() => {
      a.result.current.send({
        kind: "nudge", athleteId: "a1", coachId: "c1", variant: "push",
        at: new Date().toISOString(),
      });
    });
    expect(b.result.current.messages.at(-1)?.kind).toBe("nudge");
  });

  it("isolates messages across channels", () => {
    const a = renderHook(() => useChannel("athlete:a1"));
    const b = renderHook(() => useChannel("athlete:a2"));
    act(() => {
      a.result.current.send({
        kind: "nudge", athleteId: "a1", coachId: "c1", variant: "push",
        at: new Date().toISOString(),
      });
    });
    expect(b.result.current.messages.length).toBe(0);
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```ts
// lib/realtime/local-channel.ts
import type { RealtimeMessage } from "./types";

type Listener = (m: RealtimeMessage) => void;

export class LocalChannel {
  private bc: BroadcastChannel | null;
  private listeners = new Set<Listener>();

  constructor(public name: string) {
    this.bc = typeof window !== "undefined" && "BroadcastChannel" in window
      ? new BroadcastChannel(name) : null;
    if (this.bc) {
      this.bc.addEventListener("message", (e) => {
        for (const l of this.listeners) l(e.data as RealtimeMessage);
      });
    }
  }

  subscribe(l: Listener) {
    this.listeners.add(l);
    return () => { this.listeners.delete(l); };
  }

  send(m: RealtimeMessage) {
    if (this.bc) this.bc.postMessage(m);
    for (const l of this.listeners) l(m);
  }

  close() { this.bc?.close(); this.listeners.clear(); }
}
```

```ts
// lib/realtime/use-channel.ts
"use client";
import { useEffect, useRef, useState } from "react";
import { LocalChannel } from "./local-channel";
import type { RealtimeMessage } from "./types";

export function useChannel(name: string) {
  const ref = useRef<LocalChannel | null>(null);
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);

  useEffect(() => {
    const ch = new LocalChannel(name);
    ref.current = ch;
    const unsub = ch.subscribe((m) => setMessages((prev) => [...prev, m]));
    return () => { unsub(); ch.close(); };
  }, [name]);

  return {
    messages,
    send: (m: RealtimeMessage) => ref.current?.send(m),
  };
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add lib/realtime/local-channel.ts lib/realtime/use-channel.ts lib/realtime/use-channel.test.tsx
git commit -m "feat(realtime): add useChannel + BroadcastChannel adapter"
```

---

### Task 25: Synthetic ticker

**Files:**
- Create: `lib/realtime/synthetic.ts`
- Test: `lib/realtime/synthetic.test.ts`

Generates plausible HR/pace/cadence ticks that drive the live session demo.

- [ ] **Step 1: Write the failing test**

```ts
// lib/realtime/synthetic.test.ts
import { describe, it, expect, vi } from "vitest";
import { startTicker, generateTick } from "./synthetic";

describe("synthetic ticker", () => {
  it("generateTick increases elapsed and stays in band", () => {
    const t = generateTick({ athleteId: "a1", elapsedSec: 100, lastHr: 140, intent: "z2" });
    expect(t.elapsedSec).toBe(101);
    expect(t.hr).toBeGreaterThanOrEqual(120);
    expect(t.hr).toBeLessThanOrEqual(160);
  });

  it("startTicker emits and stops", async () => {
    vi.useFakeTimers();
    const sent: any[] = [];
    const stop = startTicker({
      athleteId: "a1", intent: "z2",
      sendTick: (t) => sent.push(t),
      intervalMs: 100,
    });
    vi.advanceTimersByTime(550);
    expect(sent.length).toBeGreaterThanOrEqual(5);
    stop();
    vi.advanceTimersByTime(500);
    const after = sent.length;
    vi.advanceTimersByTime(500);
    expect(sent.length).toBe(after);
    vi.useRealTimers();
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```ts
// lib/realtime/synthetic.ts
import type { LiveTick } from "./types";

type Intent = "z2" | "intervals" | "recovery";

const BAND: Record<Intent, [number, number]> = {
  z2: [120, 160],
  intervals: [140, 185],
  recovery: [95, 125],
};

export function generateTick(opts: {
  athleteId: string;
  elapsedSec: number;
  lastHr: number;
  intent: Intent;
}): LiveTick {
  const [lo, hi] = BAND[opts.intent];
  const target = (lo + hi) / 2;
  const drift = (Math.random() - 0.5) * 6;
  const pull = (target - opts.lastHr) * 0.15;
  const next = Math.round(Math.max(lo, Math.min(hi, opts.lastHr + drift + pull)));
  return {
    kind: "live-tick",
    athleteId: opts.athleteId,
    hr: next,
    pace: 4.2 + (Math.random() - 0.5) * 0.4,
    cadence: 168 + Math.round((Math.random() - 0.5) * 6),
    elapsedSec: opts.elapsedSec + 1,
    at: new Date().toISOString(),
  };
}

export function startTicker(opts: {
  athleteId: string;
  intent: Intent;
  intervalMs?: number;
  sendTick: (t: LiveTick) => void;
}) {
  let elapsedSec = 0;
  let lastHr = (BAND[opts.intent][0] + BAND[opts.intent][1]) / 2;
  const id = setInterval(() => {
    const t = generateTick({ athleteId: opts.athleteId, elapsedSec, lastHr, intent: opts.intent });
    elapsedSec = t.elapsedSec;
    lastHr = t.hr;
    opts.sendTick(t);
  }, opts.intervalMs ?? 1500);
  return () => clearInterval(id);
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add lib/realtime/synthetic.ts lib/realtime/synthetic.test.ts
git commit -m "feat(realtime): add synthetic HR ticker"
```

---

### Task 26: Extend `DashboardState` with live/reactions/aiAlerts

**Files:**
- Modify: `lib/dashboard/types.ts` (append)
- Modify: `lib/dashboard/seed.ts` (append empty arrays)
- Modify: `lib/dashboard-store.ts` (add slice mutators)
- Test: `lib/dashboard/dashboard-store.realtime.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/dashboard/dashboard-store.realtime.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { useDashboardStore } from "@/lib/dashboard-store";

describe("dashboard store · realtime slices", () => {
  beforeEach(() => useDashboardStore.getState().resetDemo());

  it("startsLiveSession adds a session keyed by athleteId", () => {
    useDashboardStore.getState().startLiveSession("a-iris", "intervals");
    const s = useDashboardStore.getState().liveSessions["a-iris"];
    expect(s.intent).toBe("intervals");
    expect(s.startedAt).toBeTruthy();
  });

  it("appendLiveTick appends data points", () => {
    useDashboardStore.getState().startLiveSession("a-iris", "z2");
    useDashboardStore.getState().appendLiveTick("a-iris", {
      kind: "live-tick", athleteId: "a-iris", hr: 145, pace: 4.2, cadence: 170,
      elapsedSec: 1, at: new Date().toISOString(),
    });
    expect(useDashboardStore.getState().liveSessions["a-iris"].ticks.length).toBe(1);
  });

  it("addReaction stores reactions per achievementId", () => {
    useDashboardStore.getState().addReaction("ach-1", {
      kind: "reaction", achievementId: "ach-1", athleteId: "a-iris",
      emoji: "🔥", fromName: "Marina", at: new Date().toISOString(),
    });
    expect(useDashboardStore.getState().reactions["ach-1"].length).toBe(1);
  });

  it("pushAIAlert dedupes by id", () => {
    const base = {
      kind: "ai-alert" as const, id: "x", coachId: "c-marina", athleteId: "a-iris",
      rule: "hrv-down" as const, recommendation: "lighter-day" as const,
      body: "x", at: new Date().toISOString(),
    };
    useDashboardStore.getState().pushAIAlert(base);
    useDashboardStore.getState().pushAIAlert(base);
    expect(useDashboardStore.getState().aiAlerts.length).toBe(1);
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Extend types**

Append to `lib/dashboard/types.ts`:

```ts
import type { AICoPilotAlert, LiveTick, Reaction } from "@/lib/realtime/types";

export type LiveSessionIntent = "z2" | "intervals" | "recovery";

export type LiveSession = {
  athleteId: string;
  intent: LiveSessionIntent;
  startedAt: string;
  ticks: LiveTick[];
  endedAt?: string;
};

export type DashboardState = {
  athletes: DashboardAthlete[];
  plans: CoachPlan[];
  sessions: DashboardSession[];
  messages: DashboardMessage[];
  habits: HabitItem[];
  coachMetrics: CoachMetrics[];
  weeklyVolume: ChartPoint[];
  monthlyTrend: TrendPoint[];
  sleepWeek: SleepPoint[];
  revenueWeekly: ChartPoint[];
  retentionTrend: TrendPoint[];
  liveSessions: Record<string, LiveSession>;
  reactions: Record<string, Reaction[]>;
  aiAlerts: AICoPilotAlert[];
};
```

(Replace the existing `DashboardState` declaration with the new one above.)

Modify `lib/dashboard/seed.ts`: ensure `initialDashboardState` includes `liveSessions: {}, reactions: {}, aiAlerts: []`.

Modify `lib/dashboard-store.ts` — add to the `DashboardStore` type and to the store factory:

```ts
type DashboardStore = DashboardState & {
  toggleHabit: (habitId: string) => void;
  togglePlanBlock: (planId: string, blockId: string) => void;
  updatePlanSuggestion: (planId: string, suggestion: string) => void;
  markMessageRead: (messageId: string) => void;
  resetDemo: () => void;
  startLiveSession: (athleteId: string, intent: LiveSessionIntent) => void;
  endLiveSession: (athleteId: string) => void;
  appendLiveTick: (athleteId: string, tick: LiveTick) => void;
  addReaction: (achievementId: string, r: Reaction) => void;
  pushAIAlert: (a: AICoPilotAlert) => void;
  dismissAIAlert: (id: string) => void;
};
```

```ts
startLiveSession: (athleteId, intent) =>
  set((s) => ({
    liveSessions: {
      ...s.liveSessions,
      [athleteId]: { athleteId, intent, startedAt: new Date().toISOString(), ticks: [] },
    },
  })),
endLiveSession: (athleteId) =>
  set((s) => {
    const cur = s.liveSessions[athleteId];
    if (!cur) return {};
    return {
      liveSessions: {
        ...s.liveSessions,
        [athleteId]: { ...cur, endedAt: new Date().toISOString() },
      },
    };
  }),
appendLiveTick: (athleteId, tick) =>
  set((s) => {
    const cur = s.liveSessions[athleteId];
    if (!cur) return {};
    return {
      liveSessions: {
        ...s.liveSessions,
        [athleteId]: { ...cur, ticks: [...cur.ticks, tick] },
      },
    };
  }),
addReaction: (achievementId, r) =>
  set((s) => ({
    reactions: { ...s.reactions, [achievementId]: [...(s.reactions[achievementId] ?? []), r] },
  })),
pushAIAlert: (a) =>
  set((s) => (s.aiAlerts.some((x) => x.id === a.id) ? {} : { aiAlerts: [a, ...s.aiAlerts] })),
dismissAIAlert: (id) =>
  set((s) => ({ aiAlerts: s.aiAlerts.filter((a) => a.id !== id) })),
```

- [ ] **Step 4: Run, expect PASS**

Run: `npm run test -- lib/dashboard/dashboard-store.realtime.test.ts`
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add lib/dashboard/types.ts lib/dashboard/seed.ts lib/dashboard-store.ts lib/dashboard/dashboard-store.realtime.test.ts
git commit -m "feat(store): add liveSessions/reactions/aiAlerts slices"
```

---

### Task 27: Realtime → store handlers

**Files:**
- Create: `lib/realtime/handlers.ts`
- Test: `lib/realtime/handlers.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/realtime/handlers.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { applyMessage } from "./handlers";
import { useDashboardStore } from "@/lib/dashboard-store";

describe("applyMessage", () => {
  beforeEach(() => useDashboardStore.getState().resetDemo());

  it("session-start opens a live session", () => {
    applyMessage({
      kind: "session-start", athleteId: "a-iris", sessionId: "s-1",
      at: new Date().toISOString(),
    } as any);
    expect(useDashboardStore.getState().liveSessions["a-iris"]).toBeTruthy();
  });

  it("live-tick appends ticks", () => {
    useDashboardStore.getState().startLiveSession("a-iris", "z2");
    applyMessage({
      kind: "live-tick", athleteId: "a-iris", hr: 145, pace: 4.2, cadence: 170,
      elapsedSec: 1, at: new Date().toISOString(),
    });
    expect(useDashboardStore.getState().liveSessions["a-iris"].ticks.length).toBe(1);
  });

  it("ai-alert pushes once", () => {
    const a = {
      kind: "ai-alert" as const, id: "z", coachId: "c-marina", athleteId: "a-iris",
      rule: "hrv-down" as const, recommendation: "lighter-day" as const,
      body: "x", at: new Date().toISOString(),
    };
    applyMessage(a);
    applyMessage(a);
    expect(useDashboardStore.getState().aiAlerts.length).toBe(1);
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```ts
// lib/realtime/handlers.ts
import { useDashboardStore } from "@/lib/dashboard-store";
import type { LiveSessionIntent } from "@/lib/dashboard/types";
import type { RealtimeMessage } from "./types";

export function applyMessage(m: RealtimeMessage) {
  const st = useDashboardStore.getState();
  switch (m.kind) {
    case "session-start":
      st.startLiveSession(m.athleteId, "z2" as LiveSessionIntent);
      return;
    case "live-tick":
      if (st.liveSessions[m.athleteId]) st.appendLiveTick(m.athleteId, m);
      return;
    case "session-end":
      st.endLiveSession(m.athleteId);
      return;
    case "reaction":
      st.addReaction(m.achievementId, m);
      return;
    case "ai-alert":
      st.pushAIAlert(m);
      return;
    default:
      return;
  }
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add lib/realtime/handlers.ts lib/realtime/handlers.test.ts
git commit -m "feat(realtime): apply messages to dashboard store"
```

---

### Task 28: Haptics wrapper

**Files:**
- Create: `lib/pwa/haptics.ts`
- Test: `lib/pwa/haptics.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/pwa/haptics.test.ts
import { describe, it, expect, vi } from "vitest";
import { tap, success, warn } from "./haptics";

describe("haptics", () => {
  it("calls navigator.vibrate when available", () => {
    const v = vi.fn();
    Object.defineProperty(navigator, "vibrate", { value: v, configurable: true });
    tap();
    success();
    warn();
    expect(v).toHaveBeenCalledTimes(3);
  });
  it("does nothing if vibrate is missing", () => {
    Object.defineProperty(navigator, "vibrate", { value: undefined, configurable: true });
    expect(() => tap()).not.toThrow();
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```ts
// lib/pwa/haptics.ts
function buzz(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    navigator.vibrate(pattern);
  }
}
export const tap     = () => buzz(40);
export const success = () => buzz([20, 30, 60]);
export const warn    = () => buzz([60, 40, 60]);
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add lib/pwa/haptics.ts lib/pwa/haptics.test.ts
git commit -m "feat(pwa): add haptic feedback wrapper"
```

---

## Phase 7 — Loop A · Morning readiness handshake

### Task 29: `<ReadinessCard>`

**Files:**
- Create: `components/loops/morning-handshake/readiness-card.tsx`
- Test: `components/loops/morning-handshake/readiness-card.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// components/loops/morning-handshake/readiness-card.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReadinessCard } from "./readiness-card";

describe("<ReadinessCard />", () => {
  const props = {
    percent: 78,
    hrv: 64, hrvDelta: +4,
    sleepHours: "7h 22m",
    coachName: "Marina",
    intent: "Z2 base · 45 min",
  };
  it("renders the readiness ring", () => {
    render(<ReadinessCard {...props} />);
    expect(screen.getByText("78")).toBeInTheDocument();
    expect(screen.getByText("Readiness")).toBeInTheDocument();
  });
  it("shows HRV delta with sign", () => {
    render(<ReadinessCard {...props} />);
    expect(screen.getByText(/\+4/)).toBeInTheDocument();
  });
  it("references coach name", () => {
    render(<ReadinessCard {...props} />);
    expect(screen.getByText(/Marina/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```tsx
// components/loops/morning-handshake/readiness-card.tsx
import { GlassCard } from "@/components/ui-glass/glass-card";
import { Pill } from "@/components/ui-glass/pill";
import { ReadinessRing } from "@/components/ui-glass/readiness-ring";

export function ReadinessCard({
  percent, hrv, hrvDelta, sleepHours, coachName, intent,
}: {
  percent: number;
  hrv: number;
  hrvDelta: number;
  sleepHours: string;
  coachName: string;
  intent: string;
}) {
  const sign = hrvDelta > 0 ? "+" : "";
  return (
    <GlassCard tone="active" className="flex items-center gap-5">
      <ReadinessRing percent={percent} label="Readiness" size={108} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <Pill>Today</Pill>
          <span className="text-xs text-ink-400">From {coachName}</span>
        </div>
        <p className="text-lg font-semibold leading-tight">{intent}</p>
        <div className="flex gap-4 mt-3 text-xs text-ink-300">
          <span>HRV <span className="text-ink-100 font-semibold">{hrv}</span> <span className="text-volt-500">{sign}{hrvDelta}</span></span>
          <span>Sleep <span className="text-ink-100 font-semibold">{sleepHours}</span></span>
        </div>
      </div>
    </GlassCard>
  );
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add components/loops/morning-handshake/readiness-card.tsx components/loops/morning-handshake/readiness-card.test.tsx
git commit -m "feat(loop-a): add ReadinessCard"
```

---

### Task 30: `<RosterHeatmap>` (coach side)

**Files:**
- Create: `components/loops/morning-handshake/roster-heatmap.tsx`
- Test: `components/loops/morning-handshake/roster-heatmap.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// components/loops/morning-handshake/roster-heatmap.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RosterHeatmap } from "./roster-heatmap";

const athletes = [
  { id: "a1", name: "Iris",   readiness: 82, hrvDelta: +4 },
  { id: "a2", name: "João",   readiness: 58, hrvDelta: -2 },
  { id: "a3", name: "Sofia",  readiness: 28, hrvDelta: -10 },
];

describe("<RosterHeatmap />", () => {
  it("renders one tile per athlete", () => {
    render(<RosterHeatmap athletes={athletes} onSelect={() => {}} />);
    expect(screen.getAllByRole("button").length).toBe(3);
  });
  it("calls onSelect with the id", async () => {
    const fn = vi.fn();
    render(<RosterHeatmap athletes={athletes} onSelect={fn} />);
    await userEvent.click(screen.getByRole("button", { name: /Iris/ }));
    expect(fn).toHaveBeenCalledWith("a1");
  });
  it("shows red tile for low readiness", () => {
    render(<RosterHeatmap athletes={athletes} onSelect={() => {}} />);
    const sofia = screen.getByRole("button", { name: /Sofia/ });
    expect(sofia.className).toMatch(/bg-coral-500/);
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```tsx
// components/loops/morning-handshake/roster-heatmap.tsx
import { cn } from "@/lib/utils";

type Athlete = { id: string; name: string; readiness: number; hrvDelta: number };

function tone(r: number): string {
  if (r >= 65) return "bg-volt-500/90 text-ink-950";
  if (r >= 40) return "bg-amber-400/90 text-ink-950";
  return "bg-coral-500/90 text-ink-50";
}

export function RosterHeatmap({
  athletes, onSelect,
}: {
  athletes: Athlete[];
  onSelect: (id: string) => void;
}) {
  return (
    <ul className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {athletes.map((a) => (
        <li key={a.id}>
          <button
            type="button"
            aria-label={`${a.name}, readiness ${a.readiness}`}
            onClick={() => onSelect(a.id)}
            className={cn(
              "w-full aspect-square rounded-2xl p-3 text-left transition-all hover:-translate-y-0.5",
              tone(a.readiness),
            )}
          >
            <p className="text-xs font-extrabold uppercase truncate">{a.name}</p>
            <p className="text-3xl font-black mt-2">{a.readiness}</p>
            <p className="text-[10px] uppercase tracking-wider opacity-80">
              HRV {a.hrvDelta > 0 ? "+" : ""}{a.hrvDelta}
            </p>
          </button>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add components/loops/morning-handshake/roster-heatmap.tsx components/loops/morning-handshake/roster-heatmap.test.tsx
git commit -m "feat(loop-a): add RosterHeatmap"
```

---

### Task 31: `<QuickDiffChips>` and `<PlanUpdateBanner>`

**Files:**
- Create: `components/loops/morning-handshake/quick-diff-chips.tsx`
- Create: `components/loops/morning-handshake/plan-update-banner.tsx`
- Test: `components/loops/morning-handshake/quick-diff-chips.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// components/loops/morning-handshake/quick-diff-chips.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuickDiffChips } from "./quick-diff-chips";

describe("<QuickDiffChips />", () => {
  it("emits the chosen diff key", async () => {
    const fn = vi.fn();
    render(<QuickDiffChips onPick={fn} />);
    await userEvent.click(screen.getByRole("button", { name: /Lighter day/i }));
    expect(fn).toHaveBeenCalledWith("lighter-day");
  });

  it("renders all 3 chips", () => {
    render(<QuickDiffChips onPick={() => {}} />);
    expect(screen.getAllByRole("button").length).toBe(3);
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```tsx
// components/loops/morning-handshake/quick-diff-chips.tsx
"use client";

import type { PlanUpdate } from "@/lib/realtime/types";

const CHIPS: Array<{ key: PlanUpdate["diff"]; label: string }> = [
  { key: "lighter-day", label: "Lighter day" },
  { key: "swap-z2", label: "Swap to Z2" },
  { key: "add-recovery", label: "Add recovery" },
];

export function QuickDiffChips({ onPick }: { onPick: (k: PlanUpdate["diff"]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {CHIPS.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={() => onPick(c.key)}
          className="h-9 px-4 rounded-full bg-glass-md border border-glass-border text-sm font-semibold text-ink-100 hover:bg-glass-volt hover:border-volt-500/40"
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
```

```tsx
// components/loops/morning-handshake/plan-update-banner.tsx
"use client";

import { GlassCard } from "@/components/ui-glass/glass-card";
import { VoltButton } from "@/components/ui-glass/volt-button";

const LABELS: Record<string, string> = {
  "lighter-day": "Lighter day",
  "swap-z2": "Swap to Z2",
  "add-recovery": "Add recovery",
  "custom": "Plan update",
};

export function PlanUpdateBanner({
  coachName, diff, onApply, onDismiss,
}: {
  coachName: string;
  diff: keyof typeof LABELS;
  onApply: () => void;
  onDismiss: () => void;
}) {
  return (
    <GlassCard tone="live" className="flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase tracking-[0.18em] text-volt-500">{coachName} updated today</p>
        <p className="font-semibold">{LABELS[diff] ?? "Plan update"}</p>
      </div>
      <button onClick={onDismiss} className="text-sm text-ink-300 hover:text-ink-100">Keep</button>
      <VoltButton onClick={onApply}>Apply</VoltButton>
    </GlassCard>
  );
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add components/loops/morning-handshake/
git commit -m "feat(loop-a): add QuickDiffChips + PlanUpdateBanner"
```

---

### Task 32: Wire morning handshake — coach broadcasts, athlete listens

**Files:**
- Create: `components/loops/morning-handshake/use-coach-broadcaster.ts`
- Create: `components/loops/morning-handshake/use-athlete-listener.ts`
- Test: `components/loops/morning-handshake/integration.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// components/loops/morning-handshake/integration.test.tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCoachBroadcaster } from "./use-coach-broadcaster";
import { useAthleteListener } from "./use-athlete-listener";

class FakeBC {
  static instances: FakeBC[] = [];
  listeners: Array<(e: MessageEvent) => void> = [];
  constructor(public name: string) { FakeBC.instances.push(this); }
  postMessage(d: unknown) {
    for (const i of FakeBC.instances) {
      if (i === this || i.name !== this.name) continue;
      for (const l of i.listeners) l(new MessageEvent("message", { data: d }));
    }
  }
  addEventListener(_: "message", l: (e: MessageEvent) => void) { this.listeners.push(l); }
  removeEventListener() {}
  close() {}
}

describe("morning handshake integration", () => {
  beforeEach(() => {
    FakeBC.instances = [];
    (globalThis as any).BroadcastChannel = FakeBC as unknown as typeof BroadcastChannel;
  });

  it("athlete sees the diff coach published", () => {
    const coach = renderHook(() => useCoachBroadcaster("c-marina"));
    const athlete = renderHook(() => useAthleteListener("a-iris"));
    act(() => {
      coach.result.current.publishDiff({
        planId: "p-1", athleteId: "a-iris", diff: "lighter-day",
      });
    });
    expect(athlete.result.current.pendingDiff?.diff).toBe("lighter-day");
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```ts
// components/loops/morning-handshake/use-coach-broadcaster.ts
"use client";
import { useChannel } from "@/lib/realtime/use-channel";
import type { PlanUpdate } from "@/lib/realtime/types";

export function useCoachBroadcaster(coachId: string) {
  const roster = useChannel(`roster:${coachId}`);
  return {
    publishDiff: (p: { planId: string; athleteId: string; diff: PlanUpdate["diff"] }) => {
      const msg: PlanUpdate = {
        kind: "plan-update",
        planId: p.planId,
        athleteId: p.athleteId,
        coachId,
        diff: p.diff,
        at: new Date().toISOString(),
        origin: "coach",
      };
      roster.send(msg);
      // also send to athlete-specific channel for granular subscribers
      const ch = new BroadcastChannel(`athlete:${p.athleteId}`);
      ch.postMessage(msg);
      ch.close();
    },
  };
}
```

```ts
// components/loops/morning-handshake/use-athlete-listener.ts
"use client";
import { useEffect, useState } from "react";
import { useChannel } from "@/lib/realtime/use-channel";
import type { PlanUpdate } from "@/lib/realtime/types";

export function useAthleteListener(athleteId: string) {
  const ch = useChannel(`athlete:${athleteId}`);
  const [pendingDiff, setPendingDiff] = useState<PlanUpdate | null>(null);

  useEffect(() => {
    const last = ch.messages.at(-1);
    if (last && last.kind === "plan-update" && last.athleteId === athleteId) {
      setPendingDiff(last);
    }
  }, [ch.messages, athleteId]);

  return {
    pendingDiff,
    dismiss: () => setPendingDiff(null),
  };
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add components/loops/morning-handshake/use-coach-broadcaster.ts components/loops/morning-handshake/use-athlete-listener.ts components/loops/morning-handshake/integration.test.tsx
git commit -m "feat(loop-a): wire broadcaster + listener"
```

---

### Task 33: Apply diff to plan in store

**Files:**
- Modify: `lib/dashboard-store.ts` (add `applyPlanDiff` action)
- Test: `lib/dashboard/apply-plan-diff.test.ts`

Diff templates change the plan blocks deterministically.

- [ ] **Step 1: Write the failing test**

```ts
// lib/dashboard/apply-plan-diff.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { useDashboardStore } from "@/lib/dashboard-store";

describe("applyPlanDiff", () => {
  beforeEach(() => useDashboardStore.getState().resetDemo());

  it("lighter-day reduces today's intensity tag", () => {
    const planId = useDashboardStore.getState().plans[0].id;
    useDashboardStore.getState().applyPlanDiff(planId, "lighter-day");
    const plan = useDashboardStore.getState().plans.find((p) => p.id === planId)!;
    const today = plan.blocks[0];
    expect(today.intensity.toLowerCase()).toMatch(/light|easy|recovery/);
  });

  it("swap-z2 retitles today to Z2", () => {
    const planId = useDashboardStore.getState().plans[0].id;
    useDashboardStore.getState().applyPlanDiff(planId, "swap-z2");
    const plan = useDashboardStore.getState().plans.find((p) => p.id === planId)!;
    expect(plan.blocks[0].title.toLowerCase()).toContain("z2");
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

Add to `DashboardStore` type:

```ts
applyPlanDiff: (planId: string, diff: "lighter-day" | "swap-z2" | "add-recovery") => void;
```

Add factory action:

```ts
applyPlanDiff: (planId, diff) =>
  set((s) => ({
    plans: s.plans.map((p) => {
      if (p.id !== planId) return p;
      const blocks = p.blocks.map((b, i) => {
        if (i !== 0) return b;
        if (diff === "lighter-day") return { ...b, intensity: "Light · RPE 4" };
        if (diff === "swap-z2") return { ...b, title: "Z2 base · 45 min", intensity: "Z2 · RPE 5" };
        if (diff === "add-recovery") return { ...b, title: "Active recovery", intensity: "Recovery · RPE 2" };
        return b;
      });
      return { ...p, blocks, updatedAt: new Date().toISOString() };
    }),
  })),
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add lib/dashboard-store.ts lib/dashboard/apply-plan-diff.test.ts
git commit -m "feat(store): apply quick diff templates to plan"
```

---

## Phase 8 — Loop B · Live training companion

### Task 34: `<SessionCard>` (athlete entry)

**Files:**
- Create: `components/loops/live-session/session-card.tsx`
- Test: `components/loops/live-session/session-card.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// components/loops/live-session/session-card.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SessionCard } from "./session-card";

describe("<SessionCard />", () => {
  it("renders the session title and duration", () => {
    render(<SessionCard title="Z2 base" durationMin={45} intent="z2" onStart={() => {}} />);
    expect(screen.getByText("Z2 base")).toBeInTheDocument();
    expect(screen.getByText(/45 min/)).toBeInTheDocument();
  });
  it("calls onStart when Start tapped", async () => {
    const fn = vi.fn();
    render(<SessionCard title="x" durationMin={10} intent="z2" onStart={fn} />);
    await userEvent.click(screen.getByRole("button", { name: /Start/i }));
    expect(fn).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```tsx
// components/loops/live-session/session-card.tsx
"use client";

import { GlassCard } from "@/components/ui-glass/glass-card";
import { VoltButton } from "@/components/ui-glass/volt-button";
import { Pill } from "@/components/ui-glass/pill";
import { MorphCard } from "@/components/shell/morph-card";
import type { LiveSessionIntent } from "@/lib/dashboard/types";

export function SessionCard({
  title, durationMin, intent, morphId, onStart,
}: {
  title: string;
  durationMin: number;
  intent: LiveSessionIntent;
  morphId?: string;
  onStart: () => void;
}) {
  const inner = (
    <GlassCard tone="default" className="flex items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Pill>Today</Pill>
          <span className="text-xs uppercase tracking-[0.18em] text-ink-400">{intent}</span>
        </div>
        <p className="text-lg font-semibold">{title}</p>
        <p className="text-sm text-ink-300">{durationMin} min</p>
      </div>
      <VoltButton onClick={onStart}>Start</VoltButton>
    </GlassCard>
  );
  return morphId ? <MorphCard morphId={morphId}>{inner}</MorphCard> : inner;
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add components/loops/live-session/session-card.tsx components/loops/live-session/session-card.test.tsx
git commit -m "feat(loop-b): add SessionCard (athlete entry)"
```

---

### Task 35: `<LiveMetrics>`

**Files:**
- Create: `components/loops/live-session/live-metrics.tsx`
- Test: `components/loops/live-session/live-metrics.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// components/loops/live-session/live-metrics.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LiveMetrics } from "./live-metrics";

describe("<LiveMetrics />", () => {
  it("renders current HR and elapsed", () => {
    render(<LiveMetrics hr={142} pace={4.6} cadence={170} elapsedSec={1234} ticks={[140,141,142]} />);
    expect(screen.getByText("142")).toBeInTheDocument();
    expect(screen.getByText(/20:34/)).toBeInTheDocument();
  });
  it("renders pace with 1 decimal", () => {
    render(<LiveMetrics hr={140} pace={4.563} cadence={170} elapsedSec={0} ticks={[140]} />);
    expect(screen.getByText("4.6")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```tsx
// components/loops/live-session/live-metrics.tsx
import { GlassCard } from "@/components/ui-glass/glass-card";
import { HRRibbon } from "@/components/ui-glass/hr-ribbon";

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function LiveMetrics({
  hr, pace, cadence, elapsedSec, ticks,
}: {
  hr: number; pace: number; cadence: number; elapsedSec: number; ticks: number[];
}) {
  return (
    <GlassCard tone="live" className="space-y-4">
      <div className="flex items-end gap-6">
        <Stat label="HR" value={String(hr)} unit="bpm" big />
        <Stat label="Pace" value={pace.toFixed(1)} unit="min/km" />
        <Stat label="Cadence" value={String(cadence)} unit="spm" />
        <div className="ml-auto text-right">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-400">Elapsed</p>
          <p className="text-2xl font-bold tabular-nums">{fmt(elapsedSec)}</p>
        </div>
      </div>
      <HRRibbon data={ticks.slice(-30)} />
    </GlassCard>
  );
}

function Stat({ label, value, unit, big }: { label: string; value: string; unit: string; big?: boolean }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-ink-400">{label}</p>
      <p className={big ? "text-5xl font-black bg-grad-text bg-clip-text text-transparent tabular-nums" : "text-2xl font-bold tabular-nums"}>{value}</p>
      <p className="text-xs text-ink-400">{unit}</p>
    </div>
  );
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add components/loops/live-session/live-metrics.tsx components/loops/live-session/live-metrics.test.tsx
git commit -m "feat(loop-b): add LiveMetrics card"
```

---

### Task 36: `<NudgeBar>` (coach side)

**Files:**
- Create: `components/loops/live-session/nudge-bar.tsx`
- Test: `components/loops/live-session/nudge-bar.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// components/loops/live-session/nudge-bar.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NudgeBar } from "./nudge-bar";

describe("<NudgeBar />", () => {
  it("calls onNudge with the variant", async () => {
    const fn = vi.fn();
    render(<NudgeBar onNudge={fn} />);
    await userEvent.click(screen.getByRole("button", { name: /Push/i }));
    expect(fn).toHaveBeenCalledWith("push");
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```tsx
// components/loops/live-session/nudge-bar.tsx
"use client";

import { ArrowDown, ArrowUp, Sparkles } from "lucide-react";
import type { Nudge } from "@/lib/realtime/types";

export function NudgeBar({ onNudge }: { onNudge: (v: Nudge["variant"]) => void }) {
  const opts: Array<{ key: Nudge["variant"]; label: string; Icon: typeof ArrowDown }> = [
    { key: "slow-down", label: "Slow down", Icon: ArrowDown },
    { key: "push", label: "Push", Icon: ArrowUp },
    { key: "great-work", label: "Great work", Icon: Sparkles },
  ];
  return (
    <div className="flex gap-2">
      {opts.map(({ key, label, Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onNudge(key)}
          className="flex-1 h-12 rounded-full bg-glass-md border border-glass-border hover:bg-glass-volt hover:border-volt-500/40 inline-flex items-center justify-center gap-2 font-semibold"
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add components/loops/live-session/nudge-bar.tsx components/loops/live-session/nudge-bar.test.tsx
git commit -m "feat(loop-b): add NudgeBar (coach side)"
```

---

### Task 37: `<NudgeToast>` (athlete side)

**Files:**
- Create: `components/loops/live-session/nudge-toast.tsx`
- Test: `components/loops/live-session/nudge-toast.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// components/loops/live-session/nudge-toast.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NudgeToast } from "./nudge-toast";

describe("<NudgeToast />", () => {
  it("shows the variant label", () => {
    render(<NudgeToast variant="push" coachName="Marina" />);
    expect(screen.getByText(/Marina/)).toBeInTheDocument();
    expect(screen.getByText(/Push/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```tsx
// components/loops/live-session/nudge-toast.tsx
import type { Nudge } from "@/lib/realtime/types";
import { GlassCard } from "@/components/ui-glass/glass-card";

const COPY: Record<Nudge["variant"], string> = {
  "slow-down": "Slow down",
  "push": "Push it!",
  "great-work": "Great work",
};

export function NudgeToast({ variant, coachName }: { variant: Nudge["variant"]; coachName: string }) {
  return (
    <GlassCard tone="live" className="flex items-center gap-3">
      <span className="h-2.5 w-2.5 rounded-full bg-volt-500 animate-pulse" />
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-volt-500">{coachName}</p>
        <p className="font-semibold">{COPY[variant]}</p>
      </div>
    </GlassCard>
  );
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add components/loops/live-session/nudge-toast.tsx components/loops/live-session/nudge-toast.test.tsx
git commit -m "feat(loop-b): add NudgeToast (athlete side)"
```

---

### Task 38: `<SessionSummary>`

**Files:**
- Create: `components/loops/live-session/session-summary.tsx`
- Test: `components/loops/live-session/session-summary.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// components/loops/live-session/session-summary.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SessionSummary } from "./session-summary";

describe("<SessionSummary />", () => {
  it("renders all stats", () => {
    render(<SessionSummary distanceKm={10.5} avgHr={142} maxHr={172} durationSec={3600} />);
    expect(screen.getByText("10.5")).toBeInTheDocument();
    expect(screen.getByText("142")).toBeInTheDocument();
    expect(screen.getByText("172")).toBeInTheDocument();
    expect(screen.getByText(/60:00/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```tsx
// components/loops/live-session/session-summary.tsx
import { GlassCard } from "@/components/ui-glass/glass-card";

function fmt(s: number) {
  const m = Math.floor(s / 60), r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function SessionSummary({
  distanceKm, avgHr, maxHr, durationSec,
}: {
  distanceKm: number; avgHr: number; maxHr: number; durationSec: number;
}) {
  return (
    <GlassCard tone="active" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <Stat label="Distance" value={distanceKm.toFixed(1)} unit="km" />
      <Stat label="Avg HR" value={String(avgHr)} unit="bpm" />
      <Stat label="Max HR" value={String(maxHr)} unit="bpm" />
      <Stat label="Time" value={fmt(durationSec)} unit="" />
    </GlassCard>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-ink-400">{label}</p>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      {unit && <p className="text-xs text-ink-400">{unit}</p>}
    </div>
  );
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add components/loops/live-session/session-summary.tsx components/loops/live-session/session-summary.test.tsx
git commit -m "feat(loop-b): add SessionSummary"
```

---

### Task 39: Wire live session — start/tick/end + nudges

**Files:**
- Create: `components/loops/live-session/use-live-session.ts`
- Test: `components/loops/live-session/use-live-session.test.tsx`

The hook owns the synthetic ticker + channel send + store update.

- [ ] **Step 1: Write the failing test**

```tsx
// components/loops/live-session/use-live-session.test.tsx
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLiveSession } from "./use-live-session";

describe("useLiveSession (athlete)", () => {
  it("start opens session, tick mutates state, end closes session", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useLiveSession({ athleteId: "a-iris", intent: "z2" }));
    act(() => result.current.start());
    expect(result.current.isActive).toBe(true);
    act(() => { vi.advanceTimersByTime(3500); });
    expect(result.current.ticks.length).toBeGreaterThanOrEqual(2);
    act(() => result.current.end());
    expect(result.current.isActive).toBe(false);
    vi.useRealTimers();
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```ts
// components/loops/live-session/use-live-session.ts
"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import { useChannel } from "@/lib/realtime/use-channel";
import { startTicker } from "@/lib/realtime/synthetic";
import type { LiveSessionIntent } from "@/lib/dashboard/types";
import type { LiveTick, SessionStart, SessionEnd } from "@/lib/realtime/types";

export function useLiveSession({
  athleteId, intent,
}: {
  athleteId: string;
  intent: LiveSessionIntent;
}) {
  const ch = useChannel(`athlete:${athleteId}`);
  const [isActive, setActive] = useState(false);
  const [ticks, setTicks] = useState<LiveTick[]>([]);
  const stopRef = useRef<null | (() => void)>(null);

  const start = useCallback(() => {
    setTicks([]);
    setActive(true);
    const sessionStart: SessionStart = {
      kind: "session-start",
      athleteId,
      sessionId: `live-${Date.now()}`,
      at: new Date().toISOString(),
    };
    ch.send(sessionStart);
    stopRef.current = startTicker({
      athleteId, intent, intervalMs: 1500,
      sendTick: (t) => {
        setTicks((p) => [...p, t]);
        ch.send(t);
      },
    });
  }, [athleteId, intent, ch]);

  const end = useCallback(() => {
    stopRef.current?.();
    stopRef.current = null;
    setActive(false);
    const last = ticks.at(-1);
    const sessionEnd: SessionEnd = {
      kind: "session-end",
      athleteId,
      sessionId: `live-${Date.now()}`,
      summary: {
        distanceKm: +(((last?.elapsedSec ?? 0) / 60) * (60 / 4.5) / 10).toFixed(1),
        avgHr: ticks.length ? Math.round(ticks.reduce((s, t) => s + t.hr, 0) / ticks.length) : 0,
        maxHr: ticks.reduce((m, t) => Math.max(m, t.hr), 0),
        durationSec: last?.elapsedSec ?? 0,
      },
      at: new Date().toISOString(),
    };
    ch.send(sessionEnd);
  }, [ch, ticks, athleteId]);

  const last = ticks.at(-1);
  return useMemo(() => ({
    isActive,
    ticks,
    hr: last?.hr ?? 0,
    pace: last?.pace ?? 0,
    cadence: last?.cadence ?? 0,
    elapsedSec: last?.elapsedSec ?? 0,
    start, end,
  }), [isActive, ticks, last, start, end]);
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add components/loops/live-session/use-live-session.ts components/loops/live-session/use-live-session.test.tsx
git commit -m "feat(loop-b): wire useLiveSession with synthetic ticker + channel"
```

---

## Phase 9 — Loop D · Celebrations & streaks

### Task 40: PR detection

**Files:**
- Create: `lib/ai/pr-detection.ts`
- Test: `lib/ai/pr-detection.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/ai/pr-detection.test.ts
import { describe, it, expect } from "vitest";
import { detectPRs, type SessionRecord } from "./pr-detection";

const history: SessionRecord[] = [
  { athleteId: "a", at: "2026-05-10", distanceKm: 8.0, durationSec: 2400, avgHr: 140, maxHr: 162 },
  { athleteId: "a", at: "2026-05-12", distanceKm: 9.0, durationSec: 2700, avgHr: 142, maxHr: 165 },
];

describe("detectPRs", () => {
  it("flags a longest-distance PR", () => {
    const prs = detectPRs({
      athleteId: "a", at: "2026-05-15",
      distanceKm: 12.0, durationSec: 3600, avgHr: 145, maxHr: 168,
    }, history);
    expect(prs.some((p) => p.metric === "distanceKm")).toBe(true);
    expect(prs[0].value).toBe(12);
  });

  it("returns empty when nothing is best", () => {
    const prs = detectPRs({
      athleteId: "a", at: "2026-05-15",
      distanceKm: 5.0, durationSec: 1800, avgHr: 138, maxHr: 160,
    }, history);
    expect(prs).toEqual([]);
  });

  it("flags maxHr PR", () => {
    const prs = detectPRs({
      athleteId: "a", at: "2026-05-15",
      distanceKm: 5.0, durationSec: 1800, avgHr: 138, maxHr: 175,
    }, history);
    expect(prs.some((p) => p.metric === "maxHr")).toBe(true);
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```ts
// lib/ai/pr-detection.ts
export type SessionRecord = {
  athleteId: string;
  at: string;
  distanceKm: number;
  durationSec: number;
  avgHr: number;
  maxHr: number;
};

export type PRMetric = "distanceKm" | "durationSec" | "maxHr";

export type PR = {
  athleteId: string;
  metric: PRMetric;
  value: number;
  prevBest: number;
  at: string;
};

export function detectPRs(latest: SessionRecord, history: SessionRecord[]): PR[] {
  const past = history.filter((h) => h.athleteId === latest.athleteId);
  const out: PR[] = [];
  for (const m of ["distanceKm", "durationSec", "maxHr"] as PRMetric[]) {
    const prev = past.length ? Math.max(...past.map((h) => h[m])) : -Infinity;
    if (latest[m] > prev) {
      out.push({ athleteId: latest.athleteId, metric: m, value: latest[m], prevBest: prev === -Infinity ? 0 : prev, at: latest.at });
    }
  }
  return out;
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add lib/ai/pr-detection.ts lib/ai/pr-detection.test.ts
git commit -m "feat(ai): add PR detection (distance/duration/maxHr)"
```

---

### Task 41: `<CelebrationOverlay>`

**Files:**
- Create: `components/loops/celebrations/celebration-overlay.tsx`
- Test: `components/loops/celebrations/celebration-overlay.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// components/loops/celebrations/celebration-overlay.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { CelebrationOverlay } from "./celebration-overlay";

describe("<CelebrationOverlay />", () => {
  it("auto-dismisses after the timeout", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    render(<CelebrationOverlay title="New PR" value="12 km" onClose={fn} />);
    expect(screen.getByText("12 km")).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(2200); });
    expect(fn).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```tsx
// components/loops/celebrations/celebration-overlay.tsx
"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";

export function CelebrationOverlay({
  title, value, onClose, durationMs = 2000,
}: {
  title: string; value: string; onClose: () => void; durationMs?: number;
}) {
  useEffect(() => {
    const id = setTimeout(onClose, durationMs);
    return () => clearTimeout(id);
  }, [onClose, durationMs]);

  return (
    <motion.div
      role="alertdialog"
      aria-label={`${title} ${value}`}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 grid place-items-center pointer-events-none"
      style={{
        background: "radial-gradient(80% 80% at 50% 50%, rgba(199,251,58,.18), rgba(7,8,10,.6))",
      }}
    >
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.32em] text-volt-500">{title}</p>
        <p className="text-7xl sm:text-8xl font-black bg-grad-text bg-clip-text text-transparent leading-none mt-2">{value}</p>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add components/loops/celebrations/celebration-overlay.tsx components/loops/celebrations/celebration-overlay.test.tsx
git commit -m "feat(loop-d): add CelebrationOverlay"
```

---

### Task 42: `<ReactionRow>`

**Files:**
- Create: `components/loops/celebrations/reaction-row.tsx`
- Test: `components/loops/celebrations/reaction-row.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// components/loops/celebrations/reaction-row.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReactionRow } from "./reaction-row";

describe("<ReactionRow />", () => {
  it("emits selected emoji", async () => {
    const fn = vi.fn();
    render(<ReactionRow onReact={fn} />);
    await userEvent.click(screen.getByRole("button", { name: "🔥" }));
    expect(fn).toHaveBeenCalledWith("🔥");
  });
  it("renders 5 emoji choices", () => {
    render(<ReactionRow onReact={() => {}} />);
    expect(screen.getAllByRole("button").length).toBe(5);
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```tsx
// components/loops/celebrations/reaction-row.tsx
"use client";
import type { Reaction } from "@/lib/realtime/types";

const EMOJIS: Reaction["emoji"][] = ["🔥", "⚡", "💪", "👏", "🚀"];

export function ReactionRow({ onReact }: { onReact: (e: Reaction["emoji"]) => void }) {
  return (
    <div className="flex gap-2">
      {EMOJIS.map((e) => (
        <button
          key={e}
          type="button"
          aria-label={e}
          onClick={() => onReact(e)}
          className="h-12 w-12 rounded-full bg-glass-md border border-glass-border text-xl hover:bg-glass-volt hover:border-volt-500/40 active:scale-95 transition-transform"
        >
          {e}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add components/loops/celebrations/reaction-row.tsx components/loops/celebrations/reaction-row.test.tsx
git commit -m "feat(loop-d): add ReactionRow"
```

---

### Task 43: `<StreakCard>`

**Files:**
- Create: `components/loops/celebrations/streak-card.tsx`
- Test: `components/loops/celebrations/streak-card.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// components/loops/celebrations/streak-card.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StreakCard } from "./streak-card";

describe("<StreakCard />", () => {
  it("renders streak count + co-name", () => {
    render(<StreakCard days={47} coName="Marina" />);
    expect(screen.getByText("47")).toBeInTheDocument();
    expect(screen.getByText(/Marina/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```tsx
// components/loops/celebrations/streak-card.tsx
import { GlassCard } from "@/components/ui-glass/glass-card";

export function StreakCard({ days, coName }: { days: number; coName: string }) {
  return (
    <GlassCard tone="active" className="flex items-center gap-4">
      <div className="h-14 w-14 rounded-full bg-grad-pulse grid place-items-center text-ink-950 font-black text-xl">{days}</div>
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-ink-400">Shared streak</p>
        <p className="font-semibold">Training with {coName}</p>
        <p className="text-sm text-ink-300">{days} consecutive days</p>
      </div>
    </GlassCard>
  );
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add components/loops/celebrations/streak-card.tsx components/loops/celebrations/streak-card.test.tsx
git commit -m "feat(loop-d): add StreakCard"
```

---

### Task 44: Wire celebration channel

**Files:**
- Create: `components/loops/celebrations/use-celebrations.ts`
- Test: `components/loops/celebrations/use-celebrations.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// components/loops/celebrations/use-celebrations.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCelebrations } from "./use-celebrations";

class FakeBC {
  static instances: FakeBC[] = [];
  listeners: Array<(e: MessageEvent) => void> = [];
  constructor(public name: string) { FakeBC.instances.push(this); }
  postMessage(d: unknown) {
    for (const i of FakeBC.instances) {
      if (i === this || i.name !== this.name) continue;
      for (const l of i.listeners) l(new MessageEvent("message", { data: d }));
    }
  }
  addEventListener(_: "message", l: (e: MessageEvent) => void) { this.listeners.push(l); }
  removeEventListener() {}
  close() {}
}

describe("useCelebrations", () => {
  beforeEach(() => {
    FakeBC.instances = [];
    (globalThis as any).BroadcastChannel = FakeBC as unknown as typeof BroadcastChannel;
  });

  it("publishAchievement reaches listeners on athlete channel", () => {
    const author = renderHook(() => useCelebrations("a-iris"));
    const watcher = renderHook(() => useCelebrations("a-iris"));
    act(() => {
      author.result.current.publishAchievement({
        title: "New PR · Distance",
        metric: "distanceKm",
        value: 12,
      });
    });
    expect(watcher.result.current.lastAchievement?.metric).toBe("distanceKm");
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```ts
// components/loops/celebrations/use-celebrations.ts
"use client";
import { useEffect, useState } from "react";
import { useChannel } from "@/lib/realtime/use-channel";
import type { Achievement, Reaction } from "@/lib/realtime/types";

export function useCelebrations(athleteId: string) {
  const ch = useChannel(`celebration:${athleteId}`);
  const [lastAchievement, setLast] = useState<Achievement | null>(null);
  const [reactions, setReactions] = useState<Reaction[]>([]);

  useEffect(() => {
    const m = ch.messages.at(-1);
    if (!m) return;
    if (m.kind === "achievement" && m.athleteId === athleteId) setLast(m);
    if (m.kind === "reaction" && m.athleteId === athleteId) setReactions((p) => [...p, m]);
  }, [ch.messages, athleteId]);

  return {
    lastAchievement,
    reactions,
    publishAchievement: (a: { title: string; metric: string; value: number }) =>
      ch.send({
        kind: "achievement",
        athleteId,
        title: a.title,
        metric: a.metric,
        value: a.value,
        at: new Date().toISOString(),
      }),
    publishReaction: (achievementId: string, emoji: Reaction["emoji"], fromName: string) =>
      ch.send({
        kind: "reaction",
        achievementId,
        athleteId,
        emoji,
        fromName,
        at: new Date().toISOString(),
      }),
    clearAchievement: () => setLast(null),
  };
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add components/loops/celebrations/use-celebrations.ts components/loops/celebrations/use-celebrations.test.tsx
git commit -m "feat(loop-d): wire celebration channel"
```

---

## Phase 10 — Loop E · AI co-pilot

### Task 45: Rules engine `evaluateRoster`

**Files:**
- Create: `lib/ai/rules.ts`
- Test: `lib/ai/rules.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/ai/rules.test.ts
import { describe, it, expect } from "vitest";
import { evaluateRoster, type AthleteSnapshot } from "./rules";

const baseAthlete = (over: Partial<AthleteSnapshot> = {}): AthleteSnapshot => ({
  id: "a-iris",
  name: "Iris",
  hrvSeries: [70, 70, 70, 70, 70, 70, 70],
  sleepSeries: [7.5, 7.5, 7.5, 7.5, 7.5, 7.5, 7.5],
  missedSessions: 0,
  ...over,
});

describe("evaluateRoster", () => {
  it("flags HRV-down when 3-day avg drops 15% vs 7-day", () => {
    const a = baseAthlete({
      hrvSeries: [70, 72, 68, 50, 48, 52, 45], // recent 3 avg ~48 vs 7-day ~58
    });
    const alerts = evaluateRoster([a], "c-marina");
    expect(alerts.find((al) => al.rule === "hrv-down")?.athleteId).toBe("a-iris");
  });

  it("flags sleep-low when 3-day avg < 6", () => {
    const a = baseAthlete({ sleepSeries: [7, 7, 7, 7, 5.5, 5.6, 5.4] });
    const alerts = evaluateRoster([a], "c-marina");
    expect(alerts.find((al) => al.rule === "sleep-low")).toBeTruthy();
  });

  it("flags missed-sessions when ≥3 missed in 14 days", () => {
    const a = baseAthlete({ missedSessions: 3 });
    const alerts = evaluateRoster([a], "c-marina");
    expect(alerts.find((al) => al.rule === "missed-sessions")).toBeTruthy();
  });

  it("returns empty when nothing fires", () => {
    expect(evaluateRoster([baseAthlete()], "c-marina")).toEqual([]);
  });

  it("alert id is stable per (athleteId, rule, day)", () => {
    const a = baseAthlete({ missedSessions: 3 });
    const today = "2026-05-17";
    const a1 = evaluateRoster([a], "c-marina", today);
    const a2 = evaluateRoster([a], "c-marina", today);
    expect(a1[0].id).toBe(a2[0].id);
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```ts
// lib/ai/rules.ts
import type { AICoPilotAlert } from "@/lib/realtime/types";

export type AthleteSnapshot = {
  id: string;
  name: string;
  hrvSeries: number[];
  sleepSeries: number[];
  missedSessions: number;
};

const avg = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0);

export function evaluateRoster(
  athletes: AthleteSnapshot[],
  coachId: string,
  today: string = new Date().toISOString().slice(0, 10),
): AICoPilotAlert[] {
  const alerts: AICoPilotAlert[] = [];

  for (const a of athletes) {
    const recent3 = avg(a.hrvSeries.slice(-3));
    const sevenDay = avg(a.hrvSeries.slice(-7));
    if (sevenDay > 0 && recent3 < sevenDay * 0.85) {
      alerts.push({
        kind: "ai-alert",
        id: `${a.id}-hrv-${today}`,
        coachId,
        athleteId: a.id,
        rule: "hrv-down",
        recommendation: "swap-z2",
        body: `${a.name}'s 3-day HRV is ${Math.round((1 - recent3 / sevenDay) * 100)}% below baseline. Suggest swapping today's intervals for Z2 base.`,
        at: new Date().toISOString(),
      });
    }

    const recentSleep = avg(a.sleepSeries.slice(-3));
    if (recentSleep && recentSleep < 6) {
      alerts.push({
        kind: "ai-alert",
        id: `${a.id}-sleep-${today}`,
        coachId,
        athleteId: a.id,
        rule: "sleep-low",
        recommendation: "recovery-day",
        body: `${a.name} averaged ${recentSleep.toFixed(1)}h of sleep over 3 days. Consider a recovery day.`,
        at: new Date().toISOString(),
      });
    }

    if (a.missedSessions >= 3) {
      alerts.push({
        kind: "ai-alert",
        id: `${a.id}-missed-${today}`,
        coachId,
        athleteId: a.id,
        rule: "missed-sessions",
        recommendation: "lighter-day",
        body: `${a.name} has missed ${a.missedSessions} sessions in 14 days. Reach out to re-engage.`,
        at: new Date().toISOString(),
      });
    }
  }

  return alerts;
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add lib/ai/rules.ts lib/ai/rules.test.ts
git commit -m "feat(ai): add evaluateRoster co-pilot rules"
```

---

### Task 46: `<AlertCard>`

**Files:**
- Create: `components/loops/ai-copilot/alert-card.tsx`
- Test: `components/loops/ai-copilot/alert-card.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// components/loops/ai-copilot/alert-card.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AlertCard } from "./alert-card";

const alert = {
  kind: "ai-alert" as const,
  id: "x",
  coachId: "c-marina",
  athleteId: "a-iris",
  rule: "hrv-down" as const,
  recommendation: "swap-z2" as const,
  body: "Iris's HRV is down 18%. Suggest Z2.",
  at: new Date().toISOString(),
};

describe("<AlertCard />", () => {
  it("approve calls onApprove with the alert", async () => {
    const fn = vi.fn();
    render(<AlertCard alert={alert} athleteName="Iris" onApprove={fn} onOpenAthlete={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: /Approve/i }));
    expect(fn).toHaveBeenCalledWith(alert);
  });
  it("Open athlete calls onOpenAthlete with id", async () => {
    const fn = vi.fn();
    render(<AlertCard alert={alert} athleteName="Iris" onApprove={() => {}} onOpenAthlete={fn} />);
    await userEvent.click(screen.getByRole("button", { name: /Open athlete/i }));
    expect(fn).toHaveBeenCalledWith("a-iris");
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```tsx
// components/loops/ai-copilot/alert-card.tsx
"use client";
import type { AICoPilotAlert } from "@/lib/realtime/types";
import { GlassCard } from "@/components/ui-glass/glass-card";
import { VoltButton } from "@/components/ui-glass/volt-button";
import { Pill } from "@/components/ui-glass/pill";

const RULE_LABEL: Record<AICoPilotAlert["rule"], string> = {
  "hrv-down": "HRV trend",
  "sleep-low": "Sleep deficit",
  "missed-sessions": "Adherence risk",
};

export function AlertCard({
  alert, athleteName, onApprove, onOpenAthlete,
}: {
  alert: AICoPilotAlert;
  athleteName: string;
  onApprove: (a: AICoPilotAlert) => void;
  onOpenAthlete: (athleteId: string) => void;
}) {
  return (
    <GlassCard tone="default" className="space-y-3">
      <div className="flex items-center gap-2">
        <Pill variant="amber">Co-pilot</Pill>
        <span className="text-xs uppercase tracking-[0.18em] text-ink-400">{RULE_LABEL[alert.rule]} · {athleteName}</span>
      </div>
      <p className="text-sm text-ink-200">{alert.body}</p>
      <div className="flex gap-2">
        <VoltButton onClick={() => onApprove(alert)}>Approve</VoltButton>
        <button
          type="button"
          onClick={() => onOpenAthlete(alert.athleteId)}
          className="h-11 px-4 rounded-full bg-glass-md border border-glass-border text-sm font-semibold hover:bg-glass-hi"
        >
          Open athlete
        </button>
      </div>
    </GlassCard>
  );
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add components/loops/ai-copilot/alert-card.tsx components/loops/ai-copilot/alert-card.test.tsx
git commit -m "feat(loop-e): add AlertCard"
```

---

### Task 47: `<AlertFeed>`

**Files:**
- Create: `components/loops/ai-copilot/alert-feed.tsx`
- Test: `components/loops/ai-copilot/alert-feed.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// components/loops/ai-copilot/alert-feed.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AlertFeed } from "./alert-feed";

const alerts = [
  { kind: "ai-alert" as const, id: "1", coachId: "c", athleteId: "a", rule: "hrv-down" as const, recommendation: "swap-z2" as const, body: "Iris HRV", at: new Date().toISOString() },
  { kind: "ai-alert" as const, id: "2", coachId: "c", athleteId: "b", rule: "sleep-low" as const, recommendation: "recovery-day" as const, body: "João sleep", at: new Date().toISOString() },
];

describe("<AlertFeed />", () => {
  it("renders one card per alert", () => {
    render(
      <AlertFeed
        alerts={alerts}
        athleteNameFor={(id) => id}
        onApprove={() => {}}
        onOpenAthlete={() => {}}
      />
    );
    expect(screen.getAllByRole("button", { name: /Approve/i }).length).toBe(2);
  });
  it("shows empty state when no alerts", () => {
    render(<AlertFeed alerts={[]} athleteNameFor={() => ""} onApprove={() => {}} onOpenAthlete={() => {}} />);
    expect(screen.getByText(/No co-pilot alerts/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```tsx
// components/loops/ai-copilot/alert-feed.tsx
import type { AICoPilotAlert } from "@/lib/realtime/types";
import { AlertCard } from "./alert-card";

export function AlertFeed({
  alerts, athleteNameFor, onApprove, onOpenAthlete,
}: {
  alerts: AICoPilotAlert[];
  athleteNameFor: (athleteId: string) => string;
  onApprove: (a: AICoPilotAlert) => void;
  onOpenAthlete: (id: string) => void;
}) {
  if (alerts.length === 0) {
    return (
      <p className="text-sm text-ink-400 italic">No co-pilot alerts. Roster is on track.</p>
    );
  }
  return (
    <ul className="space-y-3">
      {alerts.map((a) => (
        <li key={a.id}>
          <AlertCard
            alert={a}
            athleteName={athleteNameFor(a.athleteId)}
            onApprove={onApprove}
            onOpenAthlete={onOpenAthlete}
          />
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add components/loops/ai-copilot/alert-feed.tsx components/loops/ai-copilot/alert-feed.test.tsx
git commit -m "feat(loop-e): add AlertFeed"
```

---

### Task 48: Approve flow → broadcast plan-update

**Files:**
- Create: `components/loops/ai-copilot/use-co-pilot.ts`
- Test: `components/loops/ai-copilot/use-co-pilot.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// components/loops/ai-copilot/use-co-pilot.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCoPilot } from "./use-co-pilot";

class FakeBC {
  static instances: FakeBC[] = [];
  listeners: Array<(e: MessageEvent) => void> = [];
  constructor(public name: string) { FakeBC.instances.push(this); }
  postMessage(d: unknown) {
    for (const i of FakeBC.instances) {
      if (i === this || i.name !== this.name) continue;
      for (const l of i.listeners) l(new MessageEvent("message", { data: d }));
    }
  }
  addEventListener(_: "message", l: (e: MessageEvent) => void) { this.listeners.push(l); }
  removeEventListener() {}
  close() {}
}

describe("useCoPilot.approve", () => {
  beforeEach(() => {
    FakeBC.instances = [];
    (globalThis as any).BroadcastChannel = FakeBC as unknown as typeof BroadcastChannel;
  });

  it("sends a plan-update with origin co-pilot to the athlete channel", () => {
    const sent: any[] = [];
    const watcher = renderHook(() => {
      const w: any = { messages: [] };
      const ch = new (globalThis as any).BroadcastChannel("athlete:a-iris");
      ch.addEventListener("message", (e: MessageEvent) => sent.push(e.data));
      return w;
    });
    const { result } = renderHook(() => useCoPilot("c-marina"));
    act(() => {
      result.current.approve({
        kind: "ai-alert", id: "x", coachId: "c-marina", athleteId: "a-iris",
        rule: "hrv-down", recommendation: "swap-z2", body: "x",
        at: new Date().toISOString(),
      });
    });
    expect(sent.find((m: any) => m.kind === "plan-update" && m.origin === "co-pilot")).toBeTruthy();
    void watcher;
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```ts
// components/loops/ai-copilot/use-co-pilot.ts
"use client";
import { useChannel } from "@/lib/realtime/use-channel";
import type { AICoPilotAlert, PlanUpdate } from "@/lib/realtime/types";
import { useDashboardStore, selectPlanForAthlete } from "@/lib/dashboard-store";

const RECO_TO_DIFF: Record<AICoPilotAlert["recommendation"], PlanUpdate["diff"]> = {
  "lighter-day": "lighter-day",
  "swap-z2": "swap-z2",
  "recovery-day": "add-recovery",
};

export function useCoPilot(coachId: string) {
  const roster = useChannel(`roster:${coachId}`);

  return {
    approve: (alert: AICoPilotAlert) => {
      const plan = selectPlanForAthlete(useDashboardStore.getState(), alert.athleteId);
      if (!plan) return;
      const diff = RECO_TO_DIFF[alert.recommendation];
      const msg: PlanUpdate = {
        kind: "plan-update",
        planId: plan.id,
        athleteId: alert.athleteId,
        coachId,
        diff,
        at: new Date().toISOString(),
        origin: "co-pilot",
      };
      roster.send(msg);
      const ch = new BroadcastChannel(`athlete:${alert.athleteId}`);
      ch.postMessage(msg);
      ch.close();
      useDashboardStore.getState().applyPlanDiff(plan.id, diff as any);
      useDashboardStore.getState().dismissAIAlert(alert.id);
    },
  };
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add components/loops/ai-copilot/use-co-pilot.ts components/loops/ai-copilot/use-co-pilot.test.tsx
git commit -m "feat(loop-e): approve broadcasts plan-update with co-pilot origin"
```

---

## Phase 11 — Pages

### Task 49: Athlete dashboard page (`(app)/dashboard`)

**Files:**
- Create: `app/(app)/dashboard/page.tsx`
- Delete: `app/dashboard/page.tsx` (in Task 55)

- [ ] **Step 1: Implement**

```tsx
// app/(app)/dashboard/page.tsx
"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import {
  useDashboardStore, selectAthlete, selectPlanForAthlete,
} from "@/lib/dashboard-store";
import { ReadinessCard } from "@/components/loops/morning-handshake/readiness-card";
import { PlanUpdateBanner } from "@/components/loops/morning-handshake/plan-update-banner";
import { SessionCard } from "@/components/loops/live-session/session-card";
import { LiveMetrics } from "@/components/loops/live-session/live-metrics";
import { NudgeToast } from "@/components/loops/live-session/nudge-toast";
import { SessionSummary } from "@/components/loops/live-session/session-summary";
import { CelebrationOverlay } from "@/components/loops/celebrations/celebration-overlay";
import { StreakCard } from "@/components/loops/celebrations/streak-card";
import { InstallPrompt } from "@/components/shell/install-prompt";
import { useAthleteListener } from "@/components/loops/morning-handshake/use-athlete-listener";
import { useLiveSession } from "@/components/loops/live-session/use-live-session";
import { useCelebrations } from "@/components/loops/celebrations/use-celebrations";
import { useChannel } from "@/lib/realtime/use-channel";
import { detectPRs } from "@/lib/ai/pr-detection";
import { tap, success } from "@/lib/pwa/haptics";
import type { Nudge } from "@/lib/realtime/types";
import { VoltButton } from "@/components/ui-glass/volt-button";

export default function AthleteDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const athleteId = user?.id ?? "a-iris";
  const athlete = useDashboardStore((s) => selectAthlete(s, athleteId));
  const plan = useDashboardStore((s) => selectPlanForAthlete(s, athleteId));
  const apply = useDashboardStore((s) => s.applyPlanDiff);

  const listener = useAthleteListener(athleteId);
  const session = useLiveSession({ athleteId, intent: "z2" });
  const celebrations = useCelebrations(athleteId);

  // listen for nudges
  const nudges = useChannel(`athlete:${athleteId}`);
  const [activeNudge, setActiveNudge] = useState<Nudge | null>(null);
  const lastSeenRef = useRef<unknown>(null);

  useEffect(() => {
    const last = nudges.messages.at(-1);
    if (!last || last.kind !== "nudge" || last === lastSeenRef.current) return;
    lastSeenRef.current = last;
    setActiveNudge(last);
    tap();
    const id = setTimeout(() => setActiveNudge(null), 3500);
    return () => clearTimeout(id);
  }, [nudges.messages]);

  if (!athlete || !plan) return null;

  const onEnd = () => {
    session.end();
    success();
    const summary = session.ticks.at(-1);
    if (summary) {
      const prs = detectPRs(
        { athleteId, at: new Date().toISOString(), distanceKm: 12, durationSec: summary.elapsedSec, avgHr: 0, maxHr: 0 },
        []
      );
      const pr = prs[0];
      if (pr) {
        celebrations.publishAchievement({
          title: "New PR",
          metric: pr.metric,
          value: pr.value,
        });
      }
    }
  };

  return (
    <div className="space-y-4 pb-6">
      <ReadinessCard
        percent={athlete.readiness}
        hrv={athlete.hrv}
        hrvDelta={4}
        sleepHours={athlete.sleepHours}
        coachName="Marina"
        intent={plan.blocks[0].title}
      />

      {listener.pendingDiff && (
        <PlanUpdateBanner
          coachName="Marina"
          diff={listener.pendingDiff.diff}
          onApply={() => {
            apply(plan.id, listener.pendingDiff!.diff as any);
            listener.dismiss();
          }}
          onDismiss={listener.dismiss}
        />
      )}

      {!session.isActive && (
        <SessionCard
          title={plan.blocks[0].title}
          durationMin={45}
          intent="z2"
          morphId={`session-${plan.id}`}
          onStart={session.start}
        />
      )}

      {session.isActive && (
        <>
          <LiveMetrics
            hr={session.hr}
            pace={session.pace}
            cadence={session.cadence}
            elapsedSec={session.elapsedSec}
            ticks={session.ticks.map((t) => t.hr)}
          />
          <VoltButton onClick={onEnd}>End session</VoltButton>
        </>
      )}

      {!session.isActive && session.ticks.length > 0 && (
        <SessionSummary
          distanceKm={(session.ticks.length * 1500) / 60_000}
          avgHr={Math.round(session.ticks.reduce((s, t) => s + t.hr, 0) / session.ticks.length)}
          maxHr={session.ticks.reduce((m, t) => Math.max(m, t.hr), 0)}
          durationSec={session.ticks.at(-1)?.elapsedSec ?? 0}
        />
      )}

      <StreakCard days={athlete.streakWeeks * 7} coName="Marina" />

      <InstallPrompt />

      {activeNudge && <NudgeToast variant={activeNudge.variant} coachName="Marina" />}
      {celebrations.lastAchievement && (
        <CelebrationOverlay
          title={celebrations.lastAchievement.title}
          value={`${celebrations.lastAchievement.value} ${celebrations.lastAchievement.metric}`}
          onClose={celebrations.clearAchievement}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TS + run all unit tests**

Run: `npx tsc --noEmit && npm run test`
Expected: exit 0 across the board.

- [ ] **Step 3: Commit**

```bash
git add app/\(app\)/dashboard/page.tsx
git commit -m "feat(app): athlete dashboard with full Loop A+B+D wiring"
```

---

### Task 50: Coach dashboard page

**Files:**
- Create: `app/(app)/coach/dashboard/page.tsx`

- [ ] **Step 1: Implement**

```tsx
// app/(app)/coach/dashboard/page.tsx
"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import {
  useDashboardStore, selectAthletesForCoach, selectCoachMetrics,
} from "@/lib/dashboard-store";
import { RosterHeatmap } from "@/components/loops/morning-handshake/roster-heatmap";
import { AlertFeed } from "@/components/loops/ai-copilot/alert-feed";
import { GlassCard } from "@/components/ui-glass/glass-card";
import { Pill } from "@/components/ui-glass/pill";
import { useCoPilot } from "@/components/loops/ai-copilot/use-co-pilot";
import { evaluateRoster } from "@/lib/ai/rules";

export default function CoachDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const coachId = user?.id ?? "c-marina";
  const router = useRouter();

  const athletes = useDashboardStore((s) => selectAthletesForCoach(s, coachId));
  const metrics = useDashboardStore((s) => selectCoachMetrics(s, coachId));
  const aiAlerts = useDashboardStore((s) => s.aiAlerts);
  const pushAlert = useDashboardStore((s) => s.pushAIAlert);

  const { approve } = useCoPilot(coachId);

  useEffect(() => {
    const snaps = athletes.map((a) => ({
      id: a.id, name: a.name,
      hrvSeries: [a.hrv - 6, a.hrv - 4, a.hrv, a.hrv - 2, a.hrv + 1, a.hrv - 8, a.hrv - 12],
      sleepSeries: [7.5, 7.2, 7.0, 6.8, 6.5, 5.6, 5.4],
      missedSessions: a.recoveryStatus === "red" ? 3 : 0,
    }));
    const fresh = evaluateRoster(snaps, coachId);
    fresh.forEach(pushAlert);
  }, [athletes, coachId, pushAlert]);

  return (
    <div className="space-y-5 pb-6">
      <GlassCard tone="default" className="grid grid-cols-3 gap-3">
        <Stat label="Active" value={String(metrics.activeAthletes)} />
        <Stat label="MTD" value={metrics.revenueMtd} />
        <Stat label="Sessions/wk" value={String(metrics.sessionsWeek)} />
      </GlassCard>

      <section>
        <header className="flex items-center justify-between mb-3">
          <h2 className="text-sm uppercase tracking-[0.18em] text-ink-400">Roster readiness</h2>
          <Pill>Today</Pill>
        </header>
        <RosterHeatmap
          athletes={athletes.map((a) => ({
            id: a.id, name: a.name, readiness: a.readiness, hrvDelta: 0,
          }))}
          onSelect={(id) => router.push(`/coach/athletes/${id}`)}
        />
      </section>

      <section>
        <h2 className="text-sm uppercase tracking-[0.18em] text-ink-400 mb-3">Co-pilot</h2>
        <AlertFeed
          alerts={aiAlerts.filter((a) => a.coachId === coachId)}
          athleteNameFor={(id) => athletes.find((a) => a.id === id)?.name ?? id}
          onApprove={approve}
          onOpenAthlete={(id) => router.push(`/coach/athletes/${id}`)}
        />
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-ink-400">{label}</p>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}
```

- [ ] **Step 2: Verify TS**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add app/\(app\)/coach/dashboard/page.tsx
git commit -m "feat(app): coach dashboard with heatmap + co-pilot feed"
```

---

### Task 51: Coach athlete detail page

**Files:**
- Create: `app/(app)/coach/athletes/[id]/page.tsx`

- [ ] **Step 1: Implement**

```tsx
// app/(app)/coach/athletes/[id]/page.tsx
"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import {
  useDashboardStore, selectAthlete, selectPlanForAthlete,
} from "@/lib/dashboard-store";
import { ReadinessCard } from "@/components/loops/morning-handshake/readiness-card";
import { QuickDiffChips } from "@/components/loops/morning-handshake/quick-diff-chips";
import { LiveMetrics } from "@/components/loops/live-session/live-metrics";
import { NudgeBar } from "@/components/loops/live-session/nudge-bar";
import { ReactionRow } from "@/components/loops/celebrations/reaction-row";
import { useCoachBroadcaster } from "@/components/loops/morning-handshake/use-coach-broadcaster";
import { useChannel } from "@/lib/realtime/use-channel";
import { useCelebrations } from "@/components/loops/celebrations/use-celebrations";
import type { Nudge } from "@/lib/realtime/types";
import { GlassCard } from "@/components/ui-glass/glass-card";

export default function CoachAthleteDetailPage() {
  const params = useParams<{ id: string }>();
  const athleteId = params.id;
  const coachId = useAuthStore((s) => s.user?.id) ?? "c-marina";
  const athlete = useDashboardStore((s) => selectAthlete(s, athleteId));
  const plan = useDashboardStore((s) => selectPlanForAthlete(s, athleteId));
  const live = useDashboardStore((s) => s.liveSessions[athleteId]);

  const broadcaster = useCoachBroadcaster(coachId);
  const ch = useChannel(`athlete:${athleteId}`);
  const celebrations = useCelebrations(athleteId);
  const [lastReaction, setLastReaction] = useState<string | null>(null);

  if (!athlete || !plan) return null;

  return (
    <div className="space-y-4 pb-6">
      <ReadinessCard
        percent={athlete.readiness}
        hrv={athlete.hrv}
        hrvDelta={0}
        sleepHours={athlete.sleepHours}
        coachName="You"
        intent={plan.blocks[0].title}
      />

      <GlassCard tone="default" className="space-y-3">
        <h2 className="text-sm uppercase tracking-[0.18em] text-ink-400">Plan adjustments</h2>
        <QuickDiffChips
          onPick={(diff) => broadcaster.publishDiff({ planId: plan.id, athleteId, diff })}
        />
      </GlassCard>

      {live && !live.endedAt && (
        <>
          <LiveMetrics
            hr={live.ticks.at(-1)?.hr ?? 0}
            pace={live.ticks.at(-1)?.pace ?? 0}
            cadence={live.ticks.at(-1)?.cadence ?? 0}
            elapsedSec={live.ticks.at(-1)?.elapsedSec ?? 0}
            ticks={live.ticks.slice(-30).map((t) => t.hr)}
          />
          <NudgeBar
            onNudge={(variant: Nudge["variant"]) =>
              ch.send({
                kind: "nudge", athleteId, coachId, variant,
                at: new Date().toISOString(),
              })
            }
          />
        </>
      )}

      {celebrations.lastAchievement && (
        <GlassCard tone="active" className="space-y-3">
          <p className="text-sm">
            <span className="text-volt-500 font-bold">{celebrations.lastAchievement.title}</span> · {celebrations.lastAchievement.value} {celebrations.lastAchievement.metric}
          </p>
          <ReactionRow
            onReact={(emoji) => {
              celebrations.publishReaction(`${celebrations.lastAchievement!.metric}-${celebrations.lastAchievement!.value}`, emoji, "You");
              setLastReaction(emoji);
            }}
          />
          {lastReaction && <p className="text-xs text-ink-400">Sent {lastReaction}</p>}
        </GlassCard>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TS**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add app/\(app\)/coach/athletes/\[id\]/page.tsx
git commit -m "feat(app): coach athlete detail with diff chips + nudge bar + reactions"
```

---

### Task 52: `/settings/appearance` page

**Files:**
- Create: `app/(app)/settings/appearance/page.tsx`

- [ ] **Step 1: Implement**

```tsx
// app/(app)/settings/appearance/page.tsx
"use client";

import { useTheme } from "@/lib/theme/use-theme";
import { ThemePicker } from "@/components/shell/theme-picker";
import { GlassCard } from "@/components/ui-glass/glass-card";

export default function AppearanceSettings() {
  const { matchCoach, setMatchCoach, coachTheme } = useTheme();
  return (
    <div className="space-y-4 pb-6">
      <h1 className="text-2xl font-bold">Appearance</h1>

      <ThemePicker variant="settings" />

      <GlassCard tone="default" className="flex items-center gap-3">
        <div className="flex-1">
          <p className="font-semibold">Match my coach</p>
          <p className="text-sm text-ink-300">
            {coachTheme
              ? "When on, your theme follows your coach's selected theme."
              : "Connect a coach to enable this."}
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={matchCoach}
            onChange={(e) => setMatchCoach(e.target.checked)}
            className="sr-only peer"
            disabled={!coachTheme}
          />
          <span className="w-11 h-6 bg-glass-md rounded-full peer-checked:bg-volt-500 transition-colors"></span>
          <span className="absolute left-0.5 top-0.5 h-5 w-5 bg-ink-100 rounded-full transition-transform peer-checked:translate-x-5"></span>
        </label>
      </GlassCard>
    </div>
  );
}
```

- [ ] **Step 2: Verify TS**

- [ ] **Step 3: Commit**

```bash
git add app/\(app\)/settings/appearance/page.tsx
git commit -m "feat(app): appearance settings page with Match-my-coach"
```

---

### Task 53: Re-skin `/signin` (preserve behavior + `?demo=coach`)

**Files:**
- Modify: `app/signin/page.tsx`

- [ ] **Step 1: Read existing signin file**

Note its existing form state, demo accounts, and "already signed in" banner. Preserve all of it.

- [ ] **Step 2: Apply Voltline skin + demo auto-fill**

Replace the page's outer wrapper with a Voltline-themed layout. Specifically:

1. Outer `<main>` → `bg-ink-950 text-ink-100 min-h-dvh`
2. The card → `<GlassCard tone="active">`
3. Buttons → `<VoltButton>`
4. Headings → use `bg-grad-text bg-clip-text text-transparent` for the h1

Add at the top of the component (after existing hooks):

```tsx
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

const params = useSearchParams();
const router = useRouter();

useEffect(() => {
  if (params?.get("demo") === "coach") {
    setUsername("Coach");
    setPassword("Coach");
    setTimeout(() => {
      formRef.current?.requestSubmit();
    }, 200);
  }
}, [params]);
```

(Where `formRef` is added as a `useRef<HTMLFormElement>(null)` and attached to the form.)

The "next" param (e.g. `?next=/coach/dashboard`) is already honored by the existing redirect logic; verify and keep.

- [ ] **Step 3: Verify TS + click-test the form**

Run: `npx tsc --noEmit`. Run dev server and verify the form still submits and the demo URL `/signin?demo=coach&next=/coach/dashboard` auto-signs in.

- [ ] **Step 4: Commit**

```bash
git add app/signin/page.tsx
git commit -m "feat(app): Voltline skin for signin + ?demo=coach handler"
```

---

### Task 54: Re-skin `/signup`

**Files:**
- Modify: `app/signup/page.tsx`

- [ ] **Step 1: Apply same Voltline shell**

Wrap with `<GlassCard tone="active">`, replace buttons with `<VoltButton>`, replace inputs with rounded glass inputs:

```tsx
className="h-11 w-full px-4 rounded-full bg-glass-md border border-glass-border focus:border-volt-500 outline-none placeholder:text-ink-400"
```

- [ ] **Step 2: Verify TS**

- [ ] **Step 3: Commit**

```bash
git add app/signup/page.tsx
git commit -m "feat(app): Voltline skin for signup"
```

---

### Task 55: "Demo as coach" button + remove old dashboard pages

**Files:**
- Modify: `app/(app)/dashboard/page.tsx` (add demo button)
- Delete: `app/dashboard/page.tsx`
- Delete: `app/coach/dashboard/page.tsx`
- Delete: `app/coach/athletes/[id]/page.tsx`

- [ ] **Step 1: Add demo button**

Above `<InstallPrompt />` in the athlete dashboard, add:

```tsx
{/* visible to seeded Athlete account or with ?demo=1 */}
{(typeof window !== "undefined" &&
  (window.location.search.includes("demo=1") || user?.email === "athlete@demo.com")) && (
  <GlassCard tone="default" className="flex items-center gap-3">
    <div className="flex-1">
      <p className="font-semibold">Open coach view in second tab</p>
      <p className="text-sm text-ink-300">For end-to-end loop demos on one device.</p>
    </div>
    <VoltButton
      onClick={() => window.open("/signin?demo=coach&next=/coach/dashboard", "_blank")}
    >
      Demo as coach
    </VoltButton>
  </GlassCard>
)}
```

(Add `import { GlassCard } from "@/components/ui-glass/glass-card";` if not present.)

- [ ] **Step 2: Delete the old pages**

```bash
git rm app/dashboard/page.tsx app/coach/dashboard/page.tsx app/coach/athletes/\[id\]/page.tsx
```

The new `(app)` group provides routes at the same URLs, so this is safe.

- [ ] **Step 3: Verify build & E2E smoke**

Run: `npm run build`
Expected: build succeeds, all routes prerendered.

Run: `npm run test:e2e -- smoke.spec.ts`
Expected: home page test still passes.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(app): add demo-as-coach button + remove old dashboard pages"
```

---

## Phase 12 — E2E + polish

### Task 56: E2E — morning handshake (multi-context)

**Files:**
- Create: `tests/e2e/morning-handshake.spec.ts`

- [ ] **Step 1: Implement**

```ts
// tests/e2e/morning-handshake.spec.ts
import { test, expect, chromium } from "@playwright/test";

test("morning handshake propagates from coach to athlete", async () => {
  const browser = await chromium.launch();
  const ctxA = await browser.newContext();
  const ctxC = await browser.newContext();
  const athlete = await ctxA.newPage();
  const coach   = await ctxC.newPage();

  await athlete.goto("/signin");
  await athlete.getByLabel(/Username/i).fill("Athlete");
  await athlete.getByLabel(/Password/i).fill("Athlete");
  await athlete.getByRole("button", { name: /Sign in/i }).click();
  await athlete.waitForURL("**/dashboard");

  await coach.goto("/signin?demo=coach&next=/coach/dashboard");
  await coach.waitForURL("**/coach/dashboard");

  // coach taps the first roster tile, then "Lighter day"
  await coach.getByRole("button").first().click();
  await coach.waitForURL("**/coach/athletes/**");
  await coach.getByRole("button", { name: /Lighter day/i }).click();

  // athlete should see the banner
  await expect(athlete.getByText(/updated today/i)).toBeVisible({ timeout: 5000 });
  await athlete.getByRole("button", { name: /Apply/i }).click();
  await expect(athlete.getByText(/Light · RPE 4/i)).toBeVisible();

  await browser.close();
});
```

- [ ] **Step 2: Run, expect PASS**

Run: `npm run test:e2e -- morning-handshake.spec.ts`
Expected: 1 passed.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/morning-handshake.spec.ts
git commit -m "test(e2e): morning handshake coach → athlete propagation"
```

---

### Task 57: E2E — live session

**Files:**
- Create: `tests/e2e/live-session.spec.ts`

- [ ] **Step 1: Implement**

```ts
// tests/e2e/live-session.spec.ts
import { test, expect, chromium } from "@playwright/test";

test("athlete starts live session, coach sees metrics, sends nudge", async () => {
  const browser = await chromium.launch();
  const ctxA = await browser.newContext();
  const ctxC = await browser.newContext();
  const athlete = await ctxA.newPage();
  const coach   = await ctxC.newPage();

  // sign in athlete
  await athlete.goto("/signin");
  await athlete.getByLabel(/Username/i).fill("Athlete");
  await athlete.getByLabel(/Password/i).fill("Athlete");
  await athlete.getByRole("button", { name: /Sign in/i }).click();
  await athlete.waitForURL("**/dashboard");

  // sign in coach and open athlete detail
  await coach.goto("/signin?demo=coach&next=/coach/dashboard");
  await coach.waitForURL("**/coach/dashboard");
  await coach.getByRole("button").first().click();

  // athlete starts session
  await athlete.getByRole("button", { name: /Start/i }).click();
  await athlete.waitForTimeout(4000);

  // coach sees live metrics (HR > 100)
  await expect(coach.getByText(/HR/)).toBeVisible({ timeout: 5000 });

  // coach sends nudge
  await coach.getByRole("button", { name: /Push/i }).click();

  // athlete sees the nudge toast
  await expect(athlete.getByText(/Push it/i)).toBeVisible({ timeout: 5000 });

  await browser.close();
});
```

- [ ] **Step 2: Run, expect PASS**

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/live-session.spec.ts
git commit -m "test(e2e): live session — start, watch, nudge"
```

---

### Task 58: E2E — celebrations

**Files:**
- Create: `tests/e2e/celebrations.spec.ts`

- [ ] **Step 1: Implement**

```ts
// tests/e2e/celebrations.spec.ts
import { test, expect, chromium } from "@playwright/test";

test("PR triggers celebration overlay and coach can react", async () => {
  const browser = await chromium.launch();
  const ctxA = await browser.newContext();
  const ctxC = await browser.newContext();
  const athlete = await ctxA.newPage();
  const coach   = await ctxC.newPage();

  await athlete.goto("/signin");
  await athlete.getByLabel(/Username/i).fill("Athlete");
  await athlete.getByLabel(/Password/i).fill("Athlete");
  await athlete.getByRole("button", { name: /Sign in/i }).click();
  await athlete.waitForURL("**/dashboard");

  await coach.goto("/signin?demo=coach&next=/coach/dashboard");
  await coach.waitForURL("**/coach/dashboard");
  await coach.getByRole("button").first().click();

  // athlete starts and ends a session
  await athlete.getByRole("button", { name: /Start/i }).click();
  await athlete.waitForTimeout(3500);
  await athlete.getByRole("button", { name: /End session/i }).click();

  // celebration overlay appears
  await expect(athlete.getByRole("alertdialog")).toBeVisible({ timeout: 4000 });

  // coach sees the achievement and reacts
  await expect(coach.getByText(/New PR/i)).toBeVisible({ timeout: 4000 });
  await coach.getByRole("button", { name: "🔥" }).click();
  await expect(coach.getByText(/Sent 🔥/)).toBeVisible();

  await browser.close();
});
```

- [ ] **Step 2: Run, expect PASS**

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/celebrations.spec.ts
git commit -m "test(e2e): celebrations — PR overlay + coach reaction"
```

---

### Task 59: E2E — theme switching

**Files:**
- Create: `tests/e2e/theme-switching.spec.ts`

- [ ] **Step 1: Implement**

```ts
// tests/e2e/theme-switching.spec.ts
import { test, expect } from "@playwright/test";

test("theme switches and persists across reload", async ({ page }) => {
  await page.goto("/signin");
  await page.getByLabel(/Username/i).fill("Athlete");
  await page.getByLabel(/Password/i).fill("Athlete");
  await page.getByRole("button", { name: /Sign in/i }).click();
  await page.waitForURL("**/dashboard");

  // pick the second dot in the top-bar picker (Pulse)
  const dots = page.getByRole("group", { name: /Theme picker/i }).getByRole("button");
  await dots.nth(1).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "pulse");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "pulse");
});
```

- [ ] **Step 2: Run, expect PASS**

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/theme-switching.spec.ts
git commit -m "test(e2e): theme picker persists selection across reload"
```

---

### Task 60: Lighthouse mobile + a11y audit

**Files:**
- Create: `scripts/lighthouse-mobile.mjs`
- Modify: `package.json` (script `audit:mobile`)

- [ ] **Step 1: Add the audit script**

```bash
npm install -D lighthouse@^12 chrome-launcher@^1
```

```js
// scripts/lighthouse-mobile.mjs
import lighthouse from "lighthouse";
import { launch } from "chrome-launcher";
import fs from "node:fs";

const URLS = [
  "http://localhost:3001/dashboard",
  "http://localhost:3001/coach/dashboard",
];

const BUDGETS = { performance: 90, accessibility: 95, "best-practices": 90, pwa: 90 };

const chrome = await launch({ chromeFlags: ["--headless=new"] });
let failures = 0;
const summary = [];

for (const url of URLS) {
  const result = await lighthouse(url, {
    port: chrome.port,
    output: "json",
    onlyCategories: Object.keys(BUDGETS),
    formFactor: "mobile",
    screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 3, disabled: false },
    throttlingMethod: "devtools",
  });

  const scores = Object.fromEntries(
    Object.entries(result.lhr.categories).map(([k, v]) => [k, Math.round((v.score ?? 0) * 100)])
  );
  summary.push({ url, scores });
  for (const [k, threshold] of Object.entries(BUDGETS)) {
    if ((scores[k] ?? 0) < threshold) {
      failures++;
      console.error(`✗ ${url} ${k}: ${scores[k]} < ${threshold}`);
    }
  }
}

await chrome.kill();
fs.writeFileSync("lighthouse-mobile-report.json", JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
process.exit(failures ? 1 : 0);
```

Add `package.json` script: `"audit:mobile": "node scripts/lighthouse-mobile.mjs"`.

- [ ] **Step 2: Build + run audit (production)**

```bash
npm run build
npx next start -p 3001 &
sleep 5
npm run audit:mobile
```

If any score is below the budget, fix the offending issue (image weight, layout shift, missing alt text, missing label, etc.) and re-run.

- [ ] **Step 3: Commit**

```bash
git add scripts/lighthouse-mobile.mjs package.json package-lock.json
git commit -m "chore(test): add Lighthouse mobile budget audit"
```

---

### Task 61: README + manual mobile smoke

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace install/run section with**

```markdown
## Getting started

```bash
npm install
npm run dev
# → http://localhost:3001
```

## Demo accounts

| Username  | Password  | Role     |
|-----------|-----------|----------|
| Athlete   | Athlete   | athlete  |
| Coach     | Coach     | coach    |
| Marina    | Marina    | coach    |
| Admin     | Admin     | admin    |

## Two-tab demo (coach × athlete loops)

1. Sign in as `Athlete / Athlete` → land on `/dashboard`.
2. On the athlete dashboard, click **"Demo as coach"** to open `/coach/dashboard` in a new tab signed in as Coach.
3. Coach taps an athlete tile, picks **"Lighter day"** → Athlete sees the banner and applies.
4. Athlete taps **Start** on the session card → Coach watches HR live, taps **Push** → Athlete sees nudge toast.
5. Athlete taps **End session** → Celebration overlay fires → Coach reacts with 🔥 → Athlete sees reaction.

## Install as a PWA

- **iOS Safari:** open `https://<host>/dashboard`, tap **Share → Add to Home Screen**.
- **Android Chrome:** tap the menu → **Install app**.

The PWA service worker is enabled only in production builds (`next start`); `next dev` keeps it off.

## Real-time backend

Default is `BroadcastChannel` (cross-tab on the same origin). To swap to Supabase Realtime:

```bash
NEXT_PUBLIC_REALTIME=supabase npm run build
```

(Supabase adapter ships in v2.)

## Tests

```bash
npm run test          # unit + component (Vitest)
npm run test:e2e      # multi-context E2E (Playwright)
npm run audit:mobile  # Lighthouse mobile budgets (requires `next start` running)
```
```

- [ ] **Step 2: Manual mobile smoke (operator step)**

Verify on at least one iPhone Safari and one Android Chrome:

- [ ] Page loads at `https://<host>/dashboard` with no horizontal scroll.
- [ ] **Add to Home Screen** works; relaunched icon opens in standalone.
- [ ] Floating dock visible above the home indicator (safe-area inset respected).
- [ ] Theme picker dots are tap-friendly (≥ 44 px touch target).
- [ ] Two-tab demo flows succeed in mobile Safari.

Document findings in PR description; iterate on regressions before merging.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs(readme): document install, demo flow, PWA, tests"
```

---

## Self-review summary

Run after writing, before handoff. Findings + fixes documented inline.

**Spec coverage** — every numbered section of `docs/superpowers/specs/2026-05-17-fitconnect-glass-redesign-design.md` has at least one task:

| Spec section | Tasks |
|---|---|
| §2.1 Stack & PWA | 3, 13, 14, 15, 16 |
| §2.2 Realtime hybrid | 23, 24, 25, 27, 28 |
| §2.3 Store extensions | 26 |
| §3 Voltline tokens / primitives | 5, 6, 7, 8 |
| §3.3 Theme system + Match my coach | 9, 10, 11, 12, 22, 52 |
| §4 Mobile shell + transitions | 17, 18, 19, 20, 21, 22 |
| §5.1 Loop A | 29, 30, 31, 32, 33 |
| §5.2 Loop B | 34, 35, 36, 37, 38, 39 |
| §5.3 Loop D | 40, 41, 42, 43, 44 |
| §5.4 Loop E | 45, 46, 47, 48 |
| §6 Pages | 49, 50, 51, 52, 53, 54, 55 |
| §8 Testing (unit + component + E2E) | 1, 2, every implementation task, 56–59 |
| §9 Performance & a11y | 60 |
| §10 Rollout / demo / docs | 55 (demo button), 61 (README + manual mobile smoke) |
| §12 Definition of done | 61 (manual smoke checklist) |

**Placeholder scan** — clean (no TBD / TODO / generic "add error handling").

**Type consistency** — verified across hooks/components:

- `useChannel(name)` used everywhere with `roster:{coachId}`, `athlete:{athleteId}`, `celebration:{athleteId}` channel naming.
- `RealtimeMessage` discriminated union references match every consumer (`PlanUpdate`, `LiveTick`, `Nudge`, `SessionStart`, `SessionEnd`, `Achievement`, `Reaction`, `AICoPilotAlert`).
- `useTheme()` shape consistent in `<ThemePicker>`, `<TopBar>`, settings page, and root layout.
- `applyPlanDiff(planId, diff)` signature consistent in Loop A wiring and Loop E approval flow.
- `useLiveSession({ athleteId, intent })` returns the same `{ isActive, ticks, hr, pace, cadence, elapsedSec, start, end }` shape used by the athlete dashboard.

**Inline fix applied during review:** Task 49 originally dispatched nudge state from render. Replaced with a `useEffect` + `useRef` guard to prevent render loop and to clean up the auto-dismiss timer on unmount.

---

## Execution handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-17-fitconnect-glass-redesign.md`.**

Two execution options:

1. **Subagent-driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration. Best for a 61-task plan where context contamination is real.
2. **Inline execution** — execute tasks in this session with `executing-plans`, batching 5-task checkpoints for review.

**Reply `subagent-driven` or `inline` to start implementation.**

Once execution starts, the next steps in the workflow will be:

- `test-driven-development` (already baked into every task)
- After all tasks: `requesting-code-review` (self-review against spec + diff)
- Final: `finishing-a-development-branch` (squash-merge or PR)


