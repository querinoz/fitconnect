# 16 — LANDING REGRESSION QA

**URL:** https://fitconnect-phi.vercel.app/

Hero, LOCAL DEMO pill, ENTER ELITE OS, coach carousel, ecosystem, footer, EN language control: **PASS** render.

Language menu: 6 locales listed; **clipped** by nav overflow (see 15). **FAIL** (P2).

CTA ENTER ELITE OS click from snapshot did not navigate (still `/`). Direct `/dashboard?demo=1` works. Treat CTA as **PARTIAL**.

Placeholder company links `/#`: **STILL OPEN**.

Uncommitted local `landing-os-nav.tsx` removes `overflow-hidden` but **is not deployed**. Live still clips.

## vs Run #1

Landing still **GO** as showcase with the same P2/P3 defects.
