package com.fitconnect.shared.session

/**
 * Idempotent session index — the same sessionId cannot be completed twice.
 */
class WorkoutRegistry {
    private val completed = linkedSetOf<String>()
    private val active = linkedMapOf<String, ActivitySessionState>()

    fun begin(sessionId: String, state: ActivitySessionState = ActivitySessionState.ACTIVE): Boolean {
        if (completed.contains(sessionId)) return false
        active[sessionId] = state
        return true
    }

    fun complete(sessionId: String): Boolean {
        if (completed.contains(sessionId)) return false
        completed.add(sessionId)
        active.remove(sessionId)
        return true
    }

    fun isDuplicate(sessionId: String): Boolean = completed.contains(sessionId)

    fun activeCount(): Int = active.size

    fun completedCount(): Int = completed.size
}
