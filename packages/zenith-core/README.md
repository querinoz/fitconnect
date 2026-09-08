# @fitconnect/zenith-core

Deterministic **Zenith Performance Engine**. No LLM. No invented telemetry.

```ts
import { evaluateAthleteState } from "@fitconnect/zenith-core";

const state = evaluateAthleteState({
  hrvMs: 61,
  baselineHrvMs: 72,
  sleepHours: 6.2,
  sleepEfficiency: 78,
  strainScore: 70,
  acute: 130,
  chronic: 100,
  plannedHighIntensity: true,
});
```

See `docs/zenith/`.
