# FASE A — Limites de ambiente

**Data:** 2026-08-18 · **Executor:** sessão Cowork na cloud, com `D:\fitconnect` montado
numa VM Linux local.

> **Isto não substitui a FASE A corrida em Claude Code no Windows.** Os comandos
> PowerShell do MEGA PROMPT v5 §1 **não foram executados** — esta VM é Linux. O que está
> abaixo é o que se conseguiu medir daqui.

## Executável a partir daqui

| Ferramenta | Resultado |
|---|---|
| `node --version` | **v22.22.3** (`/usr/bin/node`) |
| `node scripts/generate-kotlin-tokens.mjs --check` | ✅ `check OK -- EliteSurfaceTokens.kt is in sync` |
| `node scripts/generate-kotlin-tokens.mjs` | ✅ escreveu 256 linhas |
| `node --experimental-strip-types` | ✅ executa TypeScript diretamente — usado para correr `session-ownership.ts` a sério |
| Playwright (Chromium/Firefox/WebKit) | ✅ mas **no container da cloud**, não nesta VM |

## NÃO executável a partir daqui

| Ferramenta | Porquê |
|---|---|
| `pnpm build` · `pnpm test` · `vitest` | `node_modules` são binários compilados para Windows; não correm em Linux |
| `tsc` | O `find` sobre `node_modules/.pnpm` excede o timeout na drive montada |
| `gradlew` · `adb` · `emulator` · `sdkmanager` | Sem Android SDK e sem rede nesta VM |
| `git status` · `git log` | Timeout — travessia de drive Windows montada é lenta demais |
| `grep -r` na raiz | Timeout por causa de `node_modules`. Usar caminhos estreitos |

## Bloqueio conhecido da máquina (de turnos anteriores)

Registado em `docs/FINAL_ANDROID_WEAR_KMP_COMPLETION_REPORT.md`:

```
emulator -avd fitconnect_phone   → FAIL hypervisor
adb devices                      → (vazio)
Wear system image                → NOT_PRESENT
```

**Ação necessária do lado do utilizador**, antes de a FASE I ser possível:

1. Windows Features → ativar **Windows Hypervisor Platform**
2. Verificar se o **Hyper-V** está a competir com o HAXM — se estiver, desativar um deles
3. `sdkmanager "system-images;android-34;android-wear;x86_64"`

Sem estes três passos, as FASES I (emuladores, APK release, capturas, QR) e H2 (os dez
cenários de integração) ficam `BLOQUEADO POR AMBIENTE`. Não é falha do agente e não deve
ser simulado.

## Comandos de verificação para correr no Windows

O que esta sessão escreveu mas **não conseguiu compilar**:

```powershell
# Kotlin — SessionOwnership com epoch + heartbeat (8 testes novos)
cd android
.\gradlew.bat :shared:testDebugUnitTest

# TypeScript — espelho web da posse de sessão (10 testes novos)
cd ..
pnpm --filter web test -- session-ownership

# Tokens — paridade TS <-> CSS <-> Kotlin
pnpm tokens:kotlin:check
pnpm --filter web test -- tokens-sync

# Build completo
pnpm build
cd android; .\gradlew.bat :app:assembleDebug :wear:assembleDebug
```
