---
name: elite-surface
description: Use when building or touching UI on any Elite Surface target (web CSS, Android Compose) — tokens, motion, i18n, a11y rules for the FitConnect v1 design system. Load before writing component styles, choosing colors, or adding a Compose theme object.
---

# Elite Surface — design system skill

Naming per `docs/adr/ADR-007-naming-elite-os-surface.md`: **Elite OS** is the product shell, **Elite Surface** is the design system (this skill), **Elite Core** is the Rust engine, **Elite Capture** is the Android recording service. Don't rename `--eos-*` — that ambiguity is deliberate and documented, not a bug to fix.

## Source of truth

- Web: `apps/web/app/elite-os.css` (canonical `--eos-*` vars), `packages/design-tokens/` (`COLOR_TOKENS`, web + mobile), `apps/web/lib/design-system/tokens.ts` (`EOS_COLORS`).
- Kotlin/Compose: generated from the same `packages/design-tokens/` source via a Style Dictionary pipeline extension (ADR-005 consequence — build this pipeline in F0/F3 if it doesn't exist yet; check before assuming). Output objects are named `EliteSurfaceColor`, `EliteSurfaceType`, `EliteSurfaceSpacing` (ADR-007).
- **Never hand-author a second copy of a color/spacing value in Kotlin.** If the generator doesn't cover something yet, that's a generator gap to fix, not a reason to hardcode.

## Palette (do not invent new hues — extend usage, not the palette)

| Token | Hex | Use |
|---|---|---|
| `--eos-floor` | `#070B14` | Obsidian background |
| `--eos-voltline` | `#C8FF00` | CTA, athlete accent, peaks |
| `--eos-connect` | `#00DDB4` | Telemetry, trust |
| `--eos-telemetry` | `#3CD7FF` | Live data |
| `--eos-iris` | `#6C63FF` | Secondary focus |
| `--eos-performance` | `#00E090` | Success |
| `--eos-recovery` | `#FFB020` | Amber / caution |
| `--eos-alert` | `#FF3A5C` | Alert |

## Typography

Syne (display/headlines) · Plus Jakarta Sans (body) · JetBrains Mono (metrics, `SYS.*` labels). On Android, map to the equivalent font families via the Compose `Typography` object generated alongside colors — don't ship a third font choice "because Android."

## Rules (apply on every surface, not just web)

- Zero hardcoded hex/dp/color literals in new components — tokens only, on **every** target (this extends the existing web rule to Kotlin/Compose).
- Dark-first. Respect `prefers-reduced-motion` on web (`data-motion="reduced"`) and the Android equivalent (`Settings.Global.ANIMATOR_DURATION_SCALE` / `AccessibilityManager.isReduceMotionEnabled` where available) — motion must degrade the same way on both platforms, not just web.
- i18n: 6 locales (EN/PT/ES/FR/DE/IT) via `apps/web/lib/i18n/` on web. Android has no i18n system yet (`docs/CLAUDE.md` §10 flags this gap) — F3 must stand one up before any dashboard copy ships, not retrofit it after.
- Focus visible + high-contrast toggle is a stated P1 target for web (`CLAUDE.md` §18) — carry the same bar to Android (TalkBack focus order, contrast).

## Verification

Web: Playwright screenshots at 375/768/1440/2560, motion normal **and** reduced (per the Via A loop rules). Android: emulator screenshot + UI hierarchy dump + a11y check via the Android MCP tooling, same normal/reduced-motion pairing. **Both of these are currently blocked in this project — see `qa/HUMAN-QUEUE.md`.** Do not claim a component "looks right" without the actual screenshot; note it as unverified instead.

## Legacy (don't touch beyond what's asked)

`ui-glass/` (~47 imports) and `--volt-*`/`--ink-*` aliases in `voltline.css` are deprecated but not deleted — migrate opportunistically when a file is already being touched for another reason, not as a standalone sweep unless explicitly scoped.
