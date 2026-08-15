# FitConnect Android — Local QR DEBUG Distribution

**Purpose:** Install the current **DEBUG / LOCAL_DEMO** APK on a physical Android phone **without USB, adb, emulator, Play, Firebase, or production signing**.

This is **developer distribution infrastructure**, not a production release channel.

---

## 1. Purpose

Generate a LAN HTTP install page + QR code so a phone on the same Wi-Fi can:

1. Scan QR  
2. Open the install page  
3. Download the DEBUG APK  
4. Use the Android package installer (user may need to allow unknown apps)  
5. Open FitConnect LOCAL DEMO  

QR scanning does **not** bypass Android security, Play Protect, or install prompts.

---

## 2. Architecture

```
assembleDebug
    → validate APK + SHA-256
    → copy into .fitconnect-local-distribution/   (gitignored)
    → generate index.html + qr.svg + meta.json
    → detect LAN IPv4
    → bind TCP on free port (preferred 8765)
    → serve ONLY that directory
    → print URL + ASCII QR
```

Served files only:

| Path | Content |
|------|---------|
| `/` or `/index.html` | Install page |
| `/qr.svg` | QR encoding the install URL |
| `/app.apk` | DEBUG APK copy |
| `/meta.json` | Filename + SHA-256 + LOCAL_DEMO labels |

Repo root, `.git`, source, keystores, and `local.properties` are **not** exposed.

---

## 3. Requirements

- Windows (primary) + PowerShell 5.1+
- Java 17 + Android Gradle wrapper (`android/gradlew.bat`)
- Python 3 (QR SVG only — **dev tool**, not in the APK)
- Phone and PC on the **same LAN / Wi-Fi**
- No adb, no emulator, no production credentials

QR library: vendored Nayuki `qrcodegen.py` (MIT) under `android/scripts/lib/vendor/`.

---

## 4. Command

From repo root:

```powershell
.\android\scripts\run-local-distribution.ps1
```

Or:

```powershell
pnpm android:qr
```

Engineering self-test (no wait for Enter; uses existing APK if `-SkipBuild`):

```powershell
.\android\scripts\run-local-distribution.ps1 -SelfTest
pnpm android:qr:test
```

Optional:

| Flag | Meaning |
|------|---------|
| `-SkipBuild` | Reuse existing debug APK |
| `-Port 8765` | Preferred port (auto-fallback if busy) |
| `-LanIp x.x.x.x` | Force LAN address |
| `-SelfTest` | Verify HTTP locally then exit |

---

## 5. Network requirements

- Detected **private** IPv4 (10/8, 172.16–31, 192.168/16)
- Loopback / link-local excluded
- VPN-like adapters scored lower; human may select if ambiguous
- Phone must use the **LAN** URL (`http://<LAN_IP>:<PORT>/`), **not** `localhost` / `127.0.0.1`

Firewall: if the phone cannot connect, allow **inbound TCP** for the printed port for this session. Do **not** disable Windows Firewall globally. This script does not create permanent firewall rules.

---

## 6. QR flow

QR encodes the **actual** install URL for this run (LAN IP + chosen port).

Regenerated every run. Contrast: dark modules on light quiet zone (SVG).

---

## 7. APK location

Built/discovered under:

```text
android/app/build/outputs/apk/debug/*.apk
```

Copied to:

```text
.fitconnect-local-distribution/app.apk
```

Example filename (may vary): `app-debug.apk`  
Debug applicationId suffix: `com.fitconnect.android.debug`

---

## 8. SHA-256 verification

Mandatory. Printed in the terminal and summarized on the install page. Full hash is in `meta.json` and page title attribute.

---

## 9. Android installation behavior

After download, Android’s installer runs. The user may need:

- “Install unknown apps” for the browser
- Play Protect confirmation

Optional deep link on the page: `fitconnect://app/auth` (works **after** install only). Download remains mandatory for first install.

---

## 10. Troubleshooting

| Symptom | Check |
|---------|--------|
| Phone can’t open URL | Same Wi-Fi? Correct LAN IP (not VPN)? Firewall port? |
| Empty / missing APK | Run without `-SkipBuild`; confirm `assembleDebug` |
| Port in use | Script picks another; use the printed URL |
| QR wrong host | Must show LAN IP, never localhost |
| Install blocked | Allow unknown sources for the browser |

---

## 11. Security limitations

- Serves only the distribution directory  
- Rejects `..` path traversal  
- No uploads, no shell, no credentials  
- DEBUG build only — **not** production-signed Play distribution  
- LAN exposure while the server runs — stop with Enter (interactive) or end of `-SelfTest`

---

## 12. Why adb is not required

Sideload via browser download on the phone. USB debugging / RSA prompts are unnecessary for this path.

---

## 13. Why production credentials are not required

DEBUG / LOCAL_DEMO uses existing local auth personas (e.g. Inês, Marina, Tomás). Supabase / FCM / signing / Play remain human-owned production steps and are unchanged by this tool.

---

## Exit gate (engineering)

See `docs/android/ANDROID_LOCAL_QR_DISTRIBUTION_EXIT_GATE.md` after running `-SelfTest`.

**DEVICE_INSTALLATION** remains `PENDING_HUMAN` until a real phone install is confirmed.
