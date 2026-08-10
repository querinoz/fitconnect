# ANDROID_RELEASE_CHANNEL_STRATEGY.md

| Channel | Purpose | Status |
|---------|---------|--------|
| Internal testing | Engineering AAB | Possible once **signed** |
| Closed testing | Trusted testers | Blocked (IdP + signing) |
| Open testing | Optional | Not planned for first launch |
| Production | Real users | **FORBIDDEN** until Phase 14 APPROVED + human auth |

**Agent must not publish.** Human owner authorizes each promote.

Staged rollout suggestion (when ready): 1% → 5% → 20% → 50% → 100% with halt criteria from monitoring plan.
