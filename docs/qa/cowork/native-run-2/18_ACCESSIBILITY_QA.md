# 18 — ACCESSIBILITY QA

## Android

| Check | Result | Status |
|---|---|---|
| Content descriptions | Many actions labeled (Continue, Start session, tabs). Wear START/PAUSE have **empty** content-desc | **FAIL** Wear; **PARTIAL** phone |
| Touch targets | Primary buttons large; chips (Cycling) small — tap helper missed once | **PARTIAL** |
| Contrast | Floor + Volt canonical pair | **PASS** (not instrumented with analyzer) |
| Font scale 1.3 | Screenshot captured, then restored | **PASS** (no crash) |
| TalkBack | **Not enabled** | **BLOCKED** |
| uiautomator | Hierarchy dumps stored | evidence only |

## Web

Landing unnamed icon buttons: **0**. Dashboard: **7** unnamed buttons. Language control named. Skip to main content present. Keyboard not fully walked.

## Watch

START/MORE lack content-desc; labels are TextViews. Chin placement of START.

## vs Run #1

Web icon-button finding **CONFIRMED** (7). Native a11y is **NEW** evidence (not TalkBack).
