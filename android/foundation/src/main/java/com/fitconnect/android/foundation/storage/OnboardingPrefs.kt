package com.fitconnect.android.foundation.storage

import com.fitconnect.android.foundation.common.AppResult

/** Onboarding preference helpers — keep PreferenceKeys off the app classpath. */
suspend fun KeyValueStore.isOnboardingDone(): Boolean =
    get(PreferenceKeys.ONBOARDING_DONE) == "1"

suspend fun KeyValueStore.markOnboardingDone(): AppResult<Unit> =
    set(PreferenceKeys.ONBOARDING_DONE, "1")

suspend fun KeyValueStore.athleteOnboardingStep(): Int =
    get(PreferenceKeys.ONBOARDING_ATHLETE_STEP)?.toIntOrNull()?.coerceIn(0, 5) ?: 0

suspend fun KeyValueStore.setAthleteOnboardingStep(step: Int): AppResult<Unit> =
    set(PreferenceKeys.ONBOARDING_ATHLETE_STEP, step.coerceIn(0, 5).toString())

suspend fun KeyValueStore.athleteOnboardingSport(): String =
    get(PreferenceKeys.ONBOARDING_ATHLETE_SPORT) ?: "Running"

suspend fun KeyValueStore.setAthleteOnboardingSport(sport: String): AppResult<Unit> =
    set(PreferenceKeys.ONBOARDING_ATHLETE_SPORT, sport)

suspend fun KeyValueStore.athleteOnboardingGoal(): String =
    get(PreferenceKeys.ONBOARDING_ATHLETE_GOAL) ?: "Build consistency"

suspend fun KeyValueStore.setAthleteOnboardingGoal(goal: String): AppResult<Unit> =
    set(PreferenceKeys.ONBOARDING_ATHLETE_GOAL, goal)

suspend fun KeyValueStore.isCoachOnboardingDone(): Boolean =
    get(PreferenceKeys.ONBOARDING_COACH_DONE) == "1"

suspend fun KeyValueStore.markCoachOnboardingDone(): AppResult<Unit> =
    set(PreferenceKeys.ONBOARDING_COACH_DONE, "1")

suspend fun KeyValueStore.coachOnboardingStep(): Int =
    get(PreferenceKeys.ONBOARDING_COACH_STEP)?.toIntOrNull()?.coerceIn(0, 5) ?: 0

suspend fun KeyValueStore.setCoachOnboardingStep(step: Int): AppResult<Unit> =
    set(PreferenceKeys.ONBOARDING_COACH_STEP, step.coerceIn(0, 5).toString())
