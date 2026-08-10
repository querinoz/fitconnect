package com.fitconnect.android.sports.integration

import com.fitconnect.android.sports.competition.CompetitionEngine
import com.fitconnect.android.sports.domain.SportDefinition
import com.fitconnect.android.sports.domain.SportId
import com.fitconnect.android.sports.exercise.ExerciseEngine
import com.fitconnect.android.sports.goals.GoalEngine
import com.fitconnect.android.sports.performance.PerformanceEngine
import com.fitconnect.android.sports.performance.PerformanceSnapshot
import com.fitconnect.android.sports.performance.ReadinessInputs
import com.fitconnect.android.sports.performance.LoadSeries
import com.fitconnect.android.sports.registry.SportsRegistry
import com.fitconnect.android.sports.workout.WorkoutEngine

data class AthleteSportsProfile(
    val athleteId: String,
    val primarySport: SportId,
    val secondarySports: List<SportId>,
    val seasonLabel: String?,
    val personalRecords: Map<String, Double>,
    val achievements: List<String>,
)

data class CoachSportSurface(
    val sport: SportDefinition,
    val recommendations: List<String>,
    val programTemplates: List<String>,
    val exerciseIds: List<String>,
    val riskAlerts: List<String>,
    val performanceSummary: String,
)

interface AthleteSportsFacade {
    fun profile(athleteId: String): AthleteSportsProfile
    fun upsert(profile: AthleteSportsProfile): AthleteSportsProfile
    fun competitionCalendar(athleteId: String): List<String>
    fun metricsKeys(athleteId: String): Set<String>
    fun performance(athleteId: String, inputs: ReadinessInputs, loads: LoadSeries): PerformanceSnapshot
}

interface CoachSportsFacade {
    fun surface(sportId: SportId): CoachSportSurface
    fun allSurfaces(): List<CoachSportSurface>
}

class DefaultAthleteSportsFacade(
    private val registry: SportsRegistry,
    private val goals: GoalEngine,
    private val competitions: CompetitionEngine,
    private val performance: PerformanceEngine,
) : AthleteSportsFacade {
    private var profiles = mutableMapOf(
        "ath-1" to AthleteSportsProfile(
            athleteId = "ath-1",
            primarySport = SportId.RUNNING,
            secondarySports = listOf(SportId.CYCLING, SportId.GYM),
            seasonLabel = "2026 Base → Build",
            personalRecords = mapOf("5k_sec" to 1180.0, "ftp_w" to 265.0),
            achievements = listOf("7-day streak", "First threshold block"),
        ),
    )

    override fun profile(athleteId: String): AthleteSportsProfile =
        profiles[athleteId] ?: AthleteSportsProfile(
            athleteId = athleteId,
            primarySport = SportId.OTHER,
            secondarySports = emptyList(),
            seasonLabel = null,
            personalRecords = emptyMap(),
            achievements = emptyList(),
        )

    override fun upsert(profile: AthleteSportsProfile): AthleteSportsProfile {
        profiles[profile.athleteId] = profile
        return profile
    }

    override fun competitionCalendar(athleteId: String): List<String> {
        val p = profile(athleteId)
        val sports = listOf(p.primarySport) + p.secondarySports
        return competitions.upcoming().filter { it.sportId in sports }.map { "${it.title} · ${it.type}" }
    }

    override fun metricsKeys(athleteId: String): Set<String> {
        val p = profile(athleteId)
        return (listOf(p.primarySport) + p.secondarySports)
            .flatMap { registry.require(it).allMetrics().map { m -> m.key } }
            .toSet()
    }

    override fun performance(
        athleteId: String,
        inputs: ReadinessInputs,
        loads: LoadSeries,
    ): PerformanceSnapshot {
        val p = profile(athleteId)
        return performance.snapshot(p.primarySport, loads, inputs, goals.forSport(p.primarySport))
    }
}

class DefaultCoachSportsFacade(
    private val registry: SportsRegistry,
    private val exercises: ExerciseEngine,
    private val workouts: WorkoutEngine,
    private val performance: PerformanceEngine,
) : CoachSportsFacade {
    override fun surface(sportId: SportId): CoachSportSurface {
        val sport = registry.require(sportId)
        val snap = performance.snapshot(
            sportId,
            LoadSeries(listOf(40.0, 55.0, 50.0, 70.0, 45.0, 60.0, 65.0)),
            ReadinessInputs(hrvMs = 55, sleepQuality = 70, restingHrBpm = 52, subjective = 68, acuteLoad = 60.0, chronicLoad = 50.0),
        )
        return CoachSportSurface(
            sport = sport,
            recommendations = snap.recommendations,
            programTemplates = workouts.templates(sportId).map { it.title },
            exerciseIds = exercises.bySport(sportId).map { it.meta.id },
            riskAlerts = sport.riskIndicators.map { "${sport.displayName}: $it" } +
                listOfNotNull(if (snap.risk != "low") "Load risk ${snap.risk}" else null),
            performanceSummary = "Readiness ${snap.readiness} · trend ${snap.trend} · ACWR-aware",
        )
    }

    override fun allSurfaces(): List<CoachSportSurface> = registry.all().map { surface(it.id) }
}
