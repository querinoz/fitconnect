package com.fitconnect.android.athlete.ui.home

import com.fitconnect.android.athlete.demo.AthleteDemoCatalog
import com.fitconnect.android.fitness.domain.Sport
import com.fitconnect.android.fitness.domain.WorkoutSession
import kotlin.math.abs

object TodaySessionResolver {
    private val demoSessions = listOf(
        TodaySessionCardUi(
            id = "demo:run-1",
            title = "Morning run",
            subtitle = "RUN · 42 min · 7.2 km",
            sparkline = listOf(0.35f, 0.42f, 0.55f, 0.48f, 0.62f),
            isDemo = true,
        ),
        TodaySessionCardUi(
            id = "demo:ride-1",
            title = "Lunch ride",
            subtitle = "RIDE · 55 min · 28 km",
            sparkline = listOf(0.4f, 0.5f, 0.45f, 0.58f, 0.52f),
            isDemo = true,
        ),
        TodaySessionCardUi(
            id = "demo:strength-1",
            title = "Strength",
            subtitle = "STRENGTH · 38 min",
            sparkline = listOf(0.3f, 0.38f, 0.42f, 0.4f, 0.45f),
            isDemo = true,
        ),
    )

    fun fromWorkouts(sessions: List<WorkoutSession>): List<TodaySessionCardUi> =
        sessions
            .sortedByDescending { it.startedAtEpochMs }
            .take(6)
            .map { session ->
                TodaySessionCardUi(
                    id = session.id,
                    title = titleFor(session.sport),
                    subtitle = subtitleFor(session),
                    sparkline = sparklineFor(session),
                    isDemo = false,
                )
            }

    fun resolve(
        workouts: List<WorkoutSession>,
        includeDemoFallback: Boolean,
    ): List<TodaySessionCardUi> {
        val mapped = fromWorkouts(workouts).map { card ->
            card.copy(isDemo = false)
        }
        if (mapped.isNotEmpty()) return mapped
        return if (includeDemoFallback) demoSessions else emptyList()
    }

    private fun titleFor(sport: Sport): String =
        sport.name
            .lowercase()
            .split('_')
            .joinToString(" ") { part -> part.replaceFirstChar { it.uppercase() } }

    private fun subtitleFor(session: WorkoutSession): String {
        val sport = session.sport.name
        val durationMin = (session.durationMs / 60_000).coerceAtLeast(1)
        val distance = session.distanceM?.let { " · %.1f km".format(it / 1000.0) }.orEmpty()
        return "$sport · $durationMin min$distance"
    }

    private fun sparklineFor(session: WorkoutSession): List<Float> {
        val seed = abs(session.externalId.hashCode())
        return List(5) { index ->
            val base = 0.3f + (seed % 30) / 100f
            base + (index * 0.08f) % 0.35f
        }
    }
}
