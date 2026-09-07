package com.fitconnect.android.athlete.di

import android.content.pm.ApplicationInfo
import com.fitconnect.android.ai.di.AiContainer
import com.fitconnect.android.athlete.data.AthleteRepository
import com.fitconnect.android.athlete.data.HttpAthleteRepository
import com.fitconnect.android.athlete.data.LocalAthleteRepository
import com.fitconnect.android.community.di.CommunityContainer
import com.fitconnect.android.community.di.DefaultCommunityContainer
import com.fitconnect.android.capture.LiveActivityEngine
import com.fitconnect.android.capture.LiveSessionCoordinator
import com.fitconnect.android.capture.runtime.OutdoorCaptureRuntime
import com.fitconnect.android.capture.store.GpsRouteStore
import com.fitconnect.android.capture.route.CanonicalRouteRepository
import com.fitconnect.ascend.demo.AscendDemo
import com.fitconnect.ascend.engine.AscendEngine
import com.fitconnect.android.foundation.di.AppContainer
import com.fitconnect.android.geo.di.GeoContainer
import com.fitconnect.android.sports.di.SportsContainer
import com.fitconnect.android.sports.registry.SportsEngine
import com.fitconnect.android.sports.guided.runtime.GuidedWorkoutRuntime
import com.fitconnect.android.telemetry.di.TelemetryContainer

interface AthleteContainer {
    val platform: AppContainer
    val sports: SportsContainer
    val geo: GeoContainer
    val telemetry: TelemetryContainer
    val fitness: FitnessContainer
    val ai: AiContainer
    val community: CommunityContainer
    val sportsEngine: SportsEngine
    val athleteRepository: AthleteRepository
    val liveActivity: LiveActivityEngine
    val liveCoordinator: LiveSessionCoordinator
    val outdoorCapture: OutdoorCaptureRuntime
    val gpsRouteStore: GpsRouteStore
    val routeRepository: CanonicalRouteRepository
    val ascend: AscendEngine
    val guidedWorkout: GuidedWorkoutRuntime
}

class DefaultAthleteContainer(
    override val platform: AppContainer,
    override val sports: SportsContainer,
    override val geo: GeoContainer,
    override val telemetry: TelemetryContainer,
    override val ai: AiContainer,
    override val community: CommunityContainer = DefaultCommunityContainer(),
    override val fitness: FitnessContainer,
    override val ascend: AscendEngine = AscendEngine(
        demoLabeledUsers = setOf(
            LocalAthleteRepository.ATHLETE_ID,
            AscendDemo.INES,
            AscendDemo.MARINA,
            AscendDemo.TOMAS,
        ),
    ),
    override val guidedWorkout: GuidedWorkoutRuntime,
    override val gpsRouteStore: GpsRouteStore,
    appContext: android.content.Context,
) : AthleteContainer {
    override val sportsEngine: SportsEngine = sports.sportsEngine
    override val athleteRepository: AthleteRepository = HttpAthleteRepository(
        api = { platform.apiClient },
        sessionStore = platform.sessionStore,
        telemetry = telemetry.athleteFacade,
        localFallback = LocalAthleteRepository(
            connectivity = platform.connectivity,
            offline = platform.offline,
            sports = sports,
            geo = geo,
            telemetry = telemetry.athleteFacade,
        ),
    )
    private val debuggable =
        (appContext.applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE) != 0
    // Debug/emulator: allow simulated GPS fallback. Release: fused-only (never claim physical GPS).
    override val liveActivity: LiveActivityEngine = LiveActivityEngine(allowSimulatedGps = debuggable)
    override val liveCoordinator: LiveSessionCoordinator = LiveSessionCoordinator(liveActivity)
    override val outdoorCapture: OutdoorCaptureRuntime = OutdoorCaptureRuntime(
        appContext = appContext,
        engine = liveActivity,
        store = gpsRouteStore,
        offline = platform.offline,
        sessionStore = platform.sessionStore,
        logger = platform.logger,
    )
    override val routeRepository: CanonicalRouteRepository = CanonicalRouteRepository(gpsRouteStore)

    init {
        AscendDemo.seed(ascend, LocalAthleteRepository.ATHLETE_ID)
        AscendDemo.seed(ascend, AscendDemo.INES)
        AscendDemo.seed(ascend, AscendDemo.MARINA)
        AscendDemo.seed(ascend, AscendDemo.TOMAS)
    }
}
