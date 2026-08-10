# PHASE 13R — RECOVERY AUDIT

**Audit date:** 2026-08-09
**Auditor:** agent (static inspection only — see ENV-01)
**Method:** direct file/source inspection. **No command was executed.**
**Result:** `EXIT_GATE = FAIL` · `NEXT_PHASE = LOCKED` (unchanged)

> This audit does not close a single launch-critical blocker. It corrects the
> classification of two blockers that were mis-filed as purely human-blocked,
> and records one new environment blocker.

---

## 0. ENV-01 — NEW BLOCKER (P0, execution environment)

| Field | Value |
|-------|-------|
| ID | ENV-01 |
| Severity | P0 |
| Problem | The agent's shell/execution sandbox is unavailable this session. Error: `Workspace unavailable — HYPERVISOR_VIRT_DISABLED`. Two attempts, both hard-failed (not a boot delay). |
| Impact | **No** verification command can be run: `adb`, `emulator`, `gradlew`, `maestro`, `keytool`, `apksigner`, unit tests, lint. |
| Consequence | Every Phase 13R gate that requires execution evidence is **unverifiable this session**, regardless of code state. |
| Classification | HUMAN-REQUIRED (host virtualization must be enabled, or the agent must be run in an environment with a working shell) |
| Unlock condition | `mcp__workspace__bash` returns output for `adb version` |

Per FAOS rules, absence of an execution environment cannot be resolved by
substituting static reading for evidence. Static inspection is recorded below as
**diagnosis**, never as PASS.

---

## 1. Documents found

Present in `docs/phase-13r/`:

- `PHASE_13R_INTAKE.md`
- `PHASE_13R_STATUS.md`
- `PHASE_EXIT_GATE.md`
- `HUMAN_ACTION_REQUIRED.md`
- `ANDROID_CERTIFICATION_STATE.md`
- `ANDROID_BLOCKER_RECOVERY.md`
- `ANDROID_AVAILABLE_TEST_DEVICES.md`
- `ANDROID_AUTHORIZATION_MATRIX.md`
- `ANDROID_UNUSED_CODE_AUDIT.md`

Prior exit gate (2026-08-08) recorded `EXIT_GATE = FAIL`, `NEXT_PHASE = LOCKED`.
This audit **confirms** that verdict and does not revise any severity downward.

---

## 2. Reconciliation — documented vs. real state

Real state column = verified by reading files in this repository.

| ID | Blocker | Documented | Real state (static) | Evidence | Agent-fixable? |
|----|---------|-----------|--------------------|----------|----------------|
| B-DEV-01 | Physical/virtual device | FAIL | **UNVERIFIABLE** — cannot run `adb` (ENV-01) | — | NO |
| B-AUTH-01 | Live IdP | FAIL | **CONFIRMED FAIL** — no `android/local.properties`; only `keystore.properties.example` exists | `Glob android/{local.properties,…}` → absent | NO (needs credentials) |
| B-SIGN-01 | Release signing | FAIL | **CONFIRMED FAIL** + fail-open defect (see §4) | no `keystore.properties` | MIXED |
| B-FCM-01 | Push | FAIL | **CONFIRMED FAIL — unimplemented, not just unconfigured** | `AppContainer.kt:121` binds `NoOpNotificationGateway()` unconditionally; no google-services plugin in `app/build.gradle.kts`; no Firebase dependency | **MIXED — substantial agent work outstanding** |
| B-RT-01 | Realtime | FAIL | **CONFIRMED FAIL — unimplemented, not just unconfigured** | `AppContainer.kt:125` binds `NoOpRealtimeClient()` unconditionally; `Realtime.kt:18-24` returns `emptyFlow()` / `Ok(Unit)` | **MIXED — substantial agent work outstanding** |
| B-E2E-01 | Maestro E2E | BLOCKED | **UNVERIFIABLE** — 8 flows exist on disk, none runnable (ENV-01) | `maestro/android/*.yaml` × 8 | NO (this session) |
| B-QA-01 | QA suite | FAIL | UNVERIFIABLE (depends on device + E2E) | — | NO |
| B-SEC-01 | Security | UNVERIFIED | UNVERIFIED — unchanged | — | NO |
| B-PERF-01 | Performance | UNVERIFIED | UNVERIFIED — no field measurement possible | — | NO |

**Zero launch-critical gates moved. `VERIFIED = 0` remains accurate.**

---

## 3. Classification

