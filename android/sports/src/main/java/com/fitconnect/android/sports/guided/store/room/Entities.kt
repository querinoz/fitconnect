package com.fitconnect.android.sports.guided.store.room

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(tableName = "workout_sessions")
data class WorkoutSessionEntity(
    @PrimaryKey val sessionId: String,
    val userId: String,
    val workoutId: String,
    val phase: String,
    val snapshotJson: String,
    val activityId: String?,
    val idempotencyKey: String,
    val updatedAtMs: Long,
)

@Entity(
    tableName = "exercise_sets",
    indices = [Index("sessionId")],
)
data class ExerciseSetEntity(
    @PrimaryKey val setId: String,
    val sessionId: String,
    val exerciseId: String,
    val sequence: Int,
    val setIndex: Int,
    val payloadJson: String,
)

@Entity(
    tableName = "workout_events",
    indices = [Index("sessionId")],
)
data class WorkoutEventEntity(
    @PrimaryKey val eventId: String,
    val sessionId: String,
    val type: String,
    val payload: String,
    val createdAtMs: Long,
)

@Entity(
    tableName = "pending_sync",
    indices = [Index(value = ["idempotencyKey"], unique = true)],
)
data class PendingSyncEntity(
    @PrimaryKey val id: String,
    val sessionId: String,
    val type: String,
    val payloadJson: String,
    val idempotencyKey: String,
    val attempts: Int,
    val status: String,
)
