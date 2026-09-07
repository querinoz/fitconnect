package com.fitconnect.android.telemetry.store.room

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "telemetry_samples",
    indices = [
        Index(value = ["athleteId", "metric", "atEpochMs"]),
        Index(value = ["provider", "sourceRecordId"], unique = true),
    ],
)
data class TelemetrySampleEntity(
    @PrimaryKey val id: String,
    val athleteId: String,
    val metric: String,
    val value: Double,
    val unit: String,
    val atEpochMs: Long,
    val endAtEpochMs: Long?,
    val provider: String,
    val sourceRecordId: String,
    val device: String?,
    val deviceId: String?,
    val originalUnit: String,
    val syncedAtEpochMs: Long,
    val createdAtEpochMs: Long,
    val updatedAtEpochMs: Long,
    val quality: String,
    val attributesJson: String,
)

@Entity(
    tableName = "telemetry_sleep",
    indices = [
        Index(value = ["athleteId", "startEpochMs"]),
        Index(value = ["provider", "sourceRecordId"], unique = true),
    ],
)
data class TelemetrySleepEntity(
    @PrimaryKey val id: String,
    val athleteId: String,
    val startEpochMs: Long,
    val endEpochMs: Long,
    val stagesJson: String,
    val efficiencyPct: Double?,
    val provider: String,
    val sourceRecordId: String,
    val device: String?,
    val deviceId: String?,
    val originalUnit: String,
    val syncedAtEpochMs: Long,
    val createdAtEpochMs: Long,
    val updatedAtEpochMs: Long,
    val quality: String,
)

@Entity(
    tableName = "telemetry_workouts",
    indices = [
        Index(value = ["athleteId", "startEpochMs"]),
        Index(value = ["provider", "sourceRecordId"], unique = true),
    ],
)
data class TelemetryWorkoutEntity(
    @PrimaryKey val id: String,
    val athleteId: String,
    val sportKey: String,
    val title: String,
    val startEpochMs: Long,
    val endEpochMs: Long,
    val distanceMeters: Double?,
    val calories: Double?,
    val avgHeartRate: Double?,
    val maxHeartRate: Double?,
    val avgPowerWatts: Double?,
    val elevationGainMeters: Double?,
    val provider: String,
    val sourceRecordId: String,
    val device: String?,
    val deviceId: String?,
    val originalUnit: String,
    val syncedAtEpochMs: Long,
    val createdAtEpochMs: Long,
    val updatedAtEpochMs: Long,
    val quality: String,
    val mergedFromJson: String,
)
