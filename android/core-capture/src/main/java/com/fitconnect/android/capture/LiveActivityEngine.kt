package com.fitconnect.android.capture

import com.fitconnect.shared.geo.QaGpsRoute
import com.fitconnect.shared.geo.RouteMath
import com.fitconnect.shared.geo.RoutePoint
import com.fitconnect.shared.geo.WorkoutLap
import com.fitconnect.shared.session.ActivitySessionState
import com.fitconnect.shared.session.WorkoutRegistry
import com.fitconnect.shared.source.DataSourceKind
import com.fitconnect.shared.workout.WorkoutSport
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlin.math.sin

enum class LiveActivityPhase {
    IDLE,
    READY,
    COUNTDOWN,
    RUNNING,
    PAUSED,
    RESUMING,
    FINISHING,
    ENDED,
}

enum class GpsFeedStatus {
    SIMULATED,
    EMULATOR_INJECTED,
    LIVE,
    UNAVAILABLE,
    PERMISSION_DENIED,
}

enum class MapDisplayMode {
    LIVE,
    ROUTE,
    HEATMAP,
    PACE,
    HEART_RATE,
    ELEVATION,
}

data class LiveActivitySnapshot(
    val phase: LiveActivityPhase = LiveActivityPhase.IDLE,
    val sport: String = WorkoutSport.RUN.wireKey,
    val sessionId: String = "",
    val elapsedMs: Long = 0L,
    val movingMs: Long = 0L,
    val distanceM: Double = 0.0,
    val paceSecPerKm: Double? = null,
    val bestPaceSecPerKm: Double? = null,
    val speedMps: Double? = null,
    val hrBpm: Int? = null,
    val avgHrBpm: Int? = null,
    val maxHrBpm: Int? = null,
    val zone: Int? = null,
    val caloriesKcal: Int = 0,
    val elevationGainM: Double = 0.0,
    val elevationLossM: Double = 0.0,
    val gps: GpsFeedStatus = GpsFeedStatus.UNAVAILABLE,
    val sourceLabel: String = SOURCE_LABEL,
    val sourceKind: DataSourceKind = DataSourceKind.LOCAL_DEMO,
    val route: List<RoutePoint> = emptyList(),
    val laps: List<WorkoutLap> = emptyList(),
    val countdownRemainingSec: Int = 0,
    val replayFraction: Float = 1f,
    val timeInZoneSec: IntArray = intArrayOf(0, 0, 0, 0, 0),
    val performanceScore: Int? = null,
) {
    val sessionState: ActivitySessionState
        get() = when (phase) {
            LiveActivityPhase.IDLE -> ActivitySessionState.IDLE
            LiveActivityPhase.READY -> ActivitySessionState.READY
            LiveActivityPhase.COUNTDOWN -> ActivitySessionState.COUNTDOWN
            LiveActivityPhase.RUNNING -> ActivitySessionState.ACTIVE
            LiveActivityPhase.PAUSED -> ActivitySessionState.PAUSED
            LiveActivityPhase.RESUMING -> ActivitySessionState.RESUMING
            LiveActivityPhase.FINISHING -> ActivitySessionState.FINISHING
            LiveActivityPhase.ENDED -> ActivitySessionState.COMPLETED
        }

    val replayCursor: RoutePoint?
        get() = RouteMath.replayPoint(route, replayFraction)

    val sportType: WorkoutSport get() = WorkoutSport.fromKey(sport)

    companion object {
        const val SOURCE_LABEL = "LOCAL_DEMO"
    }
}

/**
 * Activity recording engine.
 *
 * Default GPS is the deterministic [QaGpsRoute] labeled LOCAL_DEMO / TEST_FIXTURE.
 * [ingestFix] is the only path that can become LIVE, and only when the caller
 * marks [GpsFeedStatus.LIVE] (real LocationManager, not mock).
 *
 * Heart-rate sine wave is LOCAL_DEMO. It is never upgraded to REAL_SENSOR.
 */
