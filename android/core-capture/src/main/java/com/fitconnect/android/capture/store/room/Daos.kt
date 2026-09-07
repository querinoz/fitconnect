package com.fitconnect.android.capture.store.room

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface LocationPointDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(entity: LocationPointEntity)

    @Query(
        """
        SELECT * FROM gps_location_points
        WHERE activityId = :activityId
        ORDER BY sequenceNumber ASC
        """,
    )
    suspend fun forActivity(activityId: String): List<LocationPointEntity>

    @Query(
        """
        SELECT * FROM gps_location_points
        WHERE activityId = :activityId AND verdict = 'ACCEPT'
        ORDER BY sequenceNumber ASC
        """,
    )
    suspend fun acceptedForActivity(activityId: String): List<LocationPointEntity>

    @Query(
        """
        SELECT * FROM gps_location_points
        WHERE activityId = :activityId AND verdict = 'ACCEPT'
        ORDER BY sequenceNumber ASC
        """,
    )
    fun observeAcceptedForActivity(activityId: String): Flow<List<LocationPointEntity>>

    @Query("SELECT COUNT(*) FROM gps_location_points WHERE activityId = :activityId")
    suspend fun count(activityId: String): Int

    @Query("DELETE FROM gps_location_points WHERE activityId = :activityId")
    suspend fun deleteActivity(activityId: String)
}

@Dao
interface GpsSessionDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(entity: GpsSessionEntity)

    @Query("SELECT * FROM gps_sessions WHERE activityId = :activityId")
    suspend fun session(activityId: String): GpsSessionEntity?

    @Query(
        """
        SELECT * FROM gps_sessions
        WHERE userId = :userId AND phase IN ('PREPARING','TRACKING','PAUSED','GPS_DEGRADED','RESUMING')
        ORDER BY updatedAtUtcMs DESC LIMIT 1
        """,
    )
    suspend fun active(userId: String): GpsSessionEntity?
}
