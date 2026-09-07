package com.fitconnect.android.sports.guided.store.room

import com.fitconnect.android.sports.guided.domain.ExerciseSetRecord
import com.fitconnect.android.sports.guided.domain.GuidedSessionSnapshot
import com.fitconnect.android.sports.guided.domain.PendingSyncRecord
import com.fitconnect.android.sports.guided.domain.WorkoutEventRecord
import com.fitconnect.android.sports.guided.store.GuidedWorkoutStore

class RoomGuidedWorkoutStore(
    private val db: WorkoutRoomDatabase,
) : GuidedWorkoutStore {
    override suspend fun save(snapshot: GuidedSessionSnapshot) {
        if (snapshot.sessionId.isBlank()) return
        db.sessions().upsertSession(
            WorkoutSessionEntity(
                sessionId = snapshot.sessionId,
                userId = snapshot.userId,
                workoutId = snapshot.workoutId,
                phase = snapshot.phase.name,
                snapshotJson = SnapshotCodec.encode(snapshot),
                activityId = snapshot.activityId,
                idempotencyKey = snapshot.idempotencyKey,
                updatedAtMs = snapshot.completedAtMs ?: snapshot.startedAtMs ?: System.currentTimeMillis(),
            ),
        )
        snapshot.sets.forEach { set ->
            db.sets().upsert(
                ExerciseSetEntity(
                    setId = set.setId,
                    sessionId = set.sessionId,
                    exerciseId = set.exerciseId,
                    sequence = set.sequence,
                    setIndex = set.setIndex,
                    payloadJson = SnapshotCodec.encodeSet(set).toString(),
                ),
            )
        }
    }

    override suspend fun load(sessionId: String): GuidedSessionSnapshot? =
        db.sessions().session(sessionId)?.let { SnapshotCodec.decode(it.snapshotJson) }

    override suspend fun loadActive(userId: String): GuidedSessionSnapshot? =
        db.sessions().active(userId)?.let { SnapshotCodec.decode(it.snapshotJson) }

    override suspend fun loadUnsynced(userId: String): GuidedSessionSnapshot? =
        db.sessions().unsynced(userId)?.let { SnapshotCodec.decode(it.snapshotJson) }

    override suspend fun appendEvents(events: List<WorkoutEventRecord>) {
        events.forEach { db.events().upsert(it.toEntity()) }
    }

    override suspend fun upsertPending(items: List<PendingSyncRecord>) {
        items.forEach { db.pending().upsert(it.toEntity()) }
    }

    override suspend fun acknowledgePending(idempotencyKey: String) {
        db.pending().deleteByKey(idempotencyKey)
    }

    override suspend fun pendingFor(sessionId: String): List<PendingSyncRecord> =
        db.pending().forSession(sessionId).map { it.toRecord() }

    override suspend fun eventsFor(sessionId: String): List<WorkoutEventRecord> =
        db.events().forSession(sessionId).map { it.toRecord() }

    override suspend fun setsFor(sessionId: String): List<ExerciseSetRecord> =
        db.sets().forSession(sessionId).map { SnapshotCodec.decodeSet(org.json.JSONObject(it.payloadJson)) }
}
