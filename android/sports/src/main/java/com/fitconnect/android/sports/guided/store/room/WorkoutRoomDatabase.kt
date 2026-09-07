package com.fitconnect.android.sports.guided.store.room

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.fitconnect.android.sports.guided.store.GuidedWorkoutStore

@Database(
    entities = [
        WorkoutSessionEntity::class,
        ExerciseSetEntity::class,
        WorkoutEventEntity::class,
        PendingSyncEntity::class,
    ],
    version = 1,
    exportSchema = false,
)
abstract class WorkoutRoomDatabase : RoomDatabase() {
    abstract fun sessions(): WorkoutSessionDao
    abstract fun sets(): ExerciseSetDao
    abstract fun events(): WorkoutEventDao
    abstract fun pending(): PendingSyncDao

    companion object {
        fun create(context: Context): WorkoutRoomDatabase =
            Room.databaseBuilder(
                context.applicationContext,
                WorkoutRoomDatabase::class.java,
                "fitconnect_guided_workout.db",
            ).build()

        fun inMemory(context: Context): WorkoutRoomDatabase =
            Room.inMemoryDatabaseBuilder(
                context.applicationContext,
                WorkoutRoomDatabase::class.java,
            ).allowMainThreadQueries().build()
    }
}

fun createRoomGuidedWorkoutStore(context: Context): GuidedWorkoutStore =
    RoomGuidedWorkoutStore(WorkoutRoomDatabase.create(context))
