# FitConnect — Phase 11 UI/UX Audit Findings

> Audit date: 2026-05-19 · Status after remediation pass

## Summary

| Severity | Open | Fixed this pass |
|----------|------|-----------------|
| CRITICAL | 0 | 2 |
| HIGH | 4 | 6 |
| MEDIUM | 8 | 1 |
| LOW | 6 | 0 |

---

## CRITICAL (resolved)

### C1 — OS `prefers-reduced-motion` ignored on first paint
- **Fix:** `appearance-provider.tsx` reads `matchMedia('(prefers-reduced-motion: reduce)')` when no saved user preference.
- **Status:** ✅ Fixed

### C2 — `marina@fitconnect.local` persona mismatch (coach vs multi-sport athlete)
- **Fix:** Marina demo account → athlete `a-marina` with Yoga/Climbing/Running seed + plan.
- **Status:** ✅ Fixed

---

## HIGH (resolved)

| ID | Issue | Fix |
|----|-------|-----|
| H1 | `/mobile` redirected to deferred `#product-demo` | `app/mobile/page.tsx` renders `MobileAppLauncher` |
| H2 | Coach dashboard missing `?demo=1` Voltline panel | Mirror panel on `coach/dashboard` |
| H3 | Hero missing free intro + €12/mo above fold | `hero.reassurance` + hero CTA row |
| H4 | No hero path to live demo | `Open live demo` → `/mobile` |
| H5 | Coach roster chart blank when empty | Empty state + link to roster |
| H6 | App error boundary always linked to `/dashboard` | Role-aware `dashboardPathForRole` |

---

## HIGH (open — follow-up)

| ID | Issue | Suggested fix |
|----|-------|---------------|
| H7 | Recharts hex colors in HRV/earnings charts | Shared `rechartsTheme` from CSS tokens |
| H8 | Button system split (`VoltButton` vs shadcn `Button`) | Unify primary actions on both dashboards |
| H9 | Duplicate readiness UI on athlete dashboard | Remove `MetricTile` readiness or merge with `ReadinessCard` |
| H10 | No route-level `loading.tsx` skeletons | Add `(app)/dashboard/loading.tsx` + coach variant |

---

## MEDIUM (open)

- Landing pricing still below fold (compact strip in hero optional)
- Marina multi-sport chips not shown on athlete dashboard header
- Sign-up demo users get empty dashboard (no seed)
- Coach manual `<h2>` headers vs `SectionHeader` inconsistency
- `AthleteProfileForm` returns null silently
- Marketing atmosphere SVG hex colors
- Auth bullets vs README drift (partially fixed in `en.ts`)
- AI alert stacking on coach dashboard mount

---

## LOW (open)

- Device frame arbitrary hex in marketing mocks
- Celebration overlay rgba hardcode
- Coach welcome i18n hardcodes “Tomás”
- Install prompt only on athlete dashboard

---

## Phase 11 validation checklist

- [x] OS reduced motion respected by default
- [x] `marina@fitconnect.local` → multi-sport athlete profile
- [x] `?demo=1` Voltline panel (athlete + coach)
- [x] `/mobile` launcher with one-tap demo sign-in
- [x] Hero trust row (free intro + €12/mo)
- [x] Demo users: ines, tomas, marina, admin
- [x] `@voltline` E2E 4/4
- [ ] Vercel production URL live (requires `vercel login` + secrets)
- [ ] QR / Expo preview build (requires `EXPO_TOKEN`)

---

## Re-audit

Re-run after H7–H10 if targeting zero HIGH items before release.

```bash
pnpm test && pnpm build
pnpm test:e2e:voltline
node scripts/lighthouse-mobile.mjs <production-url>
```
