# 17 — VISUAL COHESION QA

**Question:** Do Landing, Web, Android, Watch feel like the same FitConnect?

| Token | Landing/Web | Android | Wear |
|---|---|---|---|
| Floor / OLED dark | yes | yes | yes |
| Volt `#C8FF00` CTA | yes | Continue / Start session | START bar |
| LOCAL_DEMO labeling | yes | aggressive, honest | yes |
| Wordmark FitConnect | yes | FitConnect DEBUG | FitConnect Wear |
| IA | Today · Analysis · Achievements · Profile | Home · Discover · Activity · Community · Profile | Readiness + START |
| Glass / honeycomb | landing glass nav | HONEYCOMB · SUBTLE on profile | dense instrument, not glass |

**Verdict:** **PARTIAL PASS** on color/voice; **FAIL** on information architecture and density. Watch is a cockpit, not a shrunk dashboard. Android 5-tab bar contradicts 2026-08-20 4+FAB athlete IA.

Glassmorphism: landing nav. Neumorphism: not observed as a system. Maps/telemetry: demo instruments, not the web MapLibre session (native map empty until QA route).
