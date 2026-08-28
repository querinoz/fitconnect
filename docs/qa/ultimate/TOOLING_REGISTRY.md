# Tooling Registry — Ultimate QA Run 2026-08-27

| NAME | TYPE | SOURCE | VERSION | PURPOSE | INSTALLED? | USED? | WHERE USED | RESULT |
|---|---|---|---|---|---|---|---|---|
| Node.js | CLI | nodejs.org | v25.9.0 | Web/tooling runtime | YES | YES | pnpm, vitest, smoke | PASS |
| pnpm | CLI | pnpm.io | 9.15.9 | Monorepo package manager | YES | YES | test, lint, dev | PASS |
| Java JDK | CLI | Oracle | 17.0.12 | Android Gradle builds | YES | YES | gradlew test | PASS |
| Git | CLI | git-scm | 2.53.0 | Version control | YES | YES | repo scan | PASS |
| ADB | CLI | Android SDK | 1.0.41 | Emulator/device control | YES | YES | Android/Wear QA | PASS |
| Android Emulator | EMULATOR | Android SDK | API 37 phone, API 34 wear | Runtime QA | YES | YES | fitconnect_phone, fitconnect_wear | PASS |
| Gradle | CLI | android/gradlew | wrapper | Android build/test | YES | YES | :app:testDebugUnitTest | PASS |
| Vitest | TEST FRAMEWORK | @fitconnect/web | workspace | Unit/integration tests | YES | YES | 384 passed | PASS |
| Playwright | TEST FRAMEWORK | apps/web | workspace | E2E (not run this session) | YES | NO | — | NOT RUN |
| smoke-test.mjs | CLI | scripts/ | repo | HTTP route smoke | YES | YES | localhost:3001 | PASS (after hero marker fix) |
| make.ps1 | CLI | repo root | — | Windows make fallback | YES | YES | start script | PASS (after fix) |
| GNU Make | CLI | — | — | Canonical dev orchestration | NO | NO | — | PENDING (install on Windows) |
| cursor-ide-browser MCP | MCP | Cursor | — | Visible browser QA | NO | NO | server unavailable | BLOCKED |
| android-emulator-skill | SKILL | .cursor/skills | — | AVD/Gradle guidance | YES | YES | Android QA | PASS |
| elite-os-multiplatform-skill | SKILL | .cursor/skills | — | Three-surface architecture | YES | READ | architecture audit | PASS |
| Firebase verify module | LIBRARY | apps/web/lib/auth | new | RS256 JWT verification | YES | YES | security fix | PASS |

## Discovered but not used

| NAME | WHY NOT USED |
|---|---|
| Maestro | Not installed; ADB used instead |
| Docker | Not required for web-only dev start |
| Supabase CLI | No live DB credentials in session |
| Firebase CLI | Auth verification done in-app |
