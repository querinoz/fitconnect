package com.fitconnect.android.sports.guided.store.room

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query

@Dao
interface WorkoutSessionDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertSession(entity: WorkoutSessionEntity)

    @Query("SELECT * FROM workout_sessions WHERE sessionId = :sessionId")
    suspend fun session(sessionId: String): WorkoutSessionEntity?

    @Query(
        """
        SELECT * FROM workout_sessions
        WHERE userId = :userId AND phase IN ('PREP','ACTIVE','REST','PAUSED','COMPLETING','RECOVERING')
        ORDER BY updatedAtMs DESC LIMIT 1
        """,
    )
    suspend fun active(userId: String): WorkoutSessionEntity?

    @Query(
        """
        SELECT * FROM workout_sessions
        WHERE userId = :userId AND phase IN ('COMPLETED','SYNC_PENDING')
        ORDER BY updatedAtMs DESC LIMIT 1
        """,
    )
    suspend fun unsynced(userId: String): WorkoutSessionEntity?
}

@Dao
interface ExerciseSetDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(entity: ExerciseSetEntity)

    @Query("SELECT * FROM exercise_sets WHERE sessionId = :sessionId ORDER BY sequence ASC")
    suspend fun forSession(sessionId: String): List<ExerciseSetEntity>
}

@Dao
interface WorkoutEventDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(entity: WorkoutEventEntity)

    @Query("SELECT * FROM workout_events WHERE sessionId = :sessionId ORDER BY createdAtMs ASC")
    suspend fun forSession(sessionId: String): List<WorkoutEventEntity>
}

@Dao
interface PendingSyncDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(entity: PendingSyncEntity)

    @Query("SELECT * FROM pending_sync WHERE sessionId = :sessionId")
    suspend fun forSession(sessionId: String): List<PendingSyncEntity>

    @Query("DELETE FROM pending_sync WHERE idempotencyKey = :key")
    suspend fun deleteByKey(key: String)
}
