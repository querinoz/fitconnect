package com.fitconnect.android.athlete.ascend

import com.fitconnect.android.athlete.data.LocalAthleteRepository
import com.fitconnect.android.capture.LiveActivitySnapshot
import com.fitconnect.ascend.domain.EventPayload
import com.fitconnect.ascend.domain.EventSource
import com.fitconnect.ascend.domain.PerformanceEvent
import com.fitconnect.ascend.domain.PerformanceEventType
import com.fitconnect.ascend.engine.EventIds

object ActivityAscendBridge {
    fun workoutEvent(snapshot: LiveActivitySnapshot, userId: String = LocalAthleteRepository.ATHLETE_ID): PerformanceEvent {
        val session = snapshot.sessionId.ifBlank { "local-session" }
        return PerformanceEvent(
            eventId = EventIds.workoutCompleted(userId, session),
            userId = userId,
            type = PerformanceEventType.WORKOUT_COMPLETED,
            timestampEpochMs = System.currentTimeMillis(),
            source = EventSource.PHONE,
            payload = EventPayload(
                sessionId = session,
                sport = snapshot.sport,
                distanceM = snapshot.distanceM,
                durationMs = snapshot.elapsedMs,
                elevationGainM = snapshot.elevationGainM,
                caloriesKcal = snapshot.caloriesKcal,
                avgPaceSecPerKm = snapshot.paceSecPerKm,
                avgHrBpm = snapshot.avgHrBpm,
                routeId = if (snapshot.route.isNotEmpty()) "session-$session" else null,
                demo = true,
            ),
        )
    }
}
