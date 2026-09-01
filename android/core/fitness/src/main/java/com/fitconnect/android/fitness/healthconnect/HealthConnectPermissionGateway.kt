package com.fitconnect.android.fitness.healthconnect

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import com.fitconnect.android.fitness.domain.HealthConnectSdkState
import com.fitconnect.android.fitness.domain.HealthFeature

enum class HealthConnectPermissionState {
    /** SDK missing or needs update — permissions cannot be requested yet. */
    SDK_NOT_READY,
    /** Onboarding read permissions fully granted. */
    GRANTED,
    /** SDK ready; user has not granted onboarding permissions. */
    NOT_GRANTED,
    /** Partial grant — treat as not ready for sync. */
    PARTIAL,
}

interface HealthConnectPermissionGateway {
    suspend fun permissionState(feature: HealthFeature = HealthFeature.ONBOARDING): HealthConnectPermissionState
    fun onboardingPermissions(): Set<String>
}

class AndroidHealthConnectPermissionGateway(
    private val context: Context,
    private val sdkState: () -> HealthConnectSdkState = { HealthConnectSdkMapper.probe(context) },
) : HealthConnectPermissionGateway {

    private val client: HealthConnectClient? by lazy {
        if (sdkState() != HealthConnectSdkState.AVAILABLE) null
        else runCatching { HealthConnectClient.getOrCreate(context) }.getOrNull()
    }

    override fun onboardingPermissions(): Set<String> = HealthConnectPermissionMapper.onboardingPermissions()

    override suspend fun permissionState(feature: HealthFeature): HealthConnectPermissionState {
        if (sdkState() != HealthConnectSdkState.AVAILABLE) return HealthConnectPermissionState.SDK_NOT_READY
        val hc = client ?: return HealthConnectPermissionState.SDK_NOT_READY
        val required = HealthConnectPermissionMapper.permissionsForFeature(feature)
        if (required.isEmpty()) return HealthConnectPermissionState.NOT_GRANTED
        val granted = runCatching { hc.permissionController.getGrantedPermissions() }.getOrElse { emptySet() }
        return when {
            granted.containsAll(required) -> HealthConnectPermissionState.GRANTED
            granted.none { it in required } -> HealthConnectPermissionState.NOT_GRANTED
            else -> HealthConnectPermissionState.PARTIAL
        }
    }
}
