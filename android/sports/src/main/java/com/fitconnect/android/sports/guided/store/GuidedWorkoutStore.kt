package com.fitconnect.android.sports.guided.store

import com.fitconnect.android.sports.guided.domain.ExerciseSetRecord
import com.fitconnect.android.sports.guided.domain.GuidedSessionSnapshot
import com.fitconnect.android.sports.guided.domain.PendingSyncRecord
import com.fitconnect.android.sports.guided.domain.WorkoutEventRecord
import com.fitconnect.android.sports.guided.domain.WorkoutPhase

interface GuidedWorkoutStore {
    suspend fun save(snapshot: GuidedSessionSnapshot)
    suspend fun load(sessionId: String): GuidedSessionSnapshot?
    suspend fun loadActive(userId: String): GuidedSessionSnapshot?
    suspend fun appendEvents(events: List<WorkoutEventRecord>)
    suspend fun upsertPending(items: List<PendingSyncRecord>)
    suspend fun acknowledgePending(idempotencyKey: String)
    suspend fun pendingFor(sessionId: String): List<PendingSyncRecord>
    suspend fun eventsFor(sessionId: String): List<WorkoutEventRecord>
    suspend fun loadUnsynced(userId: String): GuidedSessionSnapshot?

    suspend fun setsFor(sessionId: String): List<ExerciseSetRecord>
}

class InMemoryGuidedWorkoutStore : GuidedWorkoutStore {
    private val sessions = java.util.concurrent.ConcurrentHashMap<String, GuidedSessionSnapshot>()
    private val events = java.util.concurrent.ConcurrentHashMap<String, MutableList<WorkoutEventRecord>>()
    private val pending = java.util.concurrent.ConcurrentHashMap<String, MutableList<PendingSyncRecord>>()

    override suspend fun save(snapshot: GuidedSessionSnapshot) {
        if (snapshot.sessionId.isBlank()) return
        sessions[snapshot.sessionId] = snapshot
    }

    override suspend fun load(sessionId: String): GuidedSessionSnapshot? = sessions[sessionId]

    override suspend fun loadActive(userId: String): GuidedSessionSnapshot? =
        sessions.values
            .filter { it.userId == userId && it.phase.isInProgress() }
            .maxByOrNull { it.startedAtMs ?: 0L }

    override suspend fun loadUnsynced(userId: String): GuidedSessionSnapshot? =
        sessions.values
            .filter { it.userId == userId && it.phase.isUnsynced() }
            .maxByOrNull { it.completedAtMs ?: 0L }

    override suspend fun appendEvents(events: List<WorkoutEventRecord>) {
        events.forEach { event ->
            this.events.getOrPut(event.sessionId) { mutableListOf() }.add(event)
        }
    }

    override suspend fun upsertPending(items: List<PendingSyncRecord>) {
        items.forEach { item ->
            val list = pending.getOrPut(item.sessionId) { mutableListOf() }
            list.removeAll { it.idempotencyKey == item.idempotencyKey }
            list += item
        }
    }

    override suspend fun acknowledgePending(idempotencyKey: String) {
        pending.values.forEach { list ->
            list.removeAll { it.idempotencyKey == idempotencyKey }
        }
    }

    override suspend fun pendingFor(sessionId: String): List<PendingSyncRecord> =
        pending[sessionId].orEmpty().toList()

    override suspend fun eventsFor(sessionId: String): List<WorkoutEventRecord> =
        events[sessionId].orEmpty().toList()

    override suspend fun setsFor(sessionId: String): List<ExerciseSetRecord> =
        sessions[sessionId]?.sets.orEmpty()
}

private fun WorkoutPhase.isInProgress(): Boolean = when (this) {
    WorkoutPhase.PREP,
    WorkoutPhase.ACTIVE,
    WorkoutPhase.REST,
    WorkoutPhase.PAUSED,
    WorkoutPhase.COMPLETING,
    WorkoutPhase.RECOVERING,
    -> true
    else -> false
}

private fun WorkoutPhase.isUnsynced(): Boolean = when (this) {
    WorkoutPhase.COMPLETED, WorkoutPhase.SYNC_PENDING -> true
    else -> false
}
