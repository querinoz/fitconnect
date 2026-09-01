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

    fun permissionsForFeature(feature: HealthFeature): Set<String> =
        HealthConnectPermissionPolicy.forFeature(feature)
            .mapNotNull { recordByPolicyName[it] }
            .map { HealthPermission.getReadPermission(it) }
            .toSet()

    fun onboardingPermissions(): Set<String> = permissionsForFeature(HealthFeature.ONBOARDING)

    fun sleepPermissions(): Set<String> = permissionsForFeature(HealthFeature.SLEEP)
}
