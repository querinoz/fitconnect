package com.fitconnect.android.sports

import com.fitconnect.android.sports.di.DefaultSportsContainer
import com.fitconnect.android.sports.domain.CompetitionType
import com.fitconnect.android.sports.domain.MetricDefinition
import com.fitconnect.android.sports.domain.MetricKind
import com.fitconnect.android.sports.domain.MetricValueType
import com.fitconnect.android.sports.domain.SportCategory
import com.fitconnect.android.sports.domain.SportDefinition
import com.fitconnect.android.sports.domain.SportId
import com.fitconnect.android.sports.exercise.ExerciseCategory
import com.fitconnect.android.sports.goals.GoalKind
import com.fitconnect.android.sports.metrics.MetricSample
import com.fitconnect.android.sports.performance.LoadSeries
import com.fitconnect.android.sports.performance.ReadinessInputs
import com.fitconnect.android.sports.registry.DefaultSportsRegistry
import com.fitconnect.android.sports.registry.RegistryValidation
import com.fitconnect.android.sports.sync.JsonSportsImportExport
import com.fitconnect.android.sports.workout.WorkoutStructure
import com.fitconnect.android.sports.workout.WorkoutStep
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class SportsIntelligenceTest {
    private val sports = DefaultSportsContainer()

    @Test
    fun catalogSeedsMultipleSportsWithoutHardcodedEnumLimit() {
        val all = sports.registry.all()
        assertTrue(all.size >= 13)
        assertTrue(all.any { it.id == SportId.RUNNING })
        assertTrue(all.any { it.id == SportId.of("yoga") })
        assertTrue(all.any { it.id == SportId.of("rowing") })
    }

    @Test
    fun registerFutureSportWithoutCoreChange() {
        val id = SportId.of("climbing")
        val result = sports.registry.register(
            SportDefinition(
                id = id,
                displayName = "Climbing",
                category = SportCategory.OTHER,
                olympicStatus = com.fitconnect.android.sports.domain.OlympicStatus.NON_OLYMPIC,
                environment = com.fitconnect.android.sports.domain.EnvironmentKind.BOTH,
                participation = com.fitconnect.android.sports.domain.ParticipationKind.INDIVIDUAL,
                seasonality = com.fitconnect.android.sports.domain.Seasonality.YEAR_ROUND,
                skillLevels = setOf(com.fitconnect.android.sports.domain.SkillLevel.ALL),
                requiredMetrics = listOf(
                    MetricDefinition("grade", "Grade", "", MetricKind.REQUIRED, MetricValueType.TEXT),
                ),
            ),
            pluginId = "test.plugin",
        )
        assertEquals(RegistryValidation.Ok, result)
        assertEquals("Climbing", sports.registry.require(id).displayName)
    }

    @Test
    fun runningMetricsIncludePaceCadenceVo2() {
        val keys = sports.metrics.keys(SportId.RUNNING)
        assertTrue(keys.containsAll(setOf("pace", "cadence", "vo2max", "gct")))
    }

    @Test
    fun customMetricRegistrationIsUnlimited() {
        sports.metrics.registerCustomMetric(
            SportId.RUNNING,
            MetricDefinition("stride_length", "Stride length", "m", MetricKind.OPTIONAL),
        )
        assertTrue(sports.metrics.keys(SportId.RUNNING).contains("stride_length"))
        sports.metrics.record(MetricSample(SportId.RUNNING, "stride_length", 1.25))
        assertEquals(1.25, sports.metrics.latest(SportId.RUNNING, "stride_length")!!.value, 0.001)
    }

    @Test
    fun exerciseLibraryCoversCoreCategories() {
        val cats = sports.exercises.all().map { it.category }.toSet()
        assertTrue(cats.contains(ExerciseCategory.STRENGTH))
        assertTrue(cats.contains(ExerciseCategory.WARM_UP))
        assertTrue(cats.contains(ExerciseCategory.PLYOMETRICS))
        assertTrue(sports.exercises.bySport(SportId.RUNNING).isNotEmpty())
    }

    @Test
    fun workoutEngineSupportsStructures() {
        val templates = sports.workouts.templates()
        assertTrue(templates.any { it.structure == WorkoutStructure.INTERVALS })
        assertTrue(templates.any { it.structure == WorkoutStructure.EMOM })
        assertTrue(templates.any { it.structure == WorkoutStructure.AMRAP })
        assertTrue(templates.any { it.structure == WorkoutStructure.TABATA })
        val built = sports.workouts.build(
            title = "Custom circuit",
            sportId = SportId.GYM,
            structure = WorkoutStructure.CIRCUIT,
            steps = listOf(WorkoutStep("Squat", "ex_squat", "8 reps", reps = 8)),
        )
        assertEquals(WorkoutStructure.CIRCUIT, built.structure)
    }

    @Test
    fun performanceEngineComputesReadinessAndLoads() {
        val loads = LoadSeries((1..28).map { 40.0 + it })
        val snap = sports.performance.snapshot(
            SportId.RUNNING,
            loads,
            ReadinessInputs(64, 86, 48, 80, 0.0, 0.0),
            sports.goals.forSport(SportId.RUNNING),
        )
        assertTrue(snap.readiness in 1..100)
        assertTrue(snap.acuteLoad > 0)
        assertTrue(snap.chronicLoad > 0)
        assertTrue(snap.recommendations.isNotEmpty())
    }

    @Test
    fun goalEngineInfluencesRecommendations() {
        sports.goals.create("Cut phase", GoalKind.WEIGHT_LOSS, SportId.GYM)
        val snap = sports.performance.snapshot(
            SportId.GYM,
            LoadSeries(listOf(30.0, 35.0, 40.0)),
            ReadinessInputs(50, 70, 55, 65, 0.0, 0.0),
            sports.goals.forSport(SportId.GYM),
        )
        assertTrue(snap.recommendations.any { it.contains("Cut phase") || it.contains("Zone 2") || it.contains("lifting") })
    }

    @Test
    fun competitionEngineSupportsEventsAndVirtual() {
        assertTrue(sports.competitions.all().isNotEmpty())
        val created = sports.competitions.create(
            title = "Club match",
            sportId = SportId.FOOTBALL,
            type = CompetitionType.MATCH,
            startEpochMs = System.currentTimeMillis() + 86_400_000,
            endEpochMs = System.currentTimeMillis() + 90_000_000,
        )
        assertEquals(CompetitionType.MATCH, created.type)
        assertTrue(sports.competitions.upcoming().any { it.meta.id == created.meta.id })
    }

    @Test
    fun coachAndAthleteFacadesExposeSurfaces() {
        val coach = sports.coachFacade.surface(SportId.CYCLING)
        assertEquals("Cycling", coach.sport.displayName)
        assertTrue(coach.riskAlerts.isNotEmpty() || coach.recommendations.isNotEmpty())
        val athlete = sports.athleteFacade.profile("ath-1")
        assertEquals(SportId.RUNNING, athlete.primarySport)
        assertTrue(sports.athleteFacade.metricsKeys("ath-1").contains("pace"))
    }

    @Test
    fun importExportAndDeprecation() {
        val json = sports.registry.snapshotJson()
        val bundle = sports.importExport.exportRegistrySnapshot(json)
        assertTrue(sports.importExport.importRegistrySnapshot(bundle).isSuccess)
        assertTrue(sports.registry.deprecate(SportId.of("yoga")))
        assertFalse(sports.registry.all(includeDeprecated = false).any { it.id == SportId.of("yoga") })
    }

    @Test
    fun emptyRegistryValidationFailsBlankName() = runBlocking {
        val reg = DefaultSportsRegistry()
        val bad = SportDefinition(
            id = SportId.of("x"),
            displayName = " ",
            category = SportCategory.OTHER,
            olympicStatus = com.fitconnect.android.sports.domain.OlympicStatus.NON_OLYMPIC,
            environment = com.fitconnect.android.sports.domain.EnvironmentKind.BOTH,
            participation = com.fitconnect.android.sports.domain.ParticipationKind.INDIVIDUAL,
            seasonality = com.fitconnect.android.sports.domain.Seasonality.YEAR_ROUND,
            skillLevels = emptySet(),
        )
        assertTrue(reg.register(bad) is RegistryValidation.Err)
    }

    @Test
    fun syncPortEnqueues() = runBlocking {
        val goal = sports.goals.all().first()
        sports.sync.enqueue(goal)
        assertTrue((sports.sync as com.fitconnect.android.sports.sync.InMemorySportsSyncPort).pendingCount() >= 1)
        assertTrue(sports.sync.flush() >= 1)
    }
}
