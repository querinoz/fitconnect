# Full Mobile QA 360 — Defects

## P0 (agent-owned)
None found this cycle.

## P1 (agent-owned code)
None found this cycle.

## P1 EXTERNAL / HUMAN
| ID | Title | Evidence | Owner |
|----|-------|----------|-------|
| DEF-EXT-001 | MIUI blocks APK install refresh | `INSTALL_FAILED_USER_RESTRICTED` | Human device settings |
| DEF-EXT-002 | MIUI blocks `adb shell input` | `INJECT_EVENTS` SecurityException | Platform / root not available |

## P2
| ID | Title | Evidence | Disposition |
|----|-------|----------|-------------|
| DEF-P2-001 | Health Connect update modal overlays Today | emu + Redmi UI dump | Environment; dismiss/Update; not fake metrics |
| DEF-P2-002 | Catalog deep link may no-op under modal | catalog VIEW while HC dialog | Re-test after dismiss |

## P3
| ID | Title | Notes |
|----|-------|-------|
| DEF-P3-001 | MIUI theme_compatibility.xml missing during uiautomator | Platform noise |

## Fix loop
No agent-owned P0/P1 code defects entered the reproduce→fix loop this cycle.
