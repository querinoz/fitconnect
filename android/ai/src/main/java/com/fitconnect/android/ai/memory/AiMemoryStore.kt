package com.fitconnect.android.ai.memory

/**
 * Explicit memory tiers. Conversations are NOT auto-persisted to long-term
 * memory — users/coaches opt in via [rememberPreference].
 */
data class MemoryEntry(
    val key: String,
    val value: String,
    val ownerId: String,
    val tier: MemoryTier,
    val atEpochMs: Long,
)

enum class MemoryTier { SESSION, SHORT_TERM, LONG_TERM_PREF, COACH_CONTEXT, PROGRAM_CONTEXT }

class AiMemoryStore(private val nowProvider: () -> Long = System::currentTimeMillis) {
    private val entries = mutableListOf<MemoryEntry>()
    private val sessionBuffers = mutableMapOf<String, MutableList<String>>()

    fun appendSession(sessionId: String, turn: String) {
        sessionBuffers.getOrPut(sessionId) { mutableListOf() }.add(turn.take(500))
    }

    fun session(sessionId: String): List<String> = sessionBuffers[sessionId].orEmpty()

    fun clearSession(sessionId: String) {
        sessionBuffers.remove(sessionId)
    }

    @Synchronized
    fun rememberPreference(ownerId: String, key: String, value: String) {
        entries.removeAll { it.ownerId == ownerId && it.key == key && it.tier == MemoryTier.LONG_TERM_PREF }
        entries += MemoryEntry(key, value, ownerId, MemoryTier.LONG_TERM_PREF, nowProvider())
    }

    @Synchronized
    fun forget(ownerId: String, key: String) {
        entries.removeAll { it.ownerId == ownerId && it.key == key }
    }

    @Synchronized
    fun preferences(ownerId: String): List<MemoryEntry> =
        entries.filter { it.ownerId == ownerId && it.tier == MemoryTier.LONG_TERM_PREF }
}
