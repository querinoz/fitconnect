package com.fitconnect.android.telemetry.provider

import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.telemetry.capability.ProviderCapabilities
import com.fitconnect.android.telemetry.domain.MetricType
import com.fitconnect.android.telemetry.domain.ProviderId
import com.fitconnect.android.telemetry.domain.TelemetrySample
import com.fitconnect.android.telemetry.domain.WorkoutSession
import com.fitconnect.android.telemetry.time.TimeRange

enum class ProviderConnectionState {
    AVAILABLE,
    UNAVAILABLE,
    CONNECTED,
    DISCONNECTED,
    PERMISSION_REQUIRED,
    PERMISSION_DENIED,
    AUTH_EXPIRED,
    ERROR,
}

enum class ProviderFailure {
    UNAVAILABLE_API,
    EXPIRED_TOKEN,
    PERMISSION_REVOKED,
    DEVICE_DISCONNECTED,
    RATE_LIMIT,
    NETWORK,
    MALFORMED_DATA,
    PARTIAL_RESPONSE,
    OUTAGE,
    UNSUPPORTED_METRIC,
}

class ProviderException(val failure: ProviderFailure, message: String) : Exception(message)

/** One page of provider data. Cursor null means the sync window is exhausted. */
data class ProviderPage(
    val samples: List<TelemetrySample>,
    val workouts: List<WorkoutSession>,
    val nextCursor: String?,
)

/**
 * The single contract every provider implements. Nothing outside this package
 * (and the sync engine) touches provider-specific behavior.
 */
interface TelemetryProvider {
    val id: ProviderId
    val displayName: String
    fun capabilities(): ProviderCapabilities
    suspend fun connectionState(): ProviderConnectionState
    suspend fun connect(): AppResult<Unit>
    suspend fun disconnect(): AppResult<Unit>

    /**
     * Reads a page of raw provider data mapped to canonical models.
     * Implementations must throw [ProviderException] for provider failures so
     * the sync engine can classify and retry.
     */
    suspend fun read(
        athleteId: String,
        metrics: Set<MetricType>,
        range: TimeRange,
        cursor: String?,
        pageSize: Int,
    ): ProviderPage
}

/**
 * Deterministic simulated provider used until vendor SDK credentials exist.
 * Generates stable, reproducible samples so sync/dedup/aggregation paths are
 * fully exercisable offline. Real adapters replace [SimulatedProviderSource].
 */
abstract class BaseSimulatedProvider(
    override val id: ProviderId,
    override val displayName: String,
    private val source: SimulatedProviderSource,
) : TelemetryProvider {

    private var state = ProviderConnectionState.AVAILABLE

    override suspend fun connectionState(): ProviderConnectionState = state

    override suspend fun connect(): AppResult<Unit> {
        state = ProviderConnectionState.CONNECTED
        return AppResult.Ok(Unit)
    }

    override suspend fun disconnect(): AppResult<Unit> {
        state = ProviderConnectionState.DISCONNECTED
        return AppResult.Ok(Unit)
    }

    override suspend fun read(
        athleteId: String,
        metrics: Set<MetricType>,
        range: TimeRange,
        cursor: String?,
        pageSize: Int,
    ): ProviderPage {
        if (state != ProviderConnectionState.CONNECTED) {
            throw ProviderException(ProviderFailure.PERMISSION_REVOKED, "$displayName not connected")
        }
        val supported = metrics.filter { capabilities().canRead(it) }.toSet()
        return source.page(id, athleteId, supported, range, cursor, pageSize)
    }
}

class UnsupportedProvider(
    override val id: ProviderId,
    override val displayName: String,
    private val caps: ProviderCapabilities,
) : TelemetryProvider {
    override fun capabilities(): ProviderCapabilities = caps
    override suspend fun connectionState(): ProviderConnectionState = ProviderConnectionState.UNAVAILABLE
    override suspend fun connect(): AppResult<Unit> =
        AppResult.Err(AppError.Unexpected("$displayName SDK is not configured in this build"))
    override suspend fun disconnect(): AppResult<Unit> = AppResult.Ok(Unit)
    override suspend fun read(
        athleteId: String,
        metrics: Set<MetricType>,
        range: TimeRange,
        cursor: String?,
        pageSize: Int,
    ): ProviderPage = throw ProviderException(ProviderFailure.UNAVAILABLE_API, "$displayName unavailable")
}
