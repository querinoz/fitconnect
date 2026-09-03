# Final Direction

**Date:** 2026-09-02
**Audit mode:** diagnostic only. No product code changed.

---

## 1. Where is FitConnect now?

A **multi-surface Elite OS prototype**: Android athlete **visual system is engineering-complete** (neu-glass waves 0â€“7 on `feat/elite-os-v2`). Web is a real Next.js app with dual demo/SQL paths. Wear is a **partial companion**. Data foundation (`012`â€“`016`) and a strength **domain engine** exist mostly **off HEAD** (untracked). Production launch is **NO-GO**.

It is **not** a finished gym tracker (no guided workout). It is **not** a finished coaching SaaS (coach is LOCAL_DEMO). It is **not** a clone of openGym.

## 2. What is truly complete?

- Design tokens + athlete neu-glass chrome
- Wave 7 Today editorial layout (committed)
- Strava shareable barrier in policy/SQL (P0-SEC stamp)
- Makefile / CI / Vercel preview pipeline (engineering)
- ProgressionEngine **logic** + 1RM estimator **unit tests** (working tree, not remote)

## 3. What is incomplete?

Guided workout, GPS capture, Room, HC sleep/steps/write-back, coach persistence, ASCEND unification, realtime production default, Wear UUID sync, P1-AUTH production, import/export, muscle map.

## 4. What is duplicated?

Prisma vs Supabase; `activities` vs `workout_sessions`; ASCEND SQL vs Zustand vs Android memory; community/squad memory vs SQL; HC fitness reader vs simulated telemetry provider; identity uuid vs Firebase UID vs cuid.

## 5. What is blocked?

PRODUCTION_AUTH, Play signing, physical Watch E2E, Wear activity ID reconcile (P7), legal copy.

## 6. What is production-ready?

**Nothing as a release slice.** Preview URL is hosted demo. CI trains on `DEMO_MODE=true`.

## 7. What is not?

See incomplete + blocked. Also README still claiming next phase P0-SEC.

## 8. What should be implemented next?

**Reconcile git, then P1-AUTH**, then **Guided Workout (Wave 2)**. See [`NEXT_IMPLEMENTATION_PLAN.md`](./NEXT_IMPLEMENTATION_PLAN.md).

## 9. What should NOT be implemented yet?

P2-GPS (until identity+workout persist), Watch product, Social/Squad V2, Stories, openGym visual clone, Expo, passkey-only auth, muscle map, bulk importers.

## 10. Shortest safe path to production

Worktree freeze â†’ P1-AUTH + HUMAN Firebase â†’ Guided Workout + `activity.completed` idempotent â†’ durable HC/activity store â†’ CI demo-off â†’ HUMAN signing/legal â†’ P11 QA â†’ GO/NO-GO.

**Current GO:** **NO.**

---

## Scorecard (evidence, 2026-09-02)

| Area | Score | Note |
|------|-------|------|
| Architecture | 6/10 | Dual schema; canonical path documented |
| Android | 7/10 UI / 4/10 data | Neu-glass vs LOCAL_DEMO |
| Web | 6/10 | Dual persistence |
| Wear | 4/10 | Wired, unreconciled, untested pair |
| Athlete | 6/10 | Visual yes; training no |
| Coach | 3/10 | Demo |
| Workout | 3/10 | Engine yes; execution no |
| GPS | 2/10 | Simulated |
| Telemetry | 4/10 | Mix real HC + sim |
| Auth | 5/10 | LOCAL_AUTH; prod HUMAN |
| Database | 6/10 | 016/017 not on HEAD |
| Realtime | 3/10 | Broadcast default |
| ASCEND | 5/10 | Triple store |
| Social | 4/10 | SQL + memory |
| Squad | 4/10 | Same |
| Payments | 5/10 | Code; keys HUMAN |
| Security | 7/10 | P0-SEC stamp; not re-run today |
| Accessibility | 4/10 | Specs; limited evidence |
| Performance | UNVERIFIED | Not measured this audit |
| DevOps | 6/10 | CI demo-on |
| Documentation | 4/10 | Volume high; contradictions |

---

## Makefile

Targets `make start` and `make fitconnect` **exist**. Windows native: `npm run env:start`. **Not executed in this audit** â€” do not claim runtime PASS.

## Runtime tests this audit

**Not run** (diagnostic stop). Last known: athlete unit 21, strength 11, identity RLS 5/5, activities RLS 3/3 on **2026-09-01**. Treat as **historical evidence**, not todayâ€™s certification.
