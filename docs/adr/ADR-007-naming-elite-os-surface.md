# ADR-007 — Naming: "Elite OS" (product shell) and "Elite Surface" (design system)

**Date:** 2026-08-07
**Status:** Proposed

## Context

ADR-001 unified tokens under `--eos-*` (Elite OS). The v1 plan introduces "Elite Surface" as the design-system name and "Elite Capture" for the recording engine. Naming must be consistent across web CSS, Kotlin token output, docs, and marketing.

## Decision

| Name | Meaning | Code prefix |
|---|---|---|
| **Elite OS** | The product experience (athlete OS / coach OS shells) | route/nav copy only |
| **Elite Surface** | The design system: tokens, primitives, motion language | `--eos-*` CSS vars (kept — no rename churn), `EliteSurface*` Compose theme objects |
| **Elite Core** | Shared Rust domain engine | `elite-core` crate |
| **Elite Capture** | Android recording engine (service + sensors) | `core-capture` Gradle module |

`--eos-*` variable prefix is retained even though the DS is now "Elite Surface" — a global rename buys nothing and risks regressions; the prefix reads as "elite-os/elite-surface" ambiguously and that is fine. Documented here to stop future renaming debates.

## Consequences

- `docs/DESIGN_SYSTEM.md` gets a one-line naming header.
- Kotlin token generation (F0/F3) emits `EliteSurfaceColor`, `EliteSurfaceType`, `EliteSurfaceSpacing` objects.
