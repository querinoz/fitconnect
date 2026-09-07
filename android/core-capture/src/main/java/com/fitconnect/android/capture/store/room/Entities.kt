package com.fitconnect.android.capture.store.room

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "gps_location_points",
    indices = [
        Index(value = ["activityId", "sequenceNumber"], unique = true),
        Index(value = ["activityId", "capturedAtUtcMs"]),
    ],
)
data class LocationPointEntity(
    @PrimaryKey val pointId: String,
    val activityId: String,
    val userId: String,
    val latitude: Double,
    val longitude: Double,
    val accuracyMeters: Double?,
    val speedMps: Double?,
    val altitudeMeters: Double?,
    val capturedAtUtcMs: Long,
    val sequenceNumber: Int,
    val verdict: String,
    val feedStatus: String,
)

@Entity(tableName = "gps_sessions")
data class GpsSessionEntity(
    @PrimaryKey val activityId: String,
    val userId: String,
    val sport: String,
    val phase: String,
    val startedAtUtcMs: Long,
    val updatedAtUtcMs: Long,
    val distanceM: Double,
    val movingMs: Long,
    val elapsedMs: Long,
    val idempotencyKey: String,
    val syncStatus: String,
)
