package com.fitconnect.ascend.demo

import com.fitconnect.ascend.domain.EventPayload
import com.fitconnect.ascend.domain.EventSource
import com.fitconnect.ascend.domain.PerformanceEvent
import com.fitconnect.ascend.domain.PerformanceEventType
import com.fitconnect.ascend.engine.AscendEngine
import com.fitconnect.ascend.engine.EventIds
import com.fitconnect.ascend.streaks.StreakLogic

/**
 * Deterministic LOCAL_DEMO seeds. Never production telemetry.
 */
object AscendDemo {
    const val INES = "ines@fitconnect.demo"
    const val MARINA = "marina@fitconnect.demo"
    const val TOMAS = "tomas@fitconnect.demo"
    const val ATHLETE_LOCAL = "ath-1"

    /** 2024-07-01T00:00:00Z-ish, stable for tests. */
    const val DAY0 = 1_719_792_000_000L

    fun userIdForPersona(email: String?): String = when (email?.lowercase()) {
        INES -> INES
        MARINA -> MARINA
        TOMAS -> TOMAS
        else -> ATHLETE_LOCAL
    }

    fun seed(engine: AscendEngine, userId: String, nowEpochMs: Long = System.currentTimeMillis()) {
        if (engine.snapshot(userId).processedEventCount > 0) return
        when (userId) {
            INES, ATHLETE_LOCAL -> seedInes(engine, userId, nowEpochMs)
            MARINA -> seedMarina(engine, userId, nowEpochMs)
            TOMAS -> seedSquad(engine, userId)
        }
    }

    private fun seedInes(engine: AscendEngine, userId: String, nowEpochMs: Long) {
        engine.joinChallenge(userId, "squad-fc-week")
        val day0 = nowEpochMs - 18 * StreakLogic.DAY_MS
        engine.process(first(userId, day0))
        repeat(18) { day ->
            val ts = day0 + day * StreakLogic.DAY_MS + 8 * 3_600_000L
            if (day % 6 == 5) {
                engine.process(
                    event(
                        userId,
                        EventIds.typed(userId, "RECOVERY_DAY", "$day"),
                        PerformanceEventType.RECOVERY_DAY,
                        ts,
                        EventPayload(isRecoveryDay = true, recoveryScore = 88, demo = true),
                    ),
                )
                engine.process(
                    event(
                        userId,
                        EventIds.typed(userId, "SLEEP_TARGET", "$day"),
                        PerformanceEventType.SLEEP_TARGET,
                        ts + 1_000,
                        EventPayload(sleepQuality = 90, demo = true),
                    ),
                )
            } else {
                val distance = if (day == 10) 10_400.0 else 6_200.0 + day * 40
                engine.process(
                    event(
                        userId,
                        EventIds.workoutCompleted(userId, "ines-s$day"),
                        PerformanceEventType.WORKOUT_COMPLETED,
                        ts,
                        EventPayload(
                            sessionId = "ines-s$day",
                            sport = "run",
                            distanceM = distance,
                            durationMs = 2_400_000 + day * 12_000L,
                            elevationGainM = 40.0 + day,
                            caloriesKcal = 420 + day,
                            avgPaceSecPerKm = 315.0 - day,
                            avgHrBpm = 148,
                            recoveryScore = 72,
                            routeId = if (day % 4 == 0) "route-$day" else "route-home",
                            demo = true,
                        ),
                    ),
                )
                engine.process(
                    event(
                        userId,
                        EventIds.typed(userId, "DAILY_TARGET", "$day"),
                        PerformanceEventType.DAILY_TARGET_COMPLETED,
                        ts + 2_000,
                        EventPayload(demo = true),
                    ),
                )
            }
        }
    }

    private fun seedMarina(engine: AscendEngine, userId: String, nowEpochMs: Long) {
        val day0 = nowEpochMs - 3 * StreakLogic.DAY_MS
        engine.process(first(userId, day0))
        listOf("run", "ride", "swim").forEachIndexed { index, sport ->
            engine.process(
                event(
                    userId,
                    EventIds.typed(userId, "NEW_SPORT", sport),
                    PerformanceEventType.NEW_SPORT,
                    day0 + index * StreakLogic.DAY_MS,
                    EventPayload(sport = sport, demo = true),
                ),
            )
            engine.process(
                event(
                    userId,
                    EventIds.workoutCompleted(userId, "marina-$sport"),
                    PerformanceEventType.WORKOUT_COMPLETED,
                    day0 + index * StreakLogic.DAY_MS + 3_600_000,
                    EventPayload(
                        sessionId = "marina-$sport",
                        sport = sport,
                        distanceM = 8_000.0 + index * 1_000,
                        durationMs = 2_800_000,
                        elevationGainM = 80.0,
                        caloriesKcal = 500,
                        avgPaceSecPerKm = 340.0,
                        routeId = "marina-$sport",
                        recoveryScore = 80,
                        demo = true,
                    ),
                ),
            )
        }
    }

    private fun seedSquad(engine: AscendEngine, userId: String) {
        engine.joinChallenge(userId, "squad-fc-week")
    }

    private fun first(userId: String, at: Long) = event(
        userId,
        EventIds.typed(userId, "FIRST_ACTIVITY", "0"),
        PerformanceEventType.FIRST_ACTIVITY,
        at,
        EventPayload(demo = true),
    )

    private fun event(
        userId: String,
        id: String,
        type: PerformanceEventType,
        ts: Long,
        payload: EventPayload,
    ) = PerformanceEvent(
        eventId = id,
        userId = userId,
        type = type,
        timestampEpochMs = ts,
        source = EventSource.LOCAL_DEMO,
        payload = payload,
    )
}
