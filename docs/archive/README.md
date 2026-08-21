# Historical archive

**Status:** HISTORICAL

**Canonical current plan:** [docs/master-plan/21_FINAL_ROADMAP.md](../master-plan/21_FINAL_ROADMAP.md)

**Production:** NO-GO

This tree stores prior phase reports, exit gates, audits, and snapshots that must remain for traceability. They are **not** the current product status.

Do not copy PASS / COMPLETE / production-ready language from these files into README or new work.

## Layout

```
docs/archive/
├── phase-00 … phase-16, phase-13r   prior engineering phases
├── android/                         Android snapshot reports / exit gates
├── qa/                              superseded cohesion / mega QA reports
├── release/                         prior GO/NO-GO snapshots (pre master-plan)
├── production/                      production-readiness snapshots
├── ascend/                          ASCEND gate snapshots
├── design/                          design audit snapshots
├── architecture/                    superseded architecture audits
├── landing/                         landing cleanup snapshots
├── ux/                              UX audit snapshots
├── audit/                           older audits
├── superpowers/                     May 2026 planning specs
├── docs-root/                       former docs/*.md snapshots
└── root/                            former repository-root Markdown
```

## Not archived here

| Path | Reason |
|------|--------|
| `docs/master-plan/` | Frozen execution roadmap (KEEP) |
| `docs/phase-17/` | Left in place — reporting scripts still read this path |
| Agent skills (`.cursor/skills`, `.agents/skills`, `.claude/skills`) | Tooling, not product status |

Stubs remain at several original paths so old links resolve.
