# 22 — FINAL REGRESSION QA

Cross-check of this run’s executable matrix.

| ID | Area | Result |
|---|---|---|
| R1 | Android boots & stays up | **PASS** |
| R2 | Athlete onboarding + Today | **PASS** |
| R3 | Activity start/pause/resume/finish | **PASS** |
| R4 | GPS fused live | **FAIL** (simulated QA) |
| R5 | Wear boots + workout | **PASS** |
| R6 | Phone↔Watch | **FAIL** (GMS companion) |
| R7 | Coach Command + tabs | **PASS** |
| R8 | ASCEND streak increment | **PASS** LOCAL_DEMO |
| R9 | 10 km cross-platform event | **NOT EXECUTED** |
| R10 | Web landing + dashboard demo | **PASS** with open P2/P3 |
| R11 | No product code changed this run | **PASS** (pre-existing nav diff remains local) |

**Native gap vs Run #1:** **CLOSED** for install/launch/OS walks. **OPEN** for companion sync, fused GPS, production auth, 10 km event.
