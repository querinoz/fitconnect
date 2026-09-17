# V8.5 Final E2E Evidence

**Date:** 2026-09-17 (re-run)  
**Base URL:** `http://localhost:3001`  
**Tip:** `5208d9f`

## Critical V8.5 surfaces

```powershell
cd apps/web
$env:PLAYWRIGHT_BASE_URL="http://localhost:3001"
pnpm exec playwright test tests/e2e/v85-sport-nutrition.spec.ts --reporter=line
```

**27/27 PASS** (mobile-chrome · mobile-safari · desktop-chrome)

## Full Playwright (mobile-chrome project)

```powershell
pnpm exec playwright test --project=mobile-chrome --reporter=line
```

**37 passed · 5 failed** (1.0m) — log `docs/qa/v85-full-playwright.log`

V8.5 critical cases inside full suite: all green.  
Failures are pre-existing auth/community/live harness debt — not weakened or deleted.

## Domain journey

`lib/sport-intelligence/journey.test.ts` + nutrition/MCP — **65/65** with gateway.

## Smoke

`node scripts/smoke-test.mjs http://localhost:3001` → **14/14 PASS**

## Preview

NOT VERIFIED — no Vercel/`gh` credentials in agent environment.
