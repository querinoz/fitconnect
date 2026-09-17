# Sport Training Engine (Zenith V8.5)

## Purpose

TRAIN is a **sport-specific session engine**, not a generic exercise list.

## Surfaces

| Layer | Location |
|-------|----------|
| Sport registry | `apps/web/lib/sport-intelligence/sport-registry.ts` |
| Sports identity | `apps/web/lib/sport-intelligence/sports-identity.ts` |
| Session composer | `apps/web/lib/sport-intelligence/session-composer.ts` |
| Adaptation engine | `apps/web/lib/sport-intelligence/adaptation-engine.ts` |
| Progression | `apps/web/lib/sport-intelligence/progression-engine.ts` |
| Rest timer | `apps/web/lib/sport-intelligence/rest-timer.ts` |
| Active session machine | `apps/web/lib/train/machine.ts` (existing) |
| Catalog plans | `apps/web/lib/train/catalog.ts` (existing) |
| Today UI | `apps/web/components/train/today-sport-engine.tsx` |
| API | `GET /api/v1/training/today` |

## Flow

1. Athlete selects sport (identity or Today chips)
2. Engine composes TODAY session from sport profile + catalog + readiness honesty
3. Explanation exposes WHAT / WHY / DATA / CONFIDENCE
4. START opens existing TRAIN prep → active → rest → complete (offline local draft)

## Honesty

- Readiness: AVAILABLE | LOADING | MISSING | UNAVAILABLE | NOT_CONNECTED | ERROR
- No fabricated biometrics
- Deload is **suggested**, never silently applied

## Extensibility

Add a sport by appending to `SPORT_REGISTRY` — do not rewrite the engine.
