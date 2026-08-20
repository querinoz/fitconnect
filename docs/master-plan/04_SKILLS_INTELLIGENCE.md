# 04 — Skills intelligence

**Date:** 2026-08-20  
**Phase lock:** `P0-DOCS`  
**Install skills?** **NO — not in this phase.** Wait for an explicit later command.

## Already in this repository (use these; do not duplicate)

| Skill | Path | Use when |
| --- | --- | --- |
| elite-os-multiplatform | `.cursor/skills/elite-os-multiplatform` | Surfaces, ADR, Wear, web dashboards |
| elite-surface | `.claude/skills` / `.cursor/skills` | Tokens, motion, a11y, i18n |
| sports-metrics | `.claude` / `.cursor` | NP, IF, TSS, CTL/ATL, HRV, GPS filter |
| elite-core-rust | `.claude/skills/elite-core-rust` | Rust crate / JNI / WASM |
| android-accessibility | `.cursor/skills/android-accessibility` | TalkBack / touch / contrast |
| android-emulator-skill | `.cursor/skills/android-emulator-skill` | AVD `fitconnect_phone` |
| ui-ux-pro-max | `.cursor/skills/ui-ux-pro-max` | Palettes/type **only after** Elite OS override |
| design-system / brand / ui-styling | `.cursor/skills` | Tokens, brand, Tailwind |
| elite-os-html-mockups | `.cursor/skills` | `docs/mockups` only |
| impeccable / design-taste-frontend | `.agents/skills` | UI critique, not new palettes |
| scroll-world | `.agents/skills` | **Do not run in v1** (landing cinematic deferred) |

Elite OS `--eos-*` **overrides** generic UI-UX palettes. Never invent a third palette.

## Already documented as installed outside product code

See `docs/AGENT_TOOLCHAIN.md`: Playwright MCP profiles, Firecrawl, Perplexity, chrome-mcp, context7, impeccable. OmniRoute is owner-accepted with confidentiality risk — never on `apps/` / `android/` / `packages/` if used at all.

## Rejected: mass install

Do **not** install a 200+ skill dump, “find every skill on the internet,” or bulk Superpowers. Cost: context pollution, conflicting design advice, and agents ignoring AGENTS.md.

## Recommended later (P0-SEC+), still not now

Minimal **additional** set, if a future command says install:

- `find-skills` (discovery only)
- Superpowers **subset** (execute-plan / verification) — not the whole collection
- grill-with-docs / Context7 (already MCP)
- Next.js latest practices (docs, not a competing app generator)
- Supabase Postgres + RLS skill
- Playwright + a11y audit helpers

## Hard bans

- Skills that generate FirebaseUI or generic auth screens
- Skills that “add Social/Reels” as a template
- Azure/Foundry skills unless the task is Azure (this product is Vercel + Android)
