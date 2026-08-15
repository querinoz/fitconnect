package com.fitconnect.android.telemetry.di

import com.fitconnect.android.foundation.network.ConnectivityMonitor
import com.fitconnect.android.telemetry.aggregate.AggregationEngine
import com.fitconnect.android.telemetry.capability.CapabilityRegistry
import com.fitconnect.android.telemetry.capability.DefaultCapabilityRegistry
import com.fitconnect.android.telemetry.devices.DeviceCenter
import com.fitconnect.android.telemetry.domain.ProviderId
import com.fitconnect.android.telemetry.integration.AthleteTelemetryFacade
import com.fitconnect.android.telemetry.integration.CoachTelemetryFacade
import com.fitconnect.android.telemetry.integration.SportsTelemetryBridge
import com.fitconnect.android.telemetry.observability.InMemoryTelemetryObservability
import com.fitconnect.android.telemetry.observability.TelemetryObservability
import com.fitconnect.android.telemetry.privacy.TelemetryPrivacyManager
import com.fitconnect.android.telemetry.provider.FitbitProvider
import com.fitconnect.android.telemetry.provider.GarminProvider
import com.fitconnect.android.telemetry.provider.HealthConnectProvider
import com.fitconnect.android.telemetry.provider.OuraProvider
import com.fitconnect.android.telemetry.provider.PolarProvider
import com.fitconnect.android.telemetry.provider.SamsungHealthProvider
import com.fitconnect.android.telemetry.provider.SimulatedProviderSource
import com.fitconnect.android.telemetry.provider.StravaProvider
import com.fitconnect.android.telemetry.provider.TelemetryProvider
import com.fitconnect.android.telemetry.provider.WhoopProvider
import com.fitconnect.android.telemetry.quality.DataQualityEngine
import com.fitconnect.android.telemetry.store.InMemoryTelemetryStore
import com.fitconnect.android.telemetry.store.TelemetryStore
import com.fitconnect.android.telemetry.sync.BackgroundSyncPolicy
import com.fitconnect.android.telemetry.sync.DeduplicationEngine
import com.fitconnect.android.telemetry.sync.TelemetrySyncEngine
import com.fitconnect.android.telemetry.time.SystemTelemetryClock
import com.fitconnect.android.telemetry.time.TelemetryClock
import com.fitconnect.android.telemetry.wear.InMemoryWearSessionLink
import com.fitconnect.android.telemetry.wear.NoWearCompanion
import com.fitconnect.android.telemetry.wear.WearSessionLink
import com.fitconnect.android.telemetry.wear.WearableCompanionPort

interface TelemetryContainer {
    val store: TelemetryStore
    val capabilities: CapabilityRegistry
    val providers: Map<ProviderId, TelemetryProvider>
    val syncEngine: TelemetrySyncEngine
    val deviceCenter: DeviceCenter
    val privacy: TelemetryPrivacyManager
    val observability: TelemetryObservability
    val aggregation: AggregationEngine
    val athleteFacade: AthleteTelemetryFacade
    val coachFacade: CoachTelemetryFacade
    val sportsBridge: SportsTelemetryBridge
    val backgroundPolicy: BackgroundSyncPolicy
    val wearCompanion: WearableCompanionPort
    val wearSessionLink: WearSessionLink
}

class DefaultTelemetryContainer(
    connectivity: ConnectivityMonitor,
    clock: TelemetryClock = SystemTelemetryClock,
) : TelemetryContainer {

    override val store: TelemetryStore = InMemoryTelemetryStore()
    override val observability: TelemetryObservability = InMemoryTelemetryObservability()
    override val capabilities: CapabilityRegistry = DefaultCapabilityRegistry()

    override val providers: Map<ProviderId, TelemetryProvider> = run {
        val source = SimulatedProviderSource(clock)
        listOf(
            HealthConnectProvider(source),
            GarminProvider(source),
            WhoopProvider(source),
            OuraProvider(source),
            FitbitProvider(source),
            PolarProvider(source),
            SamsungHealthProvider(source),
            StravaProvider(source),
        ).associateBy { it.id }
    }

    init {
        providers.values.forEach { capabilities.register(it.capabilities()) }
    }

    override val privacy: TelemetryPrivacyManager = TelemetryPrivacyManager(store, clock)

    override val syncEngine: TelemetrySyncEngine = TelemetrySyncEngine(
        store = store,
        quality = DataQualityEngine(clock),
        dedup = DeduplicationEngine(),
        connectivity = connectivity,
        observability = observability,
        clock = clock,
    )

    override val deviceCenter: DeviceCenter = DeviceCenter(providers, capabilities, syncEngine, privacy, clock)

    override val aggregation: AggregationEngine = AggregationEngine(store)

    override val athleteFacade: AthleteTelemetryFacade = AthleteTelemetryFacade(store, aggregation, clock)

    override val coachFacade: CoachTelemetryFacade = CoachTelemetryFacade(store, aggregation, privacy, clock)

    override val sportsBridge: SportsTelemetryBridge = SportsTelemetryBridge(store, clock)

    override val backgroundPolicy: BackgroundSyncPolicy = BackgroundSyncPolicy()

    override val wearCompanion: WearableCompanionPort = NoWearCompanion()
    override val wearSessionLink: WearSessionLink = InMemoryWearSessionLink()
}
