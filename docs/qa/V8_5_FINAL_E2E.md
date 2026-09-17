# V8.5 Final E2E Evidence

**Date:** 2026-09-17  
**Base URL (local prod):** `http://localhost:3001`  
**Branch tip:** `9fcbe08` (+ verification commit)

## Critical V8.5 surfaces (Playwright)

Command:

```powershell
cd apps/web
$env:PLAYWRIGHT_BASE_URL="http://localhost:3001"
pnpm exec playwright test tests/e2e/v85-sport-nutrition.spec.ts --reporter=line
```

**Result: 27/27 PASS** (mobile-chrome · mobile-safari · desktop-chrome)

| Coverage | Assertion |
|----------|-----------|
| `/train` | no 500; lands train or signin |
| `/dashboard` | no 500 |
| `/profile` | no 500 |
| `/recovery` | no 500 (Ascend path) |
| `GET /api/v1/sports/identity` | 200/401/403/503 only |
| `POST /api/v1/nutrition/targets` | blocked (401/403/405/503) |
| `POST /api/v1/nutrition/log` confirm:false | 400/401/403/503 |
| `POST /api/v1/training/completions` confirm:false | 400/401/403/503 |
| `GET /api/v1/mcp` | no secret patterns in body |

## Domain journey (unit — authenticated path substitute)

`apps/web/lib/sport-intelligence/journey.test.ts`

- Multi-sport differentiation (Running / Strength / Cycling / Football / Swimming / Boxing class covered via registry)
- Profile → compose → complete → meal → confirm log memory path

## Smoke HTTP

```text
node scripts/smoke-test.mjs http://localhost:3001
→ 14/14 PASS
```

## MCP security unit

`apps/web/lib/mcp/v85-security.test.ts` — write food tools absent; anonymous athlete tools 403; no sql/shell/exec catalog.

## Food adapters

`apps/web/lib/nutrition/sources/food-adapters.test.ts` — PortFIR/USDA local honesty; OFF low confidence; USDA note does not echo env var name.

## Not claimed as browser E2E (environment)

| Flow | Why |
|------|-----|
| Full authenticated PROFILE→TRAIN→COMPLETE UI clicks | Requires durable auth/demo session harness beyond this gate |
| Offline train + crash restore device | Needs instrumented client / emulator — Wear `adb` empty |
| Preview URL Playwright | Vercel/gh credentials unavailable |

Authenticated product logic is covered by domain unit + confirm-gate API contracts above. Do not treat UI click-path gaps as green; they remain external verification items.
