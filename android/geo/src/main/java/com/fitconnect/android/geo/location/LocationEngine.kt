package com.fitconnect.android.geo.location

import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.geo.domain.EnvironmentContext
import com.fitconnect.android.geo.domain.GeoPoint
import com.fitconnect.android.geo.domain.LocationAccuracy
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.concurrent.CopyOnWriteArrayList

data class LocationFix(
    val point: GeoPoint,
    val accuracy: LocationAccuracy,
    val environment: EnvironmentContext,
    val recordedAtEpochMs: Long,
    val mocked: Boolean = false,
)

enum class LocationPermissionState {
    GRANTED,
    DENIED,
    NEEDS_RECOVERY,
    UNKNOWN,
}

/**
 * Centralized location engine — current/last known, foreground/background
 * update contracts, history, mock (dev), permission recovery.
 */
interface LocationEngine {
    val current: StateFlow<LocationFix?>
    val permission: StateFlow<LocationPermissionState>
    fun lastKnown(): LocationFix?
    fun history(): List<LocationFix>
    suspend fun requestForegroundUpdates(accuracy: LocationAccuracy): AppResult<Unit>
    suspend fun requestBackgroundUpdates(accuracy: LocationAccuracy): AppResult<Unit>
    suspend fun stopUpdates()
    fun setMockLocation(point: GeoPoint, accuracy: LocationAccuracy = LocationAccuracy.HIGH)
    fun clearMock()
    fun reportPermission(state: LocationPermissionState)
    fun permissionRecoveryHint(): String
}

class DefaultLocationEngine(
    private val allowMock: Boolean = true,
) : LocationEngine {
    private val _current = MutableStateFlow<LocationFix?>(null)
    private val _permission = MutableStateFlow(LocationPermissionState.UNKNOWN)
    private val history = CopyOnWriteArrayList<LocationFix>()
    private var mockActive = false
    private var foreground = false
    private var background = false

    override val current: StateFlow<LocationFix?> = _current.asStateFlow()
    override val permission: StateFlow<LocationPermissionState> = _permission.asStateFlow()

    override fun lastKnown(): LocationFix? = _current.value ?: history.lastOrNull()

    override fun history(): List<LocationFix> = history.toList()

    override suspend fun requestForegroundUpdates(accuracy: LocationAccuracy): AppResult<Unit> {
        if (_permission.value == LocationPermissionState.DENIED ||
            _permission.value == LocationPermissionState.NEEDS_RECOVERY
        ) {
            return AppResult.Err(AppError.Unexpected("Location permission recovery required"))
        }
        foreground = true
        if (!mockActive && _current.value == null) {
            // Provider binding lands with platform LocationServices — seed via mock in debug catalogs only.
            return AppResult.Ok(Unit)
        }
        return AppResult.Ok(Unit)
    }

    override suspend fun requestBackgroundUpdates(accuracy: LocationAccuracy): AppResult<Unit> {
        if (_permission.value != LocationPermissionState.GRANTED) {
            return AppResult.Err(AppError.Unexpected("Background location requires granted permission"))
        }
        background = true
        return AppResult.Ok(Unit)
    }

    override suspend fun stopUpdates() {
        foreground = false
        background = false
    }

    override fun setMockLocation(point: GeoPoint, accuracy: LocationAccuracy) {
        check(allowMock) { "Mock locations disabled" }
        mockActive = true
        val fix = LocationFix(
            point = point,
            accuracy = accuracy,
            environment = EnvironmentContext.OUTDOOR,
            recordedAtEpochMs = System.currentTimeMillis(),
            mocked = true,
        )
        _current.value = fix
        history.add(fix)
    }

    override fun clearMock() {
        mockActive = false
    }

    override fun reportPermission(state: LocationPermissionState) {
        _permission.value = state
    }

    override fun permissionRecoveryHint(): String =
        "Open system settings → FitConnect → Location → Allow while using the app (and background if needed)."

    fun isForegroundActive(): Boolean = foreground
    fun isBackgroundActive(): Boolean = background
}
