# ANDROID_PUSH_REPORT.md

| Item | Status |
|------|--------|
| Implementation | `NoOpNotificationGateway` |
| FCM / HMS | **NOT WIRED** |
| Token storage | n/a |
| Foreground/background/killed | **NOT TESTED** |
| Lock-screen privacy | n/a (no push payload) |

**Blocker B3.** Phone RC engineering can ship without push only if product accepts; Play listing must not claim push until FCM lands.
