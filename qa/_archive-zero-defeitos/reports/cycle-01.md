# Ciclo 01 — 2026-08-07

## Veredicto

**FAIL** — Build and unit tests are green, but parity, i18n, performance budgets, mobile E2E, and automated route coverage are not at the Zero Defeitos bar.

## Números

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Novos neste ciclo | 0 | 8 | 6 | 1 |
| Corrigidos | 0 | 0 | 0 | 0 |
| Em aberto | 0 | 5 | 6 | 1 |
| Bloqueados | 0 | 3 | 0 | 0 |

## Cobertura executada

| Suite | Corrida | Passou | Falhou | Skipped |
|---|---|---|---|---|
| Estática — typecheck | ✅ | ✅ | — | — |
| Estática — lint | ✅ | ⚠️ warnings | — | — |
| Estática — unit tests | ✅ | 236/236 | — | — |
| Estática — build | ✅ | ✅ | — | — |
| Estática — hex grep | ✅ | ❌ 35+ files | — | — |
| Estática — knip/jscpd | ⏭️ | — | — | tools N/A |
| Rotas — crawler | ⏭️ | — | — | not built |
| Jornadas persona | ⏭️ | — | — | phase 2 |
| a11y axe all routes | ⏭️ | — | — | phase 2 |
| perf lighthouse gate | ⏭️ | — | — | phase 2 |
| Android Maestro | ⏭️ | — | — | phase 3 |
| iOS Maestro | 🚫 BLOCKED | — | — | no macOS |
| Paridade matrix | ✅ draft | — | — | — |

## Top 5 achados (detalhe)

### QA-001 · P1 · Hero hardcoded English
The Elite OS hero (`hero-elite-os.tsx`) uses `useLocale()` for status labels but leaves **~15 strings in English**: live session title ("Threshold recalibration"), coach action copy ("Diego cut the final interval…"), proof stats labels, telemetry row labels, nav links body text, and the main subtitle paragraph. Switching to **pt/es/fr/de/it** does not translate these blocks — a direct violation of the i18n invariant.

### QA-002 · P1 · Performance budgets
Documented baseline: **LCP ~3.7s** (target ≤2.2s), Lighthouse mobile **perf 84–90** (target ≥92), **a11y 90** (target 100). Landing First Load JS **~335KB** (target landing ≤180KB gzip for initial). CI gate is conservative (84/90) but Zero Defeitos targets are not met.

### QA-003 · P1 · iOS BLOCKED
Environment is **Windows 10**. `xcrun simctl` and iOS Simulator are unavailable. Maestro iOS suite cannot run locally. **Plan B:** GitHub Actions macOS runner + Maestro artifacts, or EAS preview on physical iPhone.

### QA-008 · P1 · sectionBreak not translated
Cinematic break words (`CONNECT`, `PERFORM`, `TRAIN SMARTER`, etc.) are **identical English strings** in `pt.ts`, `es.ts`, `fr.ts`, `de.ts`, `it.ts`. Non-English users see English typography breaks — P1 i18n failure.

### QA-007 · P1 · Web/mobile visual parity
`stitch-native-primitives.tsx` and related Stitch screens use **legacy hex** (`#c0f500`, `#111827`, `#13121b`) instead of EOS tokens, while Elite OS dashboards use `--eos-*`. Side-by-side web dashboard vs `/mobile` preview vs Expo app will show visible color/spacing drift.

## O que foi corrigido neste ciclo

_Nothing — audit-only per protocol (report before code)._

## Achados em aberto

See `qa/FINDINGS.json` for full list with IDs QA-001 through QA-014.

## Ficheiros em quarentena

_None yet._

## Dívida técnica (não corrigida por decisão)

- Stack modernization (Next 15 / Tailwind v4) — deferred ADR-003
- ImageKit asset migration — needs account
- Tauri desktop binary — deferred ADR-004

## Bloqueado — precisa de decisão humana

1. **iOS QA path** — macOS runner vs TestFlight vs defer iOS to Phase 3 CI
2. **Marketing copy** for hero telemetry card — translate vs rewrite per locale
3. **sectionBreak** — keep English brand words vs localize (e.g. PT: "LIGA · PERFORME")

## O que ainda não está bom (honesto)

The product **builds and tests cleanly**, and Voltline v2 landing motion is wired. But Zero Defeitos requires **proof**, not green unit tests alone: no route crawler has clicked every button, axe has not scanned every page, mobile has no Maestro suite, iOS is blocked, performance targets fail, and i18n has real gaps on the hero and cinematic breaks. The dual `ui-glass` / `elite-os` layer and hardcoded hex in Stitch components will keep producing parity bugs until migrated.

## Próximo ciclo

1. Install Phase 0 tooling (knip, jscpd, @axe-core/playwright)
2. Build `qa/crawlers/route-crawler.ts`
3. Auto-fix batch: QA-001, QA-008, QA-009 (hex → tokens in touched files)
4. Run prod server + persona E2E + lighthouse
5. Scaffold Maestro + Android emulator smoke

**Estimativa até zero P0/P1/P2:** 4–6 ciclos (~2–3 sessions dynamic QA + 1–2 fix loops).
