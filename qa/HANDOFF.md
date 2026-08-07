# QA Handoff — Cycle 01

**Stopped at:** Phase 1 static audit complete. **No code fixes applied** (per protocol: report before fixes).

**Next session should:**
1. Read `qa/STATE.json` + `qa/FINDINGS.json`
2. Install knip, jscpd, @axe-core/playwright (Phase 0 tooling)
3. Start fix loop with **QA-001** (hero i18n) and **QA-008** (sectionBreak locales)
4. Build route crawler → run against `pnpm start` on :3001
5. Attempt Android emulator + Maestro scaffold

**Needs you:**
- Confirm iOS Plan B (GitHub Actions macOS vs TestFlight manual)
- Approve localized sectionBreak copy vs keeping English brand words

**Branch for fixes:** `qa/cycle-01` (not yet created)
