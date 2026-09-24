package com.fitconnect.android.fitness.healthconnect

import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.DistanceRecord
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.StepsRecord
import com.fitconnect.android.fitness.domain.HealthConnectPermissionPolicy
import com.fitconnect.android.fitness.domain.HealthFeature

/**
 * Maps [HealthConnectPermissionPolicy] groups to Jetpack Health Connect permissions.
 * ViewModels request features — never raw permission strings.
 *
 * History and background reads are extra Health Connect 1.1 permissions. Without
 * [HealthPermission.PERMISSION_READ_HEALTH_DATA_HISTORY], reads older than 30 days fail.
 * Without [HealthPermission.PERMISSION_READ_HEALTH_DATA_IN_BACKGROUND], background sync must not run.
 */
object HealthConnectPermissionMapper {
    private val recordByPolicyName: Map<String, kotlin.reflect.KClass<out androidx.health.connect.client.records.Record>> =
        mapOf(
            "ExerciseSession" to ExerciseSessionRecord::class,
            "Steps" to StepsRecord::class,
            "HeartRate" to HeartRateRecord::class,
            "Distance" to DistanceRecord::class,
            "SleepSession" to SleepSessionRecord::class,
        )

    fun recordPermissionsForFeature(feature: HealthFeature): Set<String> =
        HealthConnectPermissionPolicy.forFeature(feature)
            .mapNotNull { recordByPolicyName[it] }
            .map { HealthPermission.getReadPermission(it) }
            .toSet()

    /** Explicit WRITE for completed workouts — never bundled into silent onboarding. */
    fun writePermissionsForExerciseSession(): Set<String> =
        setOf(HealthPermission.getWritePermission(ExerciseSessionRecord::class))

    fun accessPermissions(): Set<String> = setOf(
        HealthPermission.PERMISSION_READ_HEALTH_DATA_HISTORY,
        HealthPermission.PERMISSION_READ_HEALTH_DATA_IN_BACKGROUND,
    )

    fun permissionsForFeature(feature: HealthFeature): Set<String> =
        recordPermissionsForFeature(feature)

    fun onboardingPermissions(): Set<String> =
        recordPermissionsForFeature(HealthFeature.ONBOARDING) + accessPermissions()

    fun sleepPermissions(): Set<String> = permissionsForFeature(HealthFeature.SLEEP)
}
