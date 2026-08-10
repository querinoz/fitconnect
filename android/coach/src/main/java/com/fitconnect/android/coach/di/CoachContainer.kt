package com.fitconnect.android.coach.di

import com.fitconnect.android.ai.di.AiContainer
import com.fitconnect.android.coach.ai.CoachAiPort
import com.fitconnect.android.coach.ai.EngineCoachAiPort
import com.fitconnect.android.coach.data.CoachRepository
import com.fitconnect.android.coach.data.LocalCoachRepository
import com.fitconnect.android.coach.files.CoachFileStore
import com.fitconnect.android.coach.files.LocalCoachFileStore
import com.fitconnect.android.coach.payments.ArchitectureCoachPaymentsGateway
import com.fitconnect.android.coach.payments.CoachPaymentsGateway
import com.fitconnect.android.foundation.di.AppContainer
import com.fitconnect.android.geo.di.GeoContainer
import com.fitconnect.android.sports.di.SportsContainer
import com.fitconnect.android.sports.integration.CoachSportsFacade
import com.fitconnect.android.telemetry.di.TelemetryContainer
import com.fitconnect.android.telemetry.integration.CoachTelemetryFacade

interface CoachContainer {
    val platform: AppContainer
    val sports: SportsContainer
    val geo: GeoContainer
    val telemetry: TelemetryContainer
    val aiEngine: AiContainer
    val coachSports: CoachSportsFacade
    val coachTelemetry: CoachTelemetryFacade
    val coachRepository: CoachRepository
    val payments: CoachPaymentsGateway
    val files: CoachFileStore
    val ai: CoachAiPort
}

class DefaultCoachContainer(
    override val platform: AppContainer,
    override val sports: SportsContainer,
    override val geo: GeoContainer,
    override val telemetry: TelemetryContainer,
    override val aiEngine: AiContainer,
) : CoachContainer {
    override val coachSports: CoachSportsFacade = sports.coachFacade
    override val coachTelemetry: CoachTelemetryFacade = telemetry.coachFacade
    override val coachRepository: CoachRepository = LocalCoachRepository(
        connectivity = platform.connectivity,
        offline = platform.offline,
        booking = geo.booking,
        availability = geo.availability,
    )
    override val payments: CoachPaymentsGateway = ArchitectureCoachPaymentsGateway()
    override val files: CoachFileStore = LocalCoachFileStore()
    override val ai: CoachAiPort = EngineCoachAiPort(aiEngine.engine)
}
