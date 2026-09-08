# FitConnect Zenith — Mobile Visual Contract (Phase 0)

**Status:** APPROVED (2026-09-08 — human)  
**Gate:** Phase 1–11 authorized. Visual frames in `docs/design/visual-contract/` are the contract of record.  
**Date:** 2026-09-08  
**IA lock:** [`ZENITH_MOBILE_IA.md`](./ZENITH_MOBILE_IA.md) — `Feed · Ascend · [TRAIN] · Dashboard · Profile`

---

## 1. Discovery evidence (mandatory)

### PHASE: Tool / Skill / MCP discovery  
**GOAL:** Select the smallest high-quality toolchain before visual decisions.

| Discovered | Type | Status |
|------------|------|--------|
| `cursor.GenerateImage` | Native tool | **Connected** — used for 9:16 frames |
| `cursor-ide-browser` | MCP | Connected — usable for web/Figma-in-browser if authenticated |
| `plugin-wonder-wonder` | MCP | **needsAuth** — candidate for design tooling; not connected |
| Firebase MCP | MCP | Connected — not relevant to visual contract |
| Dedicated Figma MCP / plugin | MCP | **Not found** in catalog |
| `elite-surface` | Skill | Selected — EOS tokens / neu-glass / typography lock |
| `ui-ux-pro-max` | Skill | Selected — hierarchy, touch, a11y, motion guidance |
| `mobile-design` | Skill | Selected — touch-first / performance constraints |
| `android` (Compose) | Skill | Deferred to Phase 1+ |
| `android-emulator-skill` | Skill | Deferred to Phase 5–6 (FPS / install / Maestro) |
| `android-accessibility` | Skill | Deferred to Phase 6 |
| Maestro (`.maestro-zenith`) | Local CLI | Available; install on device was user-restricted earlier |

### TOOL AVAILABLE BUT NOT CONNECTED

```text
Tool: plugin-wonder-wonder (MCP)
Purpose: Design / creative tooling (possible Figma-adjacent workflow)
Why it matters: Could improve design handoff vs image-only contract
Required: mcp_auth / user permission
Impact if unavailable: Visual contract proceeds via GenerateImage + Elite Surface tokens
Fallback: cursor.GenerateImage + docs/design EOS tokens + ZENITH_MOBILE_IA
```

```text
Tool: Dedicated Figma MCP
Purpose: Inspect frames, spacing, components as design intelligence
Status: NOT PRESENT in environment catalog
Fallback: 9:16 PNG visual contract below + Elite Surface token extraction
```

### Selected toolchain (Phase 0)

| Tool / Skill | Purpose | Phase | Outcome |
|--------------|---------|-------|---------|
| GetDynamicTools | Discovery | 0 | Catalog inventoried |
| elite-surface | Brand / token lock | 0 | Palette + type locked |
| ui-ux-pro-max | Layout / hierarchy | 0 | Applied to frame briefs |
| mobile-design | Touch / mobile constraints | 0 | Applied to briefs |
| GenerateImage | 5× visual frames | 0 | 5 PNGs produced |
| Figma MCP | Design intelligence | 0 | **Unavailable** — fallback used |

---

## 2. Identity lock (immutable)

| Token | Hex | Role |
|-------|-----|------|
| Floor | `#070B14` | OLED background |
| Voltline | `#C8FF00` | CTA / TRAIN / peaks |
| Iris | `#6C63FF` | Secondary focus |
| Telemetry | `#3CD7FF` | Live / ring secondary |

**Type:** Syne (display) · Plus Jakarta Sans (body) · JetBrains Mono (metrics)

**Forbidden:** orange gym skins, Inter/Roboto as brand type, Dashboard-as-home, Strava-in-Feed.

---

## 3. Frame inventory

Canonical copies live in [`docs/design/visual-contract/`](./visual-contract/):

| # | Screen | File | Job |
|---|--------|------|-----|
| 01 | Splash / Brand | `fc-vc-01-splash.png` | Brand-first cold start + one Voltline CTA |
| 02 | Feed | `fc-vc-02-feed.png` | Social-first media + StoryStrip + TRAIN FAB |
| 03 | Ascend | `fc-vc-03-ascend.png` | Rings + progression (not metric wall) |
| 04 | Train | `fc-vc-04-train.png` | Hero session + Start CTA |
| 05 | Dashboard | `fc-vc-05-dashboard.png` | Sparse readiness/load rings |

---

## 4. Per-screen contract

### 01 — Splash

- Floor field; FitConnect mark + wordmark dominant  
- One short tagline; athletic atmosphere only (no badge clutter)  
- One Voltline primary CTA  
- Brand test: remove chrome → still FitConnect  

### 02 — Feed

- Social-first: people / coaches / media moments  
- Calmer header + StoryStrip / chips  
- Large rounded media cards  
- Soft bottom chrome; **TRAIN FAB** dominant  
- **Must not** become Today’s Workout / calories / chest-day dashboard  

**Contract correction vs generated art:** bottom destinations must remain  
`Feed · Ascend · [TRAIN FAB] · Dashboard · Profile`  
(Do not ship a literal fifth text tab labeled “TRAINING”.)

### 03 — Ascend

- Greeting + **one primary ring** (level/XP)  
- Secondary streak / focus cards  
- Iris/Telemetry only as supporting accents  
- Avoid overcrowded metric grids  

### 04 — Train

- Hero media / session identity  
- WHAT · WHY · WHEN → **Start** (Voltline)  
- Minimal friction; strongest workout energy  

### 05 — Dashboard

- Readiness / load rings + sparse Mono metrics  
- Distinct from Feed (no social wall as primary)  
- Optional light “recent” strip only if it stays subordinate to rings  

---

## 5. Consistency checklist (reviewer)

- [ ] Palette matches EOS hexes (no orange substitute)  
- [ ] Feed is social-first  
- [ ] TRAIN is central FAB energy, not a peer text tab  
- [ ] Ascend rings > metric soup  
- [ ] Train Start CTA unmistakable  
- [ ] Dashboard ≠ Feed  
- [ ] Typography intent readable as Syne / Jakarta / Mono  

---

## 6. Process note (honesty)

A prior agent turn applied Compose polish **before** this gate. That violates the protocol above.

**Until you approve this contract:**

1. Treat further Compose as **blocked**.  
2. After approval, Phase 1 must **reconcile** existing `design-ui` / athlete UI against this contract (reuse > recreate).  
3. Do not treat previous `assembleDebug` as Phase 11 success.

---

## 7. Approval gate

Reply with one of:

```text
VISUAL CONTRACT APPROVED
```

or

```text
VISUAL CONTRACT CHANGES:
- <screen>: <change>
```

Only after **APPROVED** may the agent proceed:

```text
Phase 1 Design System → Phase 2 Athlete screens → Full Polish → Hygiene → Functional QA → Performance → Final Report
```

**Phase 0 exit:** PASS only when human approval is recorded.  
**Phases 1–11:** NOT STARTED under this protocol.
