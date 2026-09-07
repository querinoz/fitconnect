package com.fitconnect.android.telemetry.store.room

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
    entities = [
        TelemetrySampleEntity::class,
        TelemetrySleepEntity::class,
        TelemetryWorkoutEntity::class,
    ],
    version = 1,
    exportSchema = false,
)
abstract class TelemetryRoomDatabase : RoomDatabase() {
    abstract fun samples(): TelemetrySampleDao
    abstract fun sleep(): TelemetrySleepDao
    abstract fun workouts(): TelemetryWorkoutDao

    companion object {
        fun create(context: Context): TelemetryRoomDatabase =
            Room.databaseBuilder(
                context.applicationContext,
                TelemetryRoomDatabase::class.java,
                "fitconnect_telemetry.db",
            ).fallbackToDestructiveMigration(dropAllTables = true)
                .build()
    }
}
