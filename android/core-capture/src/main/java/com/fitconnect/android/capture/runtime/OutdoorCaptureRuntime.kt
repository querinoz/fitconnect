package com.fitconnect.android.capture.runtime

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat
import com.fitconnect.android.capture.GpsFeedStatus
import com.fitconnect.android.capture.LiveActivityEngine
import com.fitconnect.android.capture.LiveActivityPhase
import com.fitconnect.android.capture.gps.FusedLocationGpsSource
import com.fitconnect.android.capture.gps.GpsAccuracyFilter
import com.fitconnect.android.capture.gps.GpsPointVerdict
import com.fitconnect.android.capture.service.CaptureLocationService
import com.fitconnect.android.capture.store.GpsRouteStore
import com.fitconnect.android.capture.store.room.GpsSessionEntity
import com.fitconnect.android.capture.store.room.LocationPointEntity
import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.common.Logger
import com.fitconnect.android.foundation.offline.OfflineCoordinator
import com.fitconnect.android.foundation.offline.SyncWork
import com.fitconnect.android.foundation.session.SessionStore
import com.fitconnect.shared.geo.RouteMath
import com.fitconnect.shared.geo.RoutePoint
import com.fitconnect.shared.workout.WorkoutSport
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.UUID

enum class OutdoorTrackingPhase {
    IDLE,
    PREPARING,
    TRACKING,
    PAUSED,
    GPS_DEGRADED,
    RESUMING,
    FINISHING,
    COMPLETED,
    SYNC_PENDING,
    SYNCED,
    ERROR,
}

data class OutdoorCaptureState(
    val phase: OutdoorTrackingPhase = OutdoorTrackingPhase.IDLE,
    val activityId: String = "",
    val permissionOk: Boolean = false,
    val lastVerdict: String = "",
    val acceptedPoints: Int = 0,
    val rejectedPoints: Int = 0,
    val error: String? = null,
)

/**
 * Real outdoor capture orchestrator. Room is authoritative for recovery.
 * Does not invent coordinates. Does not flush HTTP on the UI thread.
 */
