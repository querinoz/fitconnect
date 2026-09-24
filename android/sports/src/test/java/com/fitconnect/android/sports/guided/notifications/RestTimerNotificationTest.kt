package com.fitconnect.android.sports.guided.notifications

import com.fitconnect.android.foundation.common.Logger
import com.fitconnect.android.foundation.notifications.FakeNotificationGateway
import com.fitconnect.android.sports.guided.domain.SetLogInput
import com.fitconnect.android.sports.guided.domain.WorkoutPhase
import com.fitconnect.android.sports.guided.runtime.GuidedWorkoutRuntime
import com.fitconnect.android.sports.guided.store.InMemoryGuidedWorkoutStore
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class RestTimerNotificationTest {
    private val logger = object : Logger {
        override fun d(tag: String, message: String) = Unit
        override fun i(tag: String, message: String) = Unit
        override fun w(tag: String, message: String, throwable: Throwable?) = Unit
        override fun e(tag: String, message: String, throwable: Throwable?) = Unit
    }

    @Test
    fun restRunningThenSkipCancelsWithoutDuplicateSpam() = runBlocking {
        val recording = RecordingWorkoutNotificationPort()
        val clock = com.fitconnect.android.sports.guided.domain.FakeWorkoutClock()
        val runtime = GuidedWorkoutRuntime(
            store = InMemoryGuidedWorkoutStore(),
            logger = logger,
            clock = clock,
            notifications = recording,
        )
        runtime.prepare("uid-rest").getOrThrow()
        // Default plan first working set has restAfterSec > 0
        runtime.start().getOrThrow()
        runtime.logSet(SetLogInput(actualReps = 8, loadKg = 60.0)).getOrThrow()
        assertEquals(WorkoutPhase.REST, runtime.snapshot.value.phase)
        assertTrue(recording.restEvents.any { it.state == RestTimerNotificationState.RUNNING })

        runtime.skipRest().getOrThrow()
        assertEquals(
            RestTimerNotificationState.CANCELLED,
            recording.restEvents.last().state,
        )
    }

    @Test
    fun gatewayDedupesSameSecondRunningUpdates() = runBlocking {
        val gateway = FakeNotificationGateway()
        val port = GatewayWorkoutNotificationPort(gateway)
        val event = RestTimerNotificationEvent(
            sessionId = "sess-1",
            state = RestTimerNotificationState.RUNNING,
            remainingMs = 45_500L,
            durationMs = 90_000L,
        )
        port.restTimer(event)
        port.restTimer(event.copy(remainingMs = 45_200L)) // same second bucket
        assertEquals(1, gateway.delivered().size)

        port.restTimer(event.copy(remainingMs = 44_000L))
        assertEquals(2, gateway.delivered().size)

        port.restTimer(
            RestTimerNotificationEvent(
                sessionId = "sess-1",
                state = RestTimerNotificationState.CANCELLED,
            ),
        )
        assertTrue(gateway.delivered().none { it.id == GatewayWorkoutNotificationPort.restNotificationId("sess-1") })
    }

    @Test
    fun formatMmSsPadsSeconds() {
        assertEquals("1:05", GatewayWorkoutNotificationPort.formatMmSs(65))
        assertEquals("0:09", GatewayWorkoutNotificationPort.formatMmSs(9))
    }

    private fun <T> com.fitconnect.android.foundation.common.AppResult<T>.getOrThrow(): T =
        when (this) {
            is com.fitconnect.android.foundation.common.AppResult.Ok -> value
            is com.fitconnect.android.foundation.common.AppResult.Err -> error(error.toString())
        }
}
