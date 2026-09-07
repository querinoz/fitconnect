package com.fitconnect.android.capture.store.room

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
    entities = [LocationPointEntity::class, GpsSessionEntity::class],
    version = 1,
    exportSchema = false,
)
abstract class CaptureRoomDatabase : RoomDatabase() {
    abstract fun points(): LocationPointDao
    abstract fun sessions(): GpsSessionDao

    companion object {
        fun create(context: Context): CaptureRoomDatabase =
            Room.databaseBuilder(
                context.applicationContext,
                CaptureRoomDatabase::class.java,
                "fitconnect_capture.db",
            ).fallbackToDestructiveMigration(dropAllTables = true)
                .build()
    }
}
