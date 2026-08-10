package com.fitconnect.android.sports.di

import com.fitconnect.android.sports.ai.ArchitectureSportsAiPort
import com.fitconnect.android.sports.ai.SportsAiPort
import com.fitconnect.android.sports.competition.CompetitionEngine
import com.fitconnect.android.sports.competition.DefaultCompetitionEngine
import com.fitconnect.android.sports.exercise.DefaultExerciseEngine
import com.fitconnect.android.sports.exercise.ExerciseEngine
import com.fitconnect.android.sports.goals.DefaultGoalEngine
import com.fitconnect.android.sports.goals.GoalEngine
import com.fitconnect.android.sports.integration.AthleteSportsFacade
import com.fitconnect.android.sports.integration.CoachSportsFacade
import com.fitconnect.android.sports.integration.DefaultAthleteSportsFacade
import com.fitconnect.android.sports.integration.DefaultCoachSportsFacade
import com.fitconnect.android.sports.metrics.DefaultMetricsEngine
import com.fitconnect.android.sports.metrics.MetricsEngine
import com.fitconnect.android.sports.performance.DefaultPerformanceEngine
import com.fitconnect.android.sports.performance.PerformanceEngine
import com.fitconnect.android.sports.registry.DefaultSportsCatalog
import com.fitconnect.android.sports.registry.DefaultSportsRegistry
import com.fitconnect.android.sports.registry.RegistrySportsEngine
import com.fitconnect.android.sports.registry.SportsEngine
import com.fitconnect.android.sports.registry.SportsRegistry
import com.fitconnect.android.sports.sync.InMemorySportsSyncPort
import com.fitconnect.android.sports.sync.JsonSportsImportExport
import com.fitconnect.android.sports.sync.SportsImportExport
import com.fitconnect.android.sports.sync.SportsSyncPort
import com.fitconnect.android.sports.workout.DefaultWorkoutEngine
import com.fitconnect.android.sports.workout.WorkoutEngine

interface SportsContainer {
    val registry: SportsRegistry
    val sportsEngine: SportsEngine
    val exercises: ExerciseEngine
    val workouts: WorkoutEngine
    val metrics: MetricsEngine
    val performance: PerformanceEngine
    val goals: GoalEngine
    val competitions: CompetitionEngine
    val athleteFacade: AthleteSportsFacade
    val coachFacade: CoachSportsFacade
    val sync: SportsSyncPort
    val importExport: SportsImportExport
    val ai: SportsAiPort
}

class DefaultSportsContainer : SportsContainer {
    override val registry: SportsRegistry = DefaultSportsRegistry().also { DefaultSportsCatalog.seed(it) }
    override val sportsEngine: SportsEngine = RegistrySportsEngine(registry)
    override val exercises: ExerciseEngine = DefaultExerciseEngine()
    override val workouts: WorkoutEngine = DefaultWorkoutEngine()
    override val metrics: MetricsEngine = DefaultMetricsEngine(registry)
    override val performance: PerformanceEngine = DefaultPerformanceEngine()
    override val goals: GoalEngine = DefaultGoalEngine()
    override val competitions: CompetitionEngine = DefaultCompetitionEngine()
    override val athleteFacade: AthleteSportsFacade = DefaultAthleteSportsFacade(registry, goals, competitions, performance)
    override val coachFacade: CoachSportsFacade = DefaultCoachSportsFacade(registry, exercises, workouts, performance)
    override val sync: SportsSyncPort = InMemorySportsSyncPort()
    override val importExport: SportsImportExport = JsonSportsImportExport()
    override val ai: SportsAiPort = ArchitectureSportsAiPort()
}
