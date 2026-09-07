package com.fitconnect.android.telemetry.store.room

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query

@Dao
interface TelemetrySampleDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(entity: TelemetrySampleEntity)

    @Query(
        """
        SELECT * FROM telemetry_samples
        WHERE athleteId = :athleteId AND metric = :metric
          AND atEpochMs >= :startMs AND atEpochMs <= :endMs
        ORDER BY atEpochMs ASC
        LIMIT :limit OFFSET :offset
        """,
    )
    suspend fun samples(
        athleteId: String,
        metric: String,
        startMs: Long,
        endMs: Long,
        offset: Int,
        limit: Int,
    ): List<TelemetrySampleEntity>

    @Query(
        """
        SELECT * FROM telemetry_samples
        WHERE athleteId = :athleteId AND metric = :metric
        ORDER BY atEpochMs DESC LIMIT 1
        """,
    )
    suspend fun latest(athleteId: String, metric: String): TelemetrySampleEntity?

    @Query(
        """
        SELECT * FROM telemetry_samples
        WHERE athleteId = :athleteId AND metric = :metric AND provider NOT IN (:excluded)
        ORDER BY atEpochMs DESC LIMIT 1
        """,
    )
    suspend fun latestExcluding(
        athleteId: String,
        metric: String,
        excluded: List<String>,
    ): TelemetrySampleEntity?

    @Query("SELECT COUNT(*) FROM telemetry_samples WHERE provider = :provider AND sourceRecordId = :sourceRecordId")
    suspend fun sourceCount(provider: String, sourceRecordId: String): Int

    @Query("DELETE FROM telemetry_samples WHERE athleteId = :athleteId AND provider = :provider")
    suspend fun deleteByProvider(athleteId: String, provider: String): Int

    @Query("SELECT COUNT(*) FROM telemetry_samples WHERE athleteId = :athleteId")
    suspend fun count(athleteId: String): Int

    @Query("SELECT DISTINCT metric FROM telemetry_samples WHERE athleteId = :athleteId")
    suspend fun metrics(athleteId: String): List<String>

    @Query(
        """
        SELECT id FROM telemetry_samples
        WHERE athleteId = :athleteId
        ORDER BY atEpochMs ASC
        """,
    )
    suspend fun orderedIds(athleteId: String): List<String>

    @Query("DELETE FROM telemetry_samples WHERE id IN (:ids)")
    suspend fun deleteIds(ids: List<String>)
}

@Dao
interface TelemetrySleepDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(entity: TelemetrySleepEntity)

    @Query("SELECT COUNT(*) FROM telemetry_sleep WHERE provider = :provider AND sourceRecordId = :sourceRecordId")
    suspend fun sourceCount(provider: String, sourceRecordId: String): Int

    @Query("DELETE FROM telemetry_sleep WHERE athleteId = :athleteId AND provider = :provider")
    suspend fun deleteByProvider(athleteId: String, provider: String): Int

    @Query(
        """
        SELECT * FROM telemetry_sleep
        WHERE athleteId = :athleteId
        ORDER BY startEpochMs DESC
        """,
    )
    suspend fun forAthlete(athleteId: String): List<TelemetrySleepEntity>
}

@Dao
interface TelemetryWorkoutDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(entity: TelemetryWorkoutEntity)

    @Query(
        """
        SELECT * FROM telemetry_workouts
        WHERE athleteId = :athleteId
          AND startEpochMs <= :endMs AND endEpochMs >= :startMs
        ORDER BY startEpochMs DESC
        LIMIT :limit OFFSET :offset
        """,
    )
    suspend fun workouts(
        athleteId: String,
        startMs: Long,
        endMs: Long,
        offset: Int,
        limit: Int,
    ): List<TelemetryWorkoutEntity>

    @Query("SELECT COUNT(*) FROM telemetry_workouts WHERE provider = :provider AND sourceRecordId = :sourceRecordId")
    suspend fun sourceCount(provider: String, sourceRecordId: String): Int

    @Query("DELETE FROM telemetry_workouts WHERE athleteId = :athleteId AND provider = :provider")
    suspend fun deleteByProvider(athleteId: String, provider: String): Int

    @Query("SELECT COUNT(*) FROM telemetry_workouts WHERE athleteId = :athleteId")
    suspend fun count(athleteId: String): Int
}
