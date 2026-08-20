# 14 — Accessibility audit

**Date:** 2026-08-20  
**Phase lock:** `P0-DOCS`

## Requirements (Elite Surface)

- TalkBack on all athlete destinations + FAB
- Touch targets, contrast on `--eos-*` pairs
- Focus visible; high-contrast toggle still a P1 product debt (CLAUDE.md)
- Web: reduced motion respected
- 200% font (P8)

## Current

Android a11y skill + some `testTag`s / semantics exist. No certified TalkBack pass. Web lint warns on raw `<img>` (marketing). Footer legal links are not real destinations (P0-SEC also an a11y/legal issue).

## When

Critical legal links: **P0-SEC**. Full TalkBack/200%: **P8**. Do not block P0-SEC on a Lighthouse cosmetic pass.
