# Skills, plugins, MCP — gap (2026-08-18)

This workspace’s **live** MCP catalog (GetMcpTools): `cursor-app-control`, `cursor-ide-browser` only.  
Claude.ai connectors the owner already has (Vercel, Supabase, Sentry, Figma) are **not** attached to this Cursor agent.

## Skills loaded / added this session

| Skill | Location | Role |
|---|---|---|
| elite-surface | `.cursor/skills/` (copied from `.claude/skills`) | Tokens, palette, type |
| elite-os-multiplatform | `.cursor/skills/` **new** | 3 surfaces, ADRs, session lock |
| elite-os-html-mockups | `.cursor/skills/` **new** | Honest HTML maquettes |
| android-accessibility | `.cursor/skills/` | TalkBack / 48dp |
| android-emulator-skill | `.cursor/skills/` | AVD `fitconnect_phone` |
| sports-metrics | `.cursor/skills/` (copied) | Do not invent TSS/CTL |
| impeccable | `.agents/skills/` | Brand vs product registers |
| design-taste-frontend | `.agents/skills/` | Anti-slop (fonts: Elite Surface wins) |
| emil-design-eng | user Codex skills | Motion craft |
| ui-ux-pro-max | user Codex skills | A11y + charts |
| elite-core-rust | `.claude/skills/` | Not used this session (no Rust edits) |
| canvas | Cursor built-in | Skipped (HTML requested) |

## Not installing (noise / §16)

Do **not** bulk-install 20–30 GitHub “awesome skills”. They fight Elite Surface (wrong palettes, Inter, confetti).

Reasonable **later** additions, only if the owner confirms:

- Playwright skill (web E2E) — repo already has Playwright
- Lighthouse CI skill — FASE 7
- Wear ambient / complications skill — FASE 2C

## MCP to add in Cursor Settings (owner action)

Cursor cannot enable OAuth connectors from the agent. Add these in **Cursor Settings → MCP** with the same accounts already connected in Claude:

| Server | Why |
|---|---|
| Vercel | Prod URL, deploy, env — FASE 7 publish |
| Supabase | Auth + Realtime evidence for ADR-002 |
| Sentry | Do **not** add tracking to landing without §16.4 ask |
| Figma | Only if design files exist; mockups are HTML in-repo |

Keep `cursor-ide-browser` for maquette screenshots.

## Plugins

No Cursor plugin install this session. Android SDK / emulator remain a **machine** dependency (`docs/HUMAN_FINAL_CONFIGURATION.md`), not a plugin.