class OutdoorCaptureRuntime(
    private val appContext: Context,
    private val engine: LiveActivityEngine,
    private val store: GpsRouteStore,
    private val offline: OfflineCoordinator,
    private val sessionStore: SessionStore,
    private val fused: FusedLocationGpsSource = FusedLocationGpsSource(appContext),
    private val logger: Logger? = null,
    private val scope: CoroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Default),
) {
    private val _state = MutableStateFlow(OutdoorCaptureState())
    val state: StateFlow<OutdoorCaptureState> = _state.asStateFlow()

    private var fixJob: Job? = null
    private var sequence = 0
    private var lastAccepted: RoutePoint? = null
    private var activityId: String = ""
    private var userId: String = ""
    private var sport: String = WorkoutSport.RUN.wireKey
    private var startedAtMs: Long = 0L

    fun hasLocationPermission(): Boolean {
        val fine = ContextCompat.checkSelfPermission(appContext, Manifest.permission.ACCESS_FINE_LOCATION)
        val coarse = ContextCompat.checkSelfPermission(appContext, Manifest.permission.ACCESS_COARSE_LOCATION)
        return fine == PackageManager.PERMISSION_GRANTED || coarse == PackageManager.PERMISSION_GRANTED
    }

    suspend fun recoverIfNeeded(): Boolean {
        val uid = sessionStore.snapshot().userId ?: return false
        val active = store.activeSession(uid) ?: return false
        activityId = active.activityId
        userId = active.userId
        sport = active.sport
        startedAtMs = active.startedAtUtcMs
        sequence = store.pointCount(active.activityId)
        lastAccepted = store.acceptedRoutePoints(active.activityId).lastOrNull()
        // Keep DI GPS policy (debug may allow emulator simulated fallback).
        engine.restoreSession(
            sessionId = active.activityId,
            sport = active.sport,
            route = store.acceptedRoutePoints(active.activityId),
            distanceM = active.distanceM,
            movingMs = active.movingMs,
            elapsedMs = active.elapsedMs,
            phase = when (active.phase) {
                "PAUSED" -> LiveActivityPhase.PAUSED
                else -> LiveActivityPhase.RUNNING
            },
        )
        _state.value = OutdoorCaptureState(
            phase = if (active.phase == "PAUSED") OutdoorTrackingPhase.PAUSED else OutdoorTrackingPhase.TRACKING,
            activityId = active.activityId,
            permissionOk = hasLocationPermission(),
            acceptedPoints = store.acceptedRoutePoints(active.activityId).size,
        )
        if (active.phase != "PAUSED") {
            startService("recover", active.distanceM)
            startFixCollection()
        }
        return true
    }

    fun prepare(sportKey: String = WorkoutSport.RUN.wireKey): AppResult<Unit> {
        if (!hasLocationPermission()) {
            _state.value = OutdoorCaptureState(
                phase = OutdoorTrackingPhase.ERROR,
                permissionOk = false,
                error = "permission_denied",
            )
            engine.ingestFixUnavailable(GpsFeedStatus.PERMISSION_DENIED)
            return AppResult.Err(AppError.Auth(AppError.AuthKind.FORBIDDEN))
        }
        sport = WorkoutSport.fromKey(sportKey).wireKey
        engine.arm(sport)
        _state.value = OutdoorCaptureState(phase = OutdoorTrackingPhase.PREPARING, permissionOk = true)
        return AppResult.Ok(Unit)
    }

    suspend fun beginCountdownAndTrack(): AppResult<Unit> {
        val snap = sessionStore.snapshot()
        val uid = snap.userId
            ?: return AppResult.Err(AppError.Auth(AppError.AuthKind.UNAUTHENTICATED))
        if (!hasLocationPermission()) {
            _state.value = _state.value.copy(phase = OutdoorTrackingPhase.ERROR, error = "permission_denied")
            return AppResult.Err(AppError.Auth(AppError.AuthKind.FORBIDDEN))
        }
        userId = uid
        activityId = UUID.randomUUID().toString()
        sequence = 0
        lastAccepted = null
        startedAtMs = System.currentTimeMillis()
        engine.startWithId(activityId, sport)
        // PREPARING until first ACCEPT fix — do not claim TRACKING on tap alone.
        persistSession(OutdoorTrackingPhase.PREPARING)
        startService(LiveActivityEngine.formatElapsed(0), 0.0)
        startFixCollection()
        _state.value = OutdoorCaptureState(
            phase = OutdoorTrackingPhase.PREPARING,
            activityId = activityId,
            permissionOk = true,
        )
        log("service_started phase=PREPARING pointCount=0")
        log("workout_started")
        return AppResult.Ok(Unit)
    }

    fun pause() {
        engine.pause()
        fixJob?.cancel()
        fixJob = null
        CaptureLocationService.update(
            appContext,
            LiveActivityEngine.formatElapsed(engine.state.value.elapsedMs),
            formatDistance(engine.state.value.distanceM),
            paused = true,
        )
        scope.launch { persistSession(OutdoorTrackingPhase.PAUSED) }
        _state.value = _state.value.copy(phase = OutdoorTrackingPhase.PAUSED)
        log("workout_paused")
    }

    fun resume() {
        engine.resume()
        startFixCollection()
        CaptureLocationService.update(
            appContext,
            LiveActivityEngine.formatElapsed(engine.state.value.elapsedMs),
            formatDistance(engine.state.value.distanceM),
            paused = false,
        )
        scope.launch { persistSession(OutdoorTrackingPhase.TRACKING) }
        _state.value = _state.value.copy(phase = OutdoorTrackingPhase.TRACKING)
        log("workout_resumed")
    }

    suspend fun finish(): AppResult<Unit> {
        _state.value = _state.value.copy(phase = OutdoorTrackingPhase.FINISHING)
        fixJob?.cancel()
        fixJob = null
        engine.end()
        CaptureLocationService.stop(appContext)
        log("service_stopped phase=FINISHING pointCount=${_state.value.acceptedPoints}")
        val eng = engine.state.value
        persistSession(OutdoorTrackingPhase.COMPLETED)
        val payload = OutdoorCompletionFactory.build(
            userId = userId,
            activityId = activityId,
            sessionId = activityId,
            sport = sport,
            startedAtMs = startedAtMs,
            completedAtMs = System.currentTimeMillis(),
            durationMs = eng.movingMs.coerceAtLeast(eng.elapsedMs),
            distanceM = eng.distanceM,
            points = store.acceptedRoutePoints(activityId),
            avgSpeedMps = eng.speedMps,
            elevationGainM = eng.elevationGainM,
        )
        offline.enqueue(
            SyncWork(
                id = "gps-act-$activityId",
                type = OUTDOOR_ACTIVITY_TYPE,
                payloadJson = payload.activityJson,
                idempotencyKey = payload.activityIdempotencyKey,
            ),
        )
        offline.enqueue(
            SyncWork(
                id = "gps-xp-$activityId",
                type = OUTDOOR_XP_TYPE,
                payloadJson = payload.xpJson,
                idempotencyKey = payload.xpIdempotencyKey,
            ),
        )
        store.upsertSession(
            requireNotNull(store.session(activityId)).copy(
                phase = "SYNC_PENDING",
                syncStatus = "PENDING",
                updatedAtUtcMs = System.currentTimeMillis(),
            ),
        )
        _state.value = _state.value.copy(phase = OutdoorTrackingPhase.SYNC_PENDING)
        log("workout_completed")
        return AppResult.Ok(Unit)
    }

    private fun startFixCollection() {
        fixJob?.cancel()
        fixJob = scope.launch {
            fused.fixes().collect { fix ->
                val distanceFromLast = lastAccepted?.let { RouteMath.haversineM(it, fix.point) }
                val filter = GpsAccuracyFilter.evaluate(
                    latitude = fix.point.latitude,
                    longitude = fix.point.longitude,
                    accuracyM = fix.point.accuracyM,
                    distanceFromLastAcceptedM = distanceFromLast,
                )
                sequence += 1
                val entity = LocationPointEntity(
                    pointId = "$activityId:$sequence",
                    activityId = activityId,
                    userId = userId,
                    latitude = fix.point.latitude,
                    longitude = fix.point.longitude,
                    accuracyMeters = fix.point.accuracyM,
                    speedMps = fix.point.speedMps,
                    altitudeMeters = fix.point.altitudeM,
                    capturedAtUtcMs = fix.point.timestampEpochMs,
                    sequenceNumber = sequence,
                    verdict = filter.verdict.name,
                    feedStatus = fix.feed.name,
                )
                store.appendPoint(entity)
                when (filter.verdict) {
                    GpsPointVerdict.ACCEPT -> {
                        lastAccepted = fix.point
                        engine.ingestFix(fix.point, fix.feed)
                        val accepted = _state.value.acceptedPoints + 1
                        _state.value = _state.value.copy(
                            phase = OutdoorTrackingPhase.TRACKING,
                            acceptedPoints = accepted,
                            lastVerdict = filter.reason,
                        )
                        log(
                            "fix_accept seq=$sequence pointCount=$accepted " +
                                "accuracyBucket=${accuracyBucket(fix.point.accuracyM)} " +
                                "gpsState=TRACKING",
                        )
                    }
                    GpsPointVerdict.LOW_CONFIDENCE -> {
                        _state.value = _state.value.copy(
                            phase = OutdoorTrackingPhase.GPS_DEGRADED,
                            lastVerdict = filter.reason,
                        )
                        log(
                            "fix_low_confidence seq=$sequence pointCount=${_state.value.acceptedPoints} " +
                                "accuracyBucket=${accuracyBucket(fix.point.accuracyM)} " +
                                "gpsState=GPS_DEGRADED",
                        )
                    }
                    GpsPointVerdict.REJECT -> {
                        _state.value = _state.value.copy(
                            rejectedPoints = _state.value.rejectedPoints + 1,
                            lastVerdict = filter.reason,
                        )
                        log(
                            "fix_reject seq=$sequence pointCount=${_state.value.acceptedPoints} " +
                                "accuracyBucket=${accuracyBucket(fix.point.accuracyM)} reason=${filter.reason}",
                        )
                    }
                }
                CaptureLocationService.update(
                    appContext,
                    LiveActivityEngine.formatElapsed(engine.state.value.elapsedMs),
                    formatDistance(engine.state.value.distanceM),
                    paused = false,
                )
                persistSession(_state.value.phase)
            }
        }
    }

    private fun startService(elapsedLabel: String, distanceM: Double) {
        CaptureLocationService.start(
            appContext,
            elapsedLabel,
            formatDistance(distanceM),
            paused = false,
        )
    }

    private suspend fun persistSession(phase: OutdoorTrackingPhase) {
        val eng = engine.state.value
        store.upsertSession(
            GpsSessionEntity(
                activityId = activityId,
                userId = userId,
                sport = sport,
                phase = phase.name,
                startedAtUtcMs = startedAtMs,
                updatedAtUtcMs = System.currentTimeMillis(),
                distanceM = eng.distanceM,
                movingMs = eng.movingMs,
                elapsedMs = eng.elapsedMs,
                idempotencyKey = "activity:$userId:$activityId",
                syncStatus = if (phase == OutdoorTrackingPhase.SYNC_PENDING) "PENDING" else "LOCAL",
            ),
        )
    }

    private fun formatDistance(m: Double): String =
        if (m < 1000) "${m.toInt()} m" else String.format("%.2f km", m / 1000.0)

    /** Aggregate accuracy only — never log exact coordinates. */
    private fun accuracyBucket(accuracyM: Double?): String = when {
        accuracyM == null -> "UNKNOWN"
        accuracyM <= 15.0 -> "GOOD"
        accuracyM <= 50.0 -> "FAIR"
        else -> "POOR"
    }

    private fun log(event: String) {
        logger?.d("OutdoorCapture", event)
    }

    companion object {
        const val OUTDOOR_ACTIVITY_TYPE = "outdoor.activity.complete"
        const val OUTDOOR_XP_TYPE = "outdoor.xp.award"
    }
}
