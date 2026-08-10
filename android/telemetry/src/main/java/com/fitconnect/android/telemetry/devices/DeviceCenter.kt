package com.fitconnect.android.telemetry.devices

import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.telemetry.capability.CapabilityRegistry
import com.fitconnect.android.telemetry.domain.MetricType
import com.fitconnect.android.telemetry.domain.ProviderId
import com.fitconnect.android.telemetry.privacy.TelemetryPrivacyManager
import com.fitconnect.android.telemetry.provider.ProviderConnectionState
import com.fitconnect.android.telemetry.provider.TelemetryProvider
import com.fitconnect.android.telemetry.sync.SyncReport
import com.fitconnect.android.telemetry.sync.TelemetrySyncEngine
import com.fitconnect.android.telemetry.time.TelemetryClock
import com.fitconnect.android.telemetry.time.TelemetryInstant
import com.fitconnect.android.telemetry.time.TimeRange

data class DeviceEntry(
    val provider: ProviderId,
    val displayName: String,
    val state: ProviderConnectionState,
    val lastSyncAt: TelemetryInstant?,
    val readableMetricCount: Int,
    val supportsWorkoutImport: Boolean,
)

/**
 * Reusable connection UX backbone. UI screens (athlete Device Center, future
 * onboarding flows) only ever see [DeviceEntry] + connect/disconnect/sync —
 * never provider SDKs or provider-specific states.
 */
class DeviceCenter(
    private val providers: Map<ProviderId, TelemetryProvider>,
    private val capabilities: CapabilityRegistry,
    private val syncEngine: TelemetrySyncEngine,
    private val privacy: TelemetryPrivacyManager,
    private val clock: TelemetryClock,
) {
    suspend fun devices(athleteId: String): List<DeviceEntry> =
        providers.values.map { provider ->
            val caps = capabilities.of(provider.id)
            DeviceEntry(
                provider = provider.id,
                displayName = provider.displayName,
                state = provider.connectionState(),
                lastSyncAt = syncEngine.states.value[provider.id]?.lastSyncAt,
                readableMetricCount = caps?.readableMetrics?.size ?: 0,
                supportsWorkoutImport = caps?.supportsWorkoutImport == true,
            )
        }

    suspend fun connect(athleteId: String, provider: ProviderId): AppResult<Unit> {
        val target = providers[provider]
            ?: return AppResult.Err(AppError.Unexpected("Unknown provider ${provider.name}"))
        return when (val result = target.connect()) {
            is AppResult.Ok -> {
                privacy.grantProviderConsent(athleteId, provider)
                AppResult.Ok(Unit)
            }
            is AppResult.Err -> result
        }
    }

    suspend fun disconnect(athleteId: String, provider: ProviderId): AppResult<Unit> {
        val target = providers[provider]
            ?: return AppResult.Err(AppError.Unexpected("Unknown provider ${provider.name}"))
        privacy.revokeProviderConsent(athleteId, provider)
        return target.disconnect()
    }

    /** Incremental sync from the last checkpoint (or [historyDays] back on first sync). */
    suspend fun syncNow(athleteId: String, provider: ProviderId, historyDays: Int = 14): AppResult<SyncReport> {
        val target = providers[provider]
            ?: return AppResult.Err(AppError.Unexpected("Unknown provider ${provider.name}"))
        if (!privacy.hasProviderConsent(athleteId, provider)) {
            return AppResult.Err(AppError.Unexpected("No consent for ${provider.name}"))
        }
        val caps = target.capabilities()
        val now = TelemetryInstant.now(clock)
        val checkpoint = syncEngine.checkpoint(provider, athleteId)
        val start = checkpoint?.lastSyncedEpochMs?.let { TelemetryInstant.utc(it - OVERLAP_MS) }
            ?: now.plusMs(-historyDays * DAY_MS)
        val report = syncEngine.sync(
            provider = target,
            athleteId = athleteId,
            metrics = caps.readableMetrics,
            range = TimeRange(start, now),
        )
        return AppResult.Ok(report)
    }

    suspend fun syncAllConnected(athleteId: String): List<SyncReport> =
        providers.values
            .filter { it.connectionState() == ProviderConnectionState.CONNECTED }
            .mapNotNull { provider ->
                when (val r = syncNow(athleteId, provider.id)) {
                    is AppResult.Ok -> r.value
                    is AppResult.Err -> null
                }
            }

    fun capabilitiesOf(provider: ProviderId) = capabilities.of(provider)

    fun providersFor(metric: MetricType): List<ProviderId> = capabilities.providersFor(metric)

    private companion object {
        const val DAY_MS = 86_400_000L
        // Re-read a small window before the checkpoint; idempotent upserts absorb it.
        const val OVERLAP_MS = 6 * 3_600_000L
    }
}
