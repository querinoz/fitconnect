# FitConnect — Release-critical Playwright suite

Specs that must pass for Zenith release gates (auth, landing, motion, TRAIN/Ascend navigation).

```bash
pnpm exec playwright test \
  tests/e2e/smoke.spec.ts \
  tests/e2e/landing-motion.spec.ts \
  tests/e2e/phase9-auth.spec.ts \
  tests/e2e/signin-copy.spec.ts \
  tests/e2e/train-journey.spec.ts \
  --project=desktop-chrome --project=mobile-chrome
```

**v5 lock:** **32/32 PASS** (2026-09-16).

Full catalog remains executable; legacy failures are tracked in [`TEST_DEBT.md`](./TEST_DEBT.md) — never skipped silently. Do not move TD-* specs into this gate until they are genuinely green.
