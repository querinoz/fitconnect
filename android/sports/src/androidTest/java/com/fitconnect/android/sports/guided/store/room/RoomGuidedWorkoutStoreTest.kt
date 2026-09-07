package com.fitconnect.android.sports.guided.store.room

import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.fitconnect.android.sports.guided.catalog.DefaultGuidedPlan
import com.fitconnect.android.sports.guided.domain.FakeWorkoutClock
import com.fitconnect.android.sports.guided.domain.SetLogInput
import com.fitconnect.android.sports.guided.domain.WorkoutPhase
import com.fitconnect.android.sports.guided.runtime.GuidedWorkoutRuntime
import com.fitconnect.android.foundation.common.Logger
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class RoomGuidedWorkoutStoreTest {
    private val logger = object : Logger {
        override fun d(tag: String, message: String) = Unit
        override fun i(tag: String, message: String) = Unit
        override fun w(tag: String, message: String, throwable: Throwable?) = Unit
        override fun e(tag: String, message: String, throwable: Throwable?) = Unit
    }

    @Test
    fun roomPersistsAndRecoversSession() = runBlocking {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val db = WorkoutRoomDatabase.inMemory(context)
        val store = RoomGuidedWorkoutStore(db)
        val clock = FakeWorkoutClock()
        val runtime = GuidedWorkoutRuntime(store = store, logger = logger, clock = clock)
        runtime.prepare("uid-room")
        runtime.start()
        runtime.logSet(SetLogInput(actualReps = 8, loadKg = 60.0))
        val sessionId = runtime.snapshot.value.sessionId
        val reloaded = store.load(sessionId)
        assertNotNull(reloaded)
        assertEquals(WorkoutPhase.REST, reloaded!!.phase)
        assertEquals(1, reloaded.sets.size)
        assertEquals(DefaultGuidedPlan.WORKOUT_ID, reloaded.workoutId)
        db.close()
    }
}
