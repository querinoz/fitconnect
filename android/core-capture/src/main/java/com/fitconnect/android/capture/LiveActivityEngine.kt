package com.fitconnect.android.capture

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlin.math.sin

enum class LiveActivityPhase { IDLE, RUNNING, PAUSED, ENDED }

enum class GpsFeedStatus {
    SIMULATED,
    UNAVAILABLE,
    PERMISSION_DENIED,
}

data class LiveActivitySnapshot(
    val phase: LiveActivityPhase = LiveActivityPhase.IDLE,
    val sport: String = "Run",
    val elapsedMs: Long = 0L,
    val movingMs: Long = 0L,
    val distanceM: Double = 0.0,
    val paceSecPerKm: Double? = null,
    val speedMps: Double? = null,
    val hrBpm: Int? = null,
    val zone: Int? = null,
    val caloriesKcal: Int = 0,
    val gps: GpsFeedStatus = GpsFeedStatus.SIMULATED,
    val sourceLabel: String = SOURCE_LABEL,
) {
    companion object {
        const val SOURCE_LABEL = "LOCAL_DEMO"
    }
}

/**
 * In-process activity monitor. Does **not** bind FusedLocation or BLE.
 * Distance/HR are simulated and always labeled [LiveActivitySnapshot.SOURCE_LABEL].
 * Production capture remains ForegroundService + elite-core (see module kdoc).
 */
class LiveActivityEngine(
    private val clockMs: () -> Long = { System.currentTimeMillis() },
) {
    private val _state = MutableStateFlow(LiveActivitySnapshot())
    val state: StateFlow<LiveActivitySnapshot> = _state.asStateFlow()

    private var startedAt = 0L
    private var lastTickAt = 0L
    private var pausedAccumulatedMs = 0L

    fun start(sport: String = "Run") {
        val now = clockMs()
        startedAt = now
        lastTickAt = now
        pausedAccumulatedMs = 0L
        _state.value = LiveActivitySnapshot(
            phase = LiveActivityPhase.RUNNING,
            sport = sport,
            gps = GpsFeedStatus.SIMULATED,
        )
    }

    fun pause() {
        val current = _state.value
        if (current.phase != LiveActivityPhase.RUNNING) return
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
        if (current.phase == LiveActivityPhase.IDLE) return
        tick()
        _state.value = _state.value.copy(phase = LiveActivityPhase.ENDED)
    }

    fun discard() {
        startedAt = 0L
        lastTickAt = 0L
        pausedAccumulatedMs = 0L
        _state.value = LiveActivitySnapshot()
    }

    fun tick() {
        val current = _state.value
        if (current.phase != LiveActivityPhase.RUNNING) return
        val now = clockMs()
        val dt = (now - lastTickAt).coerceAtLeast(0L)
        lastTickAt = now
        val moving = current.movingMs + dt
        val elapsed = now - startedAt
        val distance = SIM_SPEED_MPS * (moving / 1000.0)
        val speed = if (moving > 0) distance / (moving / 1000.0) else SIM_SPEED_MPS
        val pace = if (distance > 1.0) (moving / 1000.0) / (distance / 1000.0) else null
        val tSec = moving / 1000.0
        val hr = (148 + 12 * sin(tSec / 18.0)).toInt().coerceIn(90, 190)
        _state.value = current.copy(
            elapsedMs = elapsed.coerceAtLeast(0L),
            movingMs = moving,
            distanceM = distance,
            speedMps = speed,
            paceSecPerKm = pace,
            hrBpm = hr,
            zone = zoneFor(hr),
            caloriesKcal = (distance / 1000.0 * 70.0).toInt(),
            gps = GpsFeedStatus.SIMULATED,
            sourceLabel = LiveActivitySnapshot.SOURCE_LABEL,
        )
    }

    companion object {
        /** ~5:30 /km jogging simulation — not a sensor reading. */
        const val SIM_SPEED_MPS = 3.03

        fun zoneFor(hrBpm: Int): Int = when {
            hrBpm < 120 -> 1
            hrBpm < 140 -> 2
            hrBpm < 160 -> 3
            hrBpm < 175 -> 4
            else -> 5
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