### AGENT-FIXABLE (none closeable this session)
- `ProductionConfigGate.validate` has a dead branch (`ProductionConfigGate.kt:11-12`:
  `if (!enforce && isDebuggable) return` is unreachable-equivalent, immediately
  followed by `if (!enforce) return`). Cosmetic; **not** touched — no compiler
  available to verify, and §17 forbids "fixed" without retest.

### HUMAN-REQUIRED
- ENV-01 (execution environment) — **new, and gates everything else**
- Supabase production URL + anon key
- Release keystore
- Firebase project + `google-services.json`
- Realtime backend provisioning decision
- Physical device attachment

### MIXED — corrected classification
`HUMAN_ACTION_REQUIRED.md` §3 (FCM) and §4 (Realtime) are filed as awaiting human
credentials. That is **incomplete**. Both are bound to No-Op implementations
unconditionally in DI. Supplying credentials alone would **not** produce a passing
gate, because:

- there is no `FirebaseMessagingService`, no token registration path, no
  notification channel wiring, and no Google Services Gradle plugin applied;
- there is no realtime transport implementation of any kind — `subscribe()`
  returns `emptyFlow()` and `publish()` returns `Ok(Unit)` without doing anything.

This is engineering work owed by the agent, currently invisible in the blocker
list. It is recorded here so the remaining effort is not underestimated. It is
**not** started this session: it cannot be compiled or tested (ENV-01), and
writing untestable production adapters is precisely the scaffolding-as-progress
pattern the phase rules prohibit.

---

## 4. New finding — SIGN-02: release signing fails open

`android/app/build.gradle.kts:85-88`

```kotlin
val releaseSigning = signingConfigs.getByName("release")
if (releaseSigning.storeFile != null && releaseSigning.storeFile!!.exists()) {
    signingConfig = releaseSigning
}
```

`assembleRelease` / `bundleRelease` **succeed and emit an unsigned artifact** when
`keystore.properties` is absent. The guard task `verifyReleaseProductionSecrets`
(lines 108-137) is only attached when `-Pfitconnect.enforceProdConfig=true` is
passed explicitly (line 136).

**Consequence:** the default release path is fail-open, not fail-closed. An
unsigned, secret-less RC can be produced by an operator who simply forgets the
flag. This contradicts the FAOS fail-closed protocol.

- **Severity:** P0 (release integrity)
- **Classification:** AGENT-FIXABLE
- **Proposed fix:** make the guard unconditional for release variants and fail the
  build when `signingConfig` resolves to null — inverting the default from
  opt-in enforcement to opt-out.
- **Status:** **NOT APPLIED.** Requires a Gradle run to verify both the expected-failure
  and valid-configuration cases (§8 of the phase protocol). Blocked by ENV-01.

---

## 5. What was NOT done, and why

Per §22 and the STOP CONDITION:

- No code was modified. Every candidate fix requires BEFORE → FIX → **TEST** → AFTER
  evidence; no test can be executed.
- No gate was moved from FAIL/UNVERIFIED to PASS.
- No severity was reduced.
- No mock, stub, or synthetic flow was created to satisfy a gate.
- Phase 14 was not started. `NEXT_PHASE` remains `LOCKED`.

---

## 6. Recovery plan (ordered, once ENV-01 clears)

1. Restore shell. Verify: `adb version`, `./gradlew --version`, `java -version`.
2. Apply **SIGN-02** fix; prove fail-closed (build must fail with no keystore),
   then prove pass with a valid keystore.
3. Human supplies Supabase prod URL + anon key → rebuild with
   `-Pfitconnect.enforceProdConfig=true` → confirm `usesLiveAuth` selects
   `SupabaseAuthRepository` at `AppContainer.kt:158`.
4. Human supplies keystore → `bundleRelease` → `apksigner verify --print-certs`.
5. Start AVD `fitconnect_phone` or attach hardware → `adb wait-for-device` →
   `getprop sys.boot_completed` → install RC.
6. Install Maestro → run all 8 flows against the real RC on a real device.
7. **Implement** FCM gateway + realtime client (see §3 MIXED) — this is build work,
   not configuration.
8. Device-level FCM proof: real token → real push → foreground/background/killed.
9. Dual-client realtime propagation proof.
10. QA / security / performance passes with recorded numbers.
11. Re-run `PHASE_EXIT_GATE`.

---

## 7. Risk

The largest risk to schedule is **not** the missing credentials — it is §3 MIXED.
FCM and Realtime are tracked as waiting on humans when they are in fact
unimplemented. Any plan that assumes "credentials arrive → gates go green" will
slip. Both need implementation, then device certification.
