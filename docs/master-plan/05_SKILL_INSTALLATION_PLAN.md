# 05 — Skill installation plan

**Date:** 2026-08-20  
**Phase lock:** `P0-DOCS`

## This phase

**Install nothing.** Creating `docs/master-plan/` is the only work.

A later command may say `EXECUTE MASTER PLAN — PHASE SKILLS` or similar. Until then:

```
git status
# expected: docs/master-plan/* only
```

## If/when skills are installed (after P0-DOCS)

1. Prefer skills **already in the repo**
2. Add at most the minimal set in `04_SKILLS_INTELLIGENCE.md`
3. One PR/block: skills files only, no product refactor
4. After install, re-read `AGENTS.md` — architecture wins over skill defaults
5. Never let ui-ux-pro-max replace `--eos-voltline` / `--eos-floor`

## Verification after a future install

- Skill files exist under `.cursor/skills` or `.agents/skills`
- No `package.json` dependency churn unless required
- No Expo un-freeze
- `pnpm test` still green

## Explicit non-goals

- Do not run `npx skills add` for hundreds of registries
- Do not copy Azure AKS/Foundry skills into FitConnect CI
- Do not install Higgsfield/scroll-world as a landing pipeline for v1
