# Agent skills matrix (FitConnect Zenith)

**Date:** 2026-09-24  
**Policy:** Select applicable skills. Do **not** dump ECC/Superpowers catalogs into the product repo.

| Skill / system | Source | Purpose | Scope | Installed in FitConnect? | How activated | FitConnect use | Conflicts | License |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Tooling governance | `.cursor/rules/00-tooling-governance.mdc` | Approved tools only | Always | YES | alwaysApply | Gate installs | Wins over “install all” | Internal |
| Architecture | `AGENTS.md` + `fitconnect-architecture.mdc` | Strava/HC/nav | Always | YES | alwaysApply | Non-negotiable | Highest | Internal |
| Karpathy engineering | `.cursor/rules/karpathy-engineering.mdc` | Think/simple/surgical/goal | Always | YES (2026-09-24) | alwaysApply | Default coding posture | Under arch | Principles |
| UI/UX Pro Max | `.cursor/skills/ui-ux-pro-max` | Styles/UX/icons | Design | YES | skill invoke + `scripts/search.py` | Visual QA | — | Project |
| Design / brand / tokens | `.cursor/skills/{design,brand,design-system,ui-styling}` | Tokens & UI | Design | YES | skill invoke | Zenith | — | Project |
| Elite surface / multiplatform | `.cursor/skills/elite-*` | Compose/Web/iOS contract | Product | YES | skill invoke | Cross-surface | — | Project |
| Release gates / verify | `.cursor/rules/07-*` + `verify-before-responding` | Evidence before PASS | QA | YES | alwaysApply | Release honesty | — | Internal |
| Android / Web / iOS quality | `.cursor/rules/03-05` | Platform quality | Platform | YES | alwaysApply | Builds/tests | — | Internal |
| MCP security | `06-ai-mcp-security` + skill | Controlled MCP | AI | YES | alwaysApply | Zenith MCP | — | Internal |
| Superpowers | obra/superpowers | Brainstorm/TDD/debug/review | Process | NO (Cursor user install) | Cursor plugin/skills | Engineering workflow | May overlap ECC | Check upstream |
| ECC | affaan-m/ecc | Agents/commands/hooks | Process | NO — selective only if needed | User Cursor config | Optional harness | Conflicts Superpowers if both dumped | Check upstream |
| Matt Pocock skills | mattpocock/skills | TDD/PRD/triage/pre-commit | Process | NO (user install select) | skills finder | Feature discipline | Prefer over reinvent | Check upstream |
| Anthropic skills | anthropics/skills | Agent Skills pattern | Process | DO NOT VENDOR | Authorized Claude ecosystem only | Pattern inspiration | Restricted materials | Restricted |
| Find Skills | npx skills find | Discover skills | Process | Optional CLI | On demand | Avoid reinvent | — | Check |
| Caveman | skill | Compress agent chat | Agent UX | Optional | Chat only | Never code/YAML | — | Check |
| Humanizer | skill | Marketing prose | Copy | Optional | External docs only | Landing/investor | Never code | Check |
| Web Quality / Lighthouse | skill + `03-web-quality` | CWV/a11y/SEO | Web | PARTIAL (rules exist) | CI + skill | Prod ≥90 goal | — | Internal+upstream |
| Deploy to Vercel | Vercel skill | Preview/prod | DevOps | Optional | After gates | Deploy | Not before green | Official |
| Excalidraw | skill | Diagrams | Docs | Optional | `docs/diagrams/` | App flow / sync | — | Check |
| Removal/dead-code | Find Skills | Safe cleanup | Hygiene | On demand | After usage audit | Orphans | Don’t delete by guess | Check |

## Activation rule

```text
Product code → FitConnect skills + architecture rules
Agent process → Superpowers/Matt/Karpathy (user Cursor)
Never → GPL GymMane code, Anthropic restricted dumps, Expo reactivation
```
