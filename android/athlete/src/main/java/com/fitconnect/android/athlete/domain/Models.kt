package com.fitconnect.android.athlete.domain

import com.fitconnect.android.sports.domain.SportId

data class AthleteProfile(
    val id: String,
    val displayName: String,
    val sports: List<SportId>,
    val goals: List<String>,
    val medicalNotes: String?,
    val emergencyContact: String?,
    val localeTag: String,
    val subscriptionTier: String,
)

data class DailyReadiness(
    val score: Int,
    val recoveryScore: Int,
    val sleepQuality: Int,
    val hrvMs: Int,
    val restingHrBpm: Int,
    val trainingLoad: Double,
    val recommendation: String,
    val recoveryRecommendation: String,
    val warnings: List<String>,
    val aiSummary: String,
)

data class RecoverySnapshot(
    val score: Int,
    val sleepQuality: Int,
    val hrvMs: Int,
    val restingHrBpm: Int,
    val timeline: List<RecoveryPoint>,
    val recommendations: List<String>,
    val warnings: List<String>,
)

data class RecoveryPoint(
    val dayLabel: String,
    val score: Int,
)

data class TrainingSession(
    val id: String,
    val title: String,
    val sport: SportId,
    val scheduledAtEpochMs: Long,
    val durationMin: Int,
    val status: SessionStatus,
    val exercises: List<ExerciseItem>,
    val notes: String?,
    val coachFeedback: String?,
    val mediaUrls: List<String>,
)

enum class SessionStatus { UPCOMING, COMPLETED, CANCELLED }

data class ExerciseItem(
    val name: String,
    val detail: String,
)

data class ProgramEnrollment(
    val id: String,
    val title: String,
    val currentWeek: Int,
    val totalWeeks: Int,
    val progressPercent: Int,
    val nextWorkoutTitle: String,
    val milestones: List<String>,
)

data class CoachCard(
    val id: String,
    val name: String,
    val specialties: List<String>,
    val languages: List<String>,
    val rating: Double,
    val distanceKm: Double,
    val verified: Boolean,
    val available: Boolean,
    val priceTier: Int = 2,
    val city: String = "Lisbon",
)

data class AthleteGoal(
    val id: String,
    val title: String,
    val progressPercent: Int,
)

data class Achievement(
    val id: String,
    val title: String,
    val unlocked: Boolean,
)

data class BodyMetrics(
    val weightKg: Double,
    val hydrationLiters: Double,
    val nutritionKcal: Int,
)

data class CoachMessage(
    val id: String,
    val from: String,
    val preview: String,
    val atEpochMs: Long,
    val unread: Boolean,
)

data class AthleteTask(
    val id: String,
    val title: String,
    val done: Boolean,
)

data class WeatherBrief(
    val summary: String,
    val tempC: Int,
)

data class HomeSnapshot(
    val greeting: String,
    val readiness: DailyReadiness,
    val weather: WeatherBrief,
    val nextSession: TrainingSession?,
    val coachMessage: CoachMessage?,
    val tasks: List<AthleteTask>,
    val recentActivity: List<String>,
    val quickActions: List<String>,
)

data class NotificationItem(
    val id: String,
    val title: String,
    val body: String,
    val deepLink: String?,
)
