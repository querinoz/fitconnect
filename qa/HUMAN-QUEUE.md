# Human Queue — read this first

Protocol: FitConnect v1 — Elite Core / native Android rewrite (`docs/adr/ADR-005` onward). Ordered by what unblocks the most work.

---

## 🔴 BLOCKED — MCP tooling (blocks all of Via A "verify with eyes")

**Item:** Playwright MCP and an Android emulator/adb/Maestro MCP are not active in the Claude Code session that ran F0 setup on 2026-08-07. "Section 5.0" (the plugin/MCP list referenced in D6) was not available to verify against — it isn't in this repo or in the conversation the agent had. Confirmed this is not fixable from Bash: no `claude` CLI is reachable from this environment to run `claude mcp add` — this has to happen through the owner's Claude Code / Cowork configuration directly.
**Impact:** No "verificar com olhos" — no web screenshots, no emulator, no logcat, no Maestro flows. Owner chose to pause Via A entirely rather than proceed doc-only or paste section 5.0. Does **not** block compiling/testing code (that gap is resolved, see below) — only blocks visual/device verification.
**Unblocks:** F3 onward (first phase needing a real device/emulator screen), and any "verify with eyes" loop generally.
**Action needed:** confirm the MCPs are configured and active in-session (or paste the section 5.0 list so the agent can verify item-by-item instead).

---

## 🔴 BLOCKED — Emulator cannot run: virtualization disabled in BIOS/UEFI

**Item (2026-08-07):** Owner asked to open the app in the Android emulator. The AVD was created (`fitconnect_phone`, Pixel 7, API 37 image) and the debug APK builds, but the emulator refuses to start: `x86_64 emulation currently requires hardware acceleration` — and `systeminfo` shows **"Virtualization Enabled In Firmware: No"** (CPU supports it: "VM Monitor Mode Extensions: Yes"). No hypervisor (WHPX or Google AEHD) can be installed on top of disabled firmware virtualization; there is no software workaround, and the shell is non-admin anyway.
**Action needed (once, ~3 minutes):**
1. Reboot → enter BIOS/UEFI (usually Del/F2 during boot).
2. Enable **SVM Mode** (AMD) — typically under Advanced → CPU Configuration.
3. Boot Windows, then either: enable Windows Hypervisor Platform (`OptionalFeatures.exe` → "Plataforma do Hipervisor do Windows") **or** install Google's AEHD driver (Android Studio → SDK Tools → "Android Emulator hypervisor driver").
4. Say the word — the AVD is ready, everything else is in place (`adb`, image, APK).

**Alternative that works today:** plug a physical Android phone with USB debugging on — `adb` is installed and I can install + drive the app on it immediately (this also overlaps with D3, which F4/F5 need anyway).
**Impact:** blocks emulator-based verification only. The APK itself builds and its unit tests/lint pass.

---

## 🔴 BLOCKED — D3: Hardware (physical gate F4/F5)

**Item:** Not specified by owner (placeholders left blank in the F0 response).

- Telemóvel Android físico (modelo + versão): —
- Relógio Wear OS (ou "nenhum"): —
- Cintas de FC BLE — gate F5 pede 3 de marcas diferentes: —
- Medidor de potência / sensor de cadência: —
- Relógio de referência para o gate F4 (Garmin, Coros, etc.): —

**Impact:** F4 and F5 gates are physical and cannot be simulated. Blocks F4/F5 specifically — does **not** block F1–F3 or F12 (per protocol, work continues on non-dependent phases).
**Action needed:** fill in before F4, not during.

---

## 🔴 BLOCKED — D4: Legal review (archive-file import)

**Item:** Status not specified by owner (orçamentada / em curso / ainda não — left unanswered).
**Impact:** Blocks only the archive-ZIP import feature (Strava/Garmin bulk export). F8 proceeds without it per default: Health Connect + individual FIT/GPX/TCX file import + push-to-Strava. Archive import becomes F8b once cleared.
**Action needed:** confirm status when known.

---

## ✅ RESOLVED (named assumption, veto window open) — Android `applicationId`

**2026-08-07:** owner instructed "continue from what needs doing" without answering; per the never-idle rule the agent adopted **`com.fitconnect.android`** (+ `.wear`), minSdk 26/30, compile/target 35 — matching the partial scaffold. Only becomes immutable at first Play upload (F15); veto any time before that. Original item kept below for context.

## 🟡 ~~NEEDS A DECISION~~ — Android `applicationId` / package name (superseded, see above)

**Item:** `apps/mobile/app.config.ts` never set a real Android package (Expo app was UI-preview only, per ADR-005 context). The native `android/` scaffold needs a permanent `applicationId` before it's generated — this is the kind of identifier that's painful to change later (Play Store listing, deep links, Health Connect permission declarations, JNI export symbol names in `elite-core/jni` all key off it).
**Impact:** Blocks generating `android/` (next F0 step). Does not block anything else.
**Action needed:** confirm a package name (e.g. `com.fitconnect.android`, or a preferred reverse-domain) and min/target SDK levels, or say "use your best judgement" and the agent will pick a reasonable default and note it as a named assumption.

---

## ✅ RESOLVED — local toolchains installed (2026-08-07)

Rust (via `rustup`/winget) and Android SDK cmdline-tools + platform-tools + build-tools (34/35/36.1/37) + platforms (35, 36.1) + NDK 26.1.10909125 (via `sdkmanager`, licenses accepted) are installed. `ANDROID_HOME`/`ANDROID_SDK_ROOT`/`JAVA_HOME` set persistently (User env scope) — note a stray incorrect `JAVA_HOME` pointing at the Git install was overridden to the real JDK 17 at `C:\Program Files\Java\jdk-17`. Verified: native + `wasm32-unknown-unknown` builds, `cargo test`, `cargo fmt --check`, `cargo clippy -D warnings` all pass clean on the new `elite-core/` workspace skeleton. The Android SDK already had build-tools/platforms/NDK present before this session touched it — worth knowing this machine had prior Android tooling installed outside any tracked env var, in case that explains other undocumented local state.

**Remaining, separate gap:** no AVD (emulator image) created yet — unrelated to the MCP item above; raw SDK vs. the MCP that lets the agent drive it are two different things.

---

## Resolved this session (log)

- **qa/ directory collision** — an unrelated, active QA cycle ("Operation ZERO-DEFEITOS", i18n/parity audit of the current web/mobile product) already owned `qa/STATE.json`, `qa/HANDOFF.md`, `qa/FINDINGS.json`, `qa/PARITY-MATRIX.md`, `qa/reports/`. Owner chose to archive it to `qa/_archive-zero-defeitos/` (via `git mv`, history preserved) and repurpose `qa/` for this protocol. That cycle is paused, not cancelled — see its own `HANDOFF.md` in the archive folder to resume it independently.