class LiveActivityEngine(
    private val clockMs: () -> Long = { System.currentTimeMillis() },
    private val registry: WorkoutRegistry = WorkoutRegistry(),
) {
    private val _state = MutableStateFlow(LiveActivitySnapshot())
    val state: StateFlow<LiveActivitySnapshot> = _state.asStateFlow()

    private var startedAt = 0L
    private var lastTickAt = 0L
    private var pausedAccumulatedMs = 0L
    private var sessionSeq = 0
    private val hrSamples = mutableListOf<Int>()
    private var lastLapDistanceM = 0.0
    private var lastLapAt = 0L
    private var liveGpsBound = false

    fun arm(sport: String = WorkoutSport.RUN.wireKey) {
        if (_state.value.phase != LiveActivityPhase.IDLE &&
            _state.value.phase != LiveActivityPhase.ENDED
        ) {
            return
        }
        _state.value = LiveActivitySnapshot(
            phase = LiveActivityPhase.READY,
            sport = WorkoutSport.fromKey(sport).wireKey,
            gps = gpsFor(WorkoutSport.fromKey(sport), live = false),
            sourceLabel = LiveActivitySnapshot.SOURCE_LABEL,
        )
    }

    fun beginCountdown() {
        val current = _state.value
        if (current.phase != LiveActivityPhase.READY && current.phase != LiveActivityPhase.IDLE) return
        _state.value = current.copy(
            phase = LiveActivityPhase.COUNTDOWN,
            countdownRemainingSec = COUNTDOWN_SEC,
            sport = WorkoutSport.fromKey(current.sport).wireKey,
        )
    }

    fun tickCountdown() {
        val current = _state.value
        if (current.phase != LiveActivityPhase.COUNTDOWN) return
        val next = current.countdownRemainingSec - 1
        if (next <= 0) {
            start(current.sport)
        } else {
            _state.value = current.copy(countdownRemainingSec = next)
        }
    }

    fun start(sport: String = "Run") {
        val now = clockMs()
        startedAt = now
        lastTickAt = now
        pausedAccumulatedMs = 0L
        hrSamples.clear()
        lastLapDistanceM = 0.0
        lastLapAt = now
        liveGpsBound = false
        sessionSeq += 1
        val sessionId = "fc-session-$sessionSeq-$now"
        registry.begin(sessionId)
        val kind = WorkoutSport.fromKey(sport)
        _state.value = LiveActivitySnapshot(
            phase = LiveActivityPhase.RUNNING,
            sport = kind.wireKey,
            sessionId = sessionId,
            gps = gpsFor(kind, live = false),
            sourceLabel = LiveActivitySnapshot.SOURCE_LABEL,
            sourceKind = DataSourceKind.LOCAL_DEMO,
        )
    }

    /**
     * Phone adopts a watch-originated session. Returns false if the id was
     * already completed (duplicate prevention).
     */
    fun adoptRemote(sessionId: String, sport: String = WorkoutSport.RUN.wireKey): Boolean {
        val current = _state.value
        if (current.phase != LiveActivityPhase.IDLE && current.phase != LiveActivityPhase.ENDED) {
            return current.sessionId == sessionId
        }
        if (sessionId.isBlank() || registry.isDuplicate(sessionId)) return false
        if (!registry.begin(sessionId)) return false
        val now = clockMs()
        startedAt = now
        lastTickAt = now
        pausedAccumulatedMs = 0L
        hrSamples.clear()
        liveGpsBound = false
        val kind = WorkoutSport.fromKey(sport)
        _state.value = LiveActivitySnapshot(
            phase = LiveActivityPhase.RUNNING,
            sport = kind.wireKey,
            sessionId = sessionId,
            gps = gpsFor(kind, live = false),
            sourceLabel = "WATCH",
            sourceKind = DataSourceKind.LOCAL_DEMO,
        )
        return true
    }

    fun pause() {
        val current = _state.value
        if (current.phase != LiveActivityPhase.RUNNING && current.phase != LiveActivityPhase.RESUMING) return
        tick()
        _state.value = _state.value.copy(phase = LiveActivityPhase.PAUSED)
    }

    fun resume() {
        val current = _state.value
        if (current.phase != LiveActivityPhase.PAUSED) return
        lastTickAt = clockMs()
        _state.value = current.copy(phase = LiveActivityPhase.RUNNING)
    }

    fun end() {
        val current = _state.value
        if (current.phase == LiveActivityPhase.IDLE || current.phase == LiveActivityPhase.ENDED) return
        if (current.phase == LiveActivityPhase.RUNNING || current.phase == LiveActivityPhase.RESUMING) {
            tick()
        }
        val finishing = _state.value.copy(phase = LiveActivityPhase.FINISHING)
        _state.value = finishing
        val scored = finishing.copy(
            phase = LiveActivityPhase.ENDED,
            performanceScore = performanceScore(finishing),
            replayFraction = 1f,
        )
        _state.value = scored
        if (scored.sessionId.isNotBlank()) {
            registry.complete(scored.sessionId)
        }
    }

    fun discard() {
        startedAt = 0L
        lastTickAt = 0L
        pausedAccumulatedMs = 0L
        hrSamples.clear()
        liveGpsBound = false
        _state.value = LiveActivitySnapshot()
    }

    fun addLap() {
        val current = _state.value
        if (current.phase != LiveActivityPhase.RUNNING) return
        val now = clockMs()
        val lap = WorkoutLap(
            index = current.laps.size + 1,
            startedAtEpochMs = lastLapAt,
            endedAtEpochMs = now,
            distanceM = (current.distanceM - lastLapDistanceM).coerceAtLeast(0.0),
        )
        lastLapDistanceM = current.distanceM
        lastLapAt = now
        _state.value = current.copy(laps = current.laps + lap)
    }

    fun setReplayFraction(fraction: Float) {
        val current = _state.value
        if (current.phase != LiveActivityPhase.ENDED) return
        _state.value = current.copy(replayFraction = fraction.coerceIn(0f, 1f))
    }

    /**
     * Inject a location fix. [GpsFeedStatus.LIVE] is reserved for a real
     * (non-mock) LocationManager sample. Emulator `geo fix` must use
     * [GpsFeedStatus.EMULATOR_INJECTED].
     */
    fun ingestFix(point: RoutePoint, feed: GpsFeedStatus) {
        val current = _state.value
        if (current.phase != LiveActivityPhase.RUNNING) return
        if (feed == GpsFeedStatus.LIVE || feed == GpsFeedStatus.EMULATOR_INJECTED) {
            liveGpsBound = true
        }
        if (!current.sportType.outdoorGps) return
        val route = current.route + point
        val summary = RouteMath.summary(route, current.movingMs, current.elapsedMs)
        _state.value = current.copy(
            route = route,
            distanceM = summary.distanceM,
            elevationGainM = summary.elevationGainM,
            elevationLossM = summary.elevationLossM,
            paceSecPerKm = summary.averagePaceSecPerKm,
            bestPaceSecPerKm = summary.bestPaceSecPerKm,
            speedMps = point.speedMps ?: summary.averageSpeedMps,
            gps = feed,
            sourceKind = point.source,
            sourceLabel = when (feed) {
                GpsFeedStatus.LIVE -> "GPS.LIVE"
                GpsFeedStatus.EMULATOR_INJECTED -> "GPS.EMULATOR"
                GpsFeedStatus.SIMULATED -> LiveActivitySnapshot.SOURCE_LABEL
                GpsFeedStatus.UNAVAILABLE -> "GPS.UNAVAILABLE"
                GpsFeedStatus.PERMISSION_DENIED -> "GPS.PERMISSION"
            },
        )
    }

    fun ingestHeartRate(bpm: Int, source: DataSourceKind) {
        val current = _state.value
        if (current.phase != LiveActivityPhase.RUNNING) return
        if (bpm <= 0) return
        hrSamples += bpm
        _state.value = current.copy(
            hrBpm = bpm,
            zone = zoneFor(bpm),
            avgHrBpm = hrSamples.average().toInt(),
            maxHrBpm = hrSamples.maxOrNull(),
            sourceKind = source,
        )
    }

    fun isDuplicateSession(sessionId: String): Boolean = registry.isDuplicate(sessionId)

    fun tick() {
        val current = _state.value
        if (current.phase == LiveActivityPhase.COUNTDOWN) {
            tickCountdown()
            return
        }
        if (current.phase != LiveActivityPhase.RUNNING) return
        val now = clockMs()
        val dt = (now - lastTickAt).coerceAtLeast(0L)
        lastTickAt = now
        val moving = current.movingMs + dt
        val elapsed = now - startedAt
        val sport = current.sportType
        val tSec = moving / 1000.0
        val simHr = (148 + 12 * sin(tSec / 18.0)).toInt().coerceIn(90, 190)
        val hr = current.hrBpm ?: simHr
        hrSamples += hr
        val zones = current.timeInZoneSec.copyOf()
        val z = zoneFor(hr)
        if (z in 1..5) zones[z - 1] = zones[z - 1] + (dt / 1000L).toInt().coerceAtLeast(0)

        var distance = current.distanceM
        var route = current.route
        var gps = current.gps
        var elevationGain = current.elevationGainM
        var elevationLoss = current.elevationLossM
        var pace = current.paceSecPerKm
        var bestPace = current.bestPaceSecPerKm
        var speed = current.speedMps

        if (sport.outdoorGps && !liveGpsBound) {
            distance = (SIM_SPEED_MPS * tSec).coerceAtMost(QaGpsRoute.lengthM)
            val template = QaGpsRoute.POINTS
            val along = RouteMath.pointAlong(template, distance, now)
            if (along != null) {
                route = route + along.copy(heartRateBpm = hr, source = DataSourceKind.LOCAL_DEMO)
            }
            val summary = RouteMath.summary(route, moving, elapsed)
            elevationGain = summary.elevationGainM
            elevationLoss = summary.elevationLossM
            pace = if (distance > 1.0) tSec / (distance / 1000.0) else null
            bestPace = summary.bestPaceSecPerKm
            speed = SIM_SPEED_MPS
            gps = GpsFeedStatus.SIMULATED
        } else if (!sport.outdoorGps) {
            gps = GpsFeedStatus.UNAVAILABLE
            if (sport == WorkoutSport.INDOOR_RUN || sport == WorkoutSport.INDOOR_CYCLING) {
                distance = SIM_SPEED_MPS * tSec
                pace = if (distance > 1.0) tSec / (distance / 1000.0) else null
                speed = SIM_SPEED_MPS
            }
        } else {
            val summary = RouteMath.summary(route, moving, elapsed)
            distance = summary.distanceM
            elevationGain = summary.elevationGainM
            elevationLoss = summary.elevationLossM
            pace = summary.averagePaceSecPerKm
            bestPace = summary.bestPaceSecPerKm
            speed = summary.averageSpeedMps
        }

        _state.value = current.copy(
            elapsedMs = elapsed.coerceAtLeast(0L),
            movingMs = moving,
            distanceM = distance,
            speedMps = speed,
            paceSecPerKm = pace,
            bestPaceSecPerKm = bestPace,
            hrBpm = hr,
            avgHrBpm = hrSamples.average().toInt(),
            maxHrBpm = hrSamples.maxOrNull(),
            zone = z,
            caloriesKcal = caloriesFor(sport, distance, moving),
            gps = gps,
            sourceLabel = if (liveGpsBound) current.sourceLabel else LiveActivitySnapshot.SOURCE_LABEL,
            sourceKind = if (liveGpsBound) current.sourceKind else DataSourceKind.LOCAL_DEMO,
            route = route,
            elevationGainM = elevationGain,
            elevationLossM = elevationLoss,
            timeInZoneSec = zones,
        )
    }

    companion object {
        /** ~5:30 /km jogging simulation — not a sensor reading. */
        const val SIM_SPEED_MPS = 3.03
        const val COUNTDOWN_SEC = 3

        fun gpsFor(sport: WorkoutSport, live: Boolean): GpsFeedStatus = when {
            live && sport.outdoorGps -> GpsFeedStatus.LIVE
            sport.outdoorGps -> GpsFeedStatus.SIMULATED
            else -> GpsFeedStatus.UNAVAILABLE
        }

        fun zoneFor(hrBpm: Int): Int = when {
            hrBpm < 120 -> 1
            hrBpm < 140 -> 2
            hrBpm < 160 -> 3
            hrBpm < 175 -> 4
            else -> 5
        }

        fun caloriesFor(sport: WorkoutSport, distanceM: Double, movingMs: Long): Int {
            val km = distanceM / 1000.0
            val minutes = movingMs / 60_000.0
            return when (sport) {
                WorkoutSport.STRENGTH, WorkoutSport.MOBILITY, WorkoutSport.RECOVERY ->
                    (minutes * 6.0).toInt()
                WorkoutSport.CYCLING, WorkoutSport.INDOOR_CYCLING ->
                    (km * 40.0).toInt()
                else -> (km * 70.0).toInt()
            }
        }

        fun performanceScore(snap: LiveActivitySnapshot): Int {
            val distanceScore = (snap.distanceM / 100.0).coerceIn(0.0, 40.0)
            val hrScore = (snap.avgHrBpm ?: 0).coerceIn(0, 40).toDouble() * 0.2
            val timeScore = (snap.movingMs / 60_000.0).coerceIn(0.0, 20.0)
            return (40 + distanceScore + hrScore + timeScore).toInt().coerceIn(0, 99)
        }

        fun formatElapsed(ms: Long): String {
            val totalSec = (ms / 1000L).coerceAtLeast(0L)
            val h = totalSec / 3600
            val m = (totalSec % 3600) / 60
            val s = totalSec % 60
            return if (h > 0) {
                "%d:%02d:%02d".format(h, m, s)
            } else {
                "%02d:%02d".format(m, s)
            }
        }

        fun formatPace(secPerKm: Double?): String {
            if (secPerKm == null || secPerKm <= 0.0 || !secPerKm.isFinite()) return "—"
            val total = secPerKm.toInt()
            return "%d:%02d /km".format(total / 60, total % 60)
        }
    }
}
