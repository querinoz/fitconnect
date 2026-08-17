package com.fitconnect.android.athlete.di

import com.fitconnect.android.ai.di.AiContainer
import com.fitconnect.android.athlete.data.AthleteRepository
import com.fitconnect.android.athlete.data.LocalAthleteRepository
import com.fitconnect.android.community.di.CommunityContainer
import com.fitconnect.android.community.di.DefaultCommunityContainer
import com.fitconnect.android.capture.LiveActivityEngine
import com.fitconnect.android.capture.LiveSessionCoordinator
import com.fitconnect.ascend.demo.AscendDemo
import com.fitconnect.ascend.engine.AscendEngine
import com.fitconnect.android.foundation.di.AppContainer
import com.fitconnect.android.geo.di.GeoContainer
import com.fitconnect.android.sports.di.SportsContainer
import com.fitconnect.android.sports.registry.SportsEngine
import com.fitconnect.android.telemetry.di.TelemetryContainer

interface AthleteContainer {
    val platform: AppContainer
    val sports: SportsContainer
    val geo: GeoContainer
    val telemetry: TelemetryContainer
    val ai: AiContainer
    val community: CommunityContainer
    val sportsEngine: SportsEngine
    val athleteRepository: AthleteRepository
    val liveActivity: LiveActivityEngine
    val liveCoordinator: LiveSessionCoordinator
    val ascend: AscendEngine
}

class DefaultAthleteContainer(
    override val platform: AppContainer,
    override val sports: SportsContainer,
    override val geo: GeoContainer,
    override val telemetry: TelemetryContainer,
    override val ai: AiContainer,
    override val community: CommunityContainer = DefaultCommunityContainer(),
    override val ascend: AscendEngine = AscendEngine(
        demoLabeledUsers = setOf(
            LocalAthleteRepository.ATHLETE_ID,
            AscendDemo.INES,
            AscendDemo.MARINA,
            AscendDemo.TOMAS,
        ),
    ),
) : AthleteContainer {
    override val sportsEngine: SportsEngine = sports.sportsEngine
    override val athleteRepository: AthleteRepository = LocalAthleteRepository(
        connectivity = platform.connectivity,
        offline = platform.offline,
        sports = sports,
        geo = geo,
        telemetry = telemetry.athleteFacade,
    )
    override val liveActivity: LiveActivityEngine = LiveActivityEngine()
    override val liveCoordinator: LiveSessionCoordinator = LiveSessionCoordinator(liveActivity)

    init {
        AscendDemo.seed(ascend, LocalAthleteRepository.ATHLETE_ID)
        AscendDemo.seed(ascend, AscendDemo.INES)
        AscendDemo.seed(ascend, AscendDemo.MARINA)
        AscendDemo.seed(ascend, AscendDemo.TOMAS)
    }
}
