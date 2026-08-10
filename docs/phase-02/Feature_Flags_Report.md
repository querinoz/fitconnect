# Phase 02 — Feature Flags Report

## Architecture

`FeatureFlagStore` with:

- Typed `FeatureFlag` enum + defaults  
- Local overrides (memory + DataStore)  
- Remote overlay (`applyRemote`)  
- Kill switch (`KILL_SWITCH_NETWORK` → ApiClient short-circuit)  
- Experiment placeholder (`EXPERIMENT_NEW_SPLASH`)

Flags cover auth providers, offline sync, push, kill switch — ready for gradual rollout and remote config providers without vendor lock-in.

## Tests

`FeatureFlagStoreTest` — remote override + kill switch + local set.

## Gaps

- No remote config fetcher scheduled yet  
- No percentage / cohort rollout evaluator (interface ready via remote map)
