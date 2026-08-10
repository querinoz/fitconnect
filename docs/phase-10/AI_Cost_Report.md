# AI Cost Report

`AiCostController`: per-user hourly rate limit, daily budget (abstract micros), response cache, token usage recording.
Logs: user, feature, model, tokens, latency — **no prompt bodies**.
Budget/rate exceeded → soft refuse without calling provider.
