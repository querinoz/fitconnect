package com.fitconnect.android.foundation.events

/**
 * Canonical product event bus. FitConnect owns SoT; Zapier/adapters subscribe
 * via AutomationEngine — they are never the database.
 */

enum class ZenithEventType {
    TRAINING_COMPLETED,
    ACHIEVEMENT_UNLOCKED,
    PROGRAM_ENROLLED,
    BOOKING_CREATED,
    BOOKING_CONFIRMED,
    POST_CREATED,
    SPOT_CREATED,
    SPOT_VERIFIED,
    PR_ACHIEVED,
    READINESS_UPDATED,
    WEAR_SYNCED,
    SPOT_VISITED,
    DISTRIBUTION_COMPLETED,
    DISTRIBUTION_FAILED,
}

data class ZenithEvent(
    val id: String,
    val type: ZenithEventType,
    val actorId: String,
    val entityId: String? = null,
    val payload: Map<String, String> = emptyMap(),
    val atEpochMs: Long,
)

interface ZenithEventBus {
    suspend fun publish(event: ZenithEvent)
    suspend fun recent(limit: Int = 50): List<ZenithEvent>
    fun subscribe(listener: suspend (ZenithEvent) -> Unit): AutoCloseable
}

class InMemoryZenithEventBus(
    private val nowProvider: () -> Long = System::currentTimeMillis,
) : ZenithEventBus {
    private val events = ArrayDeque<ZenithEvent>()
    private val listeners = mutableListOf<suspend (ZenithEvent) -> Unit>()
    private var seq = 0L

    override suspend fun publish(event: ZenithEvent) {
        val stamped = if (event.id.isBlank()) {
            event.copy(id = "evt-${++seq}", atEpochMs = event.atEpochMs.takeIf { it > 0 } ?: nowProvider())
        } else {
            event
        }
        synchronized(events) {
            events.addFirst(stamped)
            while (events.size > 500) events.removeLast()
        }
        listeners.toList().forEach { it(stamped) }
    }

    override suspend fun recent(limit: Int): List<ZenithEvent> =
        synchronized(events) { events.take(limit) }

    override fun subscribe(listener: suspend (ZenithEvent) -> Unit): AutoCloseable {
        synchronized(listeners) { listeners += listener }
        return AutoCloseable {
            synchronized(listeners) { listeners.remove(listener) }
        }
    }
}

/**
 * Opt-in automation rules. Never auto-share sensitive health/location.
 */
data class AutomationRule(
    val id: String,
    val userId: String,
    val whenEvent: ZenithEventType,
    val createFitConnectPost: Boolean = false,
    val distributePlatforms: List<String> = emptyList(),
    val includeMusicMetadata: Boolean = false,
    val includeApproximateLocation: Boolean = false,
    val enabled: Boolean = false,
)

interface AutomationEngine {
    suspend fun rules(userId: String): List<AutomationRule>
    suspend fun upsert(rule: AutomationRule): AutomationRule
    suspend fun onEvent(event: ZenithEvent): List<AutomationRule>
}

class InMemoryAutomationEngine : AutomationEngine {
    private val rules = linkedMapOf<String, AutomationRule>()

    override suspend fun rules(userId: String): List<AutomationRule> =
        rules.values.filter { it.userId == userId }

    override suspend fun upsert(rule: AutomationRule): AutomationRule {
        rules[rule.id] = rule
        return rule
    }

    override suspend fun onEvent(event: ZenithEvent): List<AutomationRule> =
        rules.values.filter { it.enabled && it.whenEvent == event.type && it.userId == event.actorId }
}
