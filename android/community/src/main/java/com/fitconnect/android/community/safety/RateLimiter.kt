package com.fitconnect.android.community.safety

/**
 * Sliding-window rate limiting for abuse prevention: mass follows, reaction
 * storms, post flooding, report abuse, notification spam. Limits are
 * per-actor per-action; the clock is injectable for tests.
 */
enum class CommunityAction(val maxPerWindow: Int, val windowMs: Long) {
    CREATE_POST(10, 3_600_000),
    COMMENT(30, 3_600_000),
    REACT(120, 3_600_000),
    FOLLOW(60, 3_600_000),
    REPORT(10, 86_400_000),
    JOIN_GROUP(20, 3_600_000),
    JOIN_CHALLENGE(20, 3_600_000),
    SHARE(30, 3_600_000),
}

class ActionRateLimiter(private val nowProvider: () -> Long = System::currentTimeMillis) {
    private val events = mutableMapOf<String, ArrayDeque<Long>>()

    @Synchronized
    fun tryAcquire(actorId: String, action: CommunityAction): Boolean {
        val now = nowProvider()
        val key = "$actorId:${action.name}"
        val window = events.getOrPut(key) { ArrayDeque() }
        while (window.isNotEmpty() && now - window.first() > action.windowMs) window.removeFirst()
        if (window.size >= action.maxPerWindow) return false
        window.addLast(now)
        return true
    }

    @Synchronized
    fun remaining(actorId: String, action: CommunityAction): Int {
        val now = nowProvider()
        val window = events["$actorId:${action.name}"] ?: return action.maxPerWindow
        val active = window.count { now - it <= action.windowMs }
        return (action.maxPerWindow - active).coerceAtLeast(0)
    }
}
