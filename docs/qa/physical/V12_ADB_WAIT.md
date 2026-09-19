# V12 Mobile — Waiting for ADB after user-reported install

**User report:** APK installed (2026-09-19)  
**ADB detection:** FAIL — no `device` / no wireless port / USB ADB Interface = Unknown  
**Install identity via dumpsys:** NOT VERIFIED yet

## Blocker

Smoke test cannot start without ADB (Wi‑Fi or USB).

## Required (phone)

### Preferred — Wireless debugging (Wi‑Fi)

1. Settings → Additional settings → Developer options  
2. Enable **USB debugging** (required even for wireless)  
3. Enable **Wireless debugging**  
4. Open Wireless debugging → note **IP address & port** (Connect)  
5. If first time: **Pair device with pairing code** → note pairing IP:port + 6-digit code  

Reply with either:

```text
CONNECT <ip>:<port>
```

or

```text
PAIR <ip>:<pairPort> <code>
CONNECT <ip>:<port>
```

Agent will `adb pair` / `adb connect`, verify `versionCode=16`, then run cold launch + smoke.

### Alternate — USB

Cable is detected (Redmi Note 9S) but Windows ADB driver status = Unknown.  
Unlock phone → set USB mode to **File transfer (MTP)** → accept **Allow USB debugging** prompt.
