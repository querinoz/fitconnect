package com.fitconnect.shared.wearable

import com.fitconnect.shared.source.DataSourceKind
import com.fitconnect.shared.telemetry.MetricAvailability

enum class WearableProviderKind {
    WATCH,
    PHONE,
    HEALTH_CONNECT,
    EXTERNAL_DEVICE,
    GARMIN,
    WHOOP,
    OURA,
    STRAVA,
    XIAOMI,
    POLAR,
    COROS,
}

enum class IntegrationStatus {
    READY,
    LOCAL_DEMO,
    PENDING_HUMAN,
    BLOCKED_EXTERNAL_DEPENDENCY,
    UNAVAILABLE,
}

data class WearableSourceStatus(
    val provider: WearableProviderKind,
    val availability: MetricAvailability,
    val integration: IntegrationStatus,
    val sourceKind: DataSourceKind,
    val note: String,
)

/**
 * Domain-facing wearable source. Official vendor APIs are not invented.
 * Garmin / WHOOP / Oura remain [IntegrationStatus.PENDING_HUMAN] until credentials exist.
 */
interface WearableDataSource {
    val provider: WearableProviderKind
    fun status(): WearableSourceStatus
}

class WatchWearableDataSource(
    private val companionConnected: Boolean,
) : WearableDataSource {
    override val provider: WearableProviderKind = WearableProviderKind.WATCH
    override fun status(): WearableSourceStatus = WearableSourceStatus(
        provider = provider,
        availability = if (companionConnected) MetricAvailability.AVAILABLE else MetricAvailability.UNAVAILABLE,
        integration = if (companionConnected) IntegrationStatus.READY else IntegrationStatus.UNAVAILABLE,
        sourceKind = DataSourceKind.LOCAL_DEMO,
        note = if (companionConnected) {
            "FitConnect Wear node reachable — sensor metrics still depend on Health Services"
        } else {
            "No FitConnect Wear capability — not CONNECTED"
        },
    )
}

class HealthConnectWearableDataSource(
    private val sdkAvailable: Boolean,
    private val permissionGranted: Boolean,
) : WearableDataSource {
    override val provider: WearableProviderKind = WearableProviderKind.HEALTH_CONNECT
    override fun status(): WearableSourceStatus {
        val availability = when {
            !sdkAvailable -> MetricAvailability.UNAVAILABLE
            !permissionGranted -> MetricAvailability.PERMISSION_DENIED
            else -> MetricAvailability.AVAILABLE
        }
        return WearableSourceStatus(
            provider = provider,
            availability = availability,
            integration = if (sdkAvailable) IntegrationStatus.READY else IntegrationStatus.UNAVAILABLE,
            sourceKind = DataSourceKind.HEALTH_CONNECT,
            note = "Historical interoperability only — not live Wear HR",
        )
    }
}

class PendingHumanDataSource(
    override val provider: WearableProviderKind,
) : WearableDataSource {
    override fun status(): WearableSourceStatus = WearableSourceStatus(
        provider = provider,
        availability = MetricAvailability.UNAVAILABLE,
        integration = IntegrationStatus.PENDING_HUMAN,
        sourceKind = DataSourceKind.LOCAL_DEMO,
        note = "Official API credentials unavailable — no fake production integration",
    )
}

object ExternalProviderCatalog {
    val garmin: WearableDataSource = PendingHumanDataSource(WearableProviderKind.GARMIN)
    val whoop: WearableDataSource = PendingHumanDataSource(WearableProviderKind.WHOOP)
    val oura: WearableDataSource = PendingHumanDataSource(WearableProviderKind.OURA)
    val polar: WearableDataSource = PendingHumanDataSource(WearableProviderKind.POLAR)
    val coros: WearableDataSource = PendingHumanDataSource(WearableProviderKind.COROS)
    val xiaomi: WearableDataSource = object : WearableDataSource {
        override val provider = WearableProviderKind.XIAOMI
        override fun status() = WearableSourceStatus(
            provider = provider,
            availability = MetricAvailability.UNSUPPORTED,
            integration = IntegrationStatus.BLOCKED_EXTERNAL_DEPENDENCY,
            sourceKind = DataSourceKind.LOCAL_DEMO,
            note = "Xiaomi HyperOS is not Wear OS — BLE reverse-engineering is forbidden",
        )
    }
}
