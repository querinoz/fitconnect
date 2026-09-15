package com.fitconnect.android.fitness.healthconnect

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import com.fitconnect.android.fitness.domain.HealthConnectBackgroundAccess
import com.fitconnect.android.fitness.domain.HealthConnectHistoryWindow
import com.fitconnect.android.fitness.domain.HealthConnectSdkState
import com.fitconnect.android.fitness.domain.HealthFeature
import androidx.health.connect.client.permission.HealthPermission

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

data class HealthConnectGrantSnapshot(
    val recordState: HealthConnectPermissionState,
    val historyGranted: Boolean,
    val backgroundAccess: HealthConnectBackgroundAccess,
    val historyWindow: HealthConnectHistoryWindow,
)

interface HealthConnectPermissionGateway {
    suspend fun permissionState(feature: HealthFeature = HealthFeature.ONBOARDING): HealthConnectPermissionState
    suspend fun grantSnapshot(feature: HealthFeature = HealthFeature.ONBOARDING): HealthConnectGrantSnapshot
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
        return grantSnapshot(feature).recordState
    }

    override suspend fun grantSnapshot(feature: HealthFeature): HealthConnectGrantSnapshot {
        if (sdkState() != HealthConnectSdkState.AVAILABLE) {
            return HealthConnectGrantSnapshot(
                recordState = HealthConnectPermissionState.SDK_NOT_READY,
                historyGranted = false,
                backgroundAccess = HealthConnectBackgroundAccess.UNKNOWN,
                historyWindow = HealthConnectHistoryWindow.UNKNOWN,
            )
        }
        val hc = client ?: return HealthConnectGrantSnapshot(
            recordState = HealthConnectPermissionState.SDK_NOT_READY,
            historyGranted = false,
            backgroundAccess = HealthConnectBackgroundAccess.UNKNOWN,
            historyWindow = HealthConnectHistoryWindow.UNKNOWN,
        )
        val required = HealthConnectPermissionMapper.recordPermissionsForFeature(feature)
        if (required.isEmpty()) {
            return HealthConnectGrantSnapshot(
                recordState = HealthConnectPermissionState.NOT_GRANTED,
                historyGranted = false,
                backgroundAccess = HealthConnectBackgroundAccess.UNKNOWN,
                historyWindow = HealthConnectHistoryWindow.UNKNOWN,
            )
        }
        val granted = runCatching { hc.permissionController.getGrantedPermissions() }.getOrElse { emptySet() }
        val recordState = when {
            granted.containsAll(required) -> HealthConnectPermissionState.GRANTED
            granted.none { it in required } -> HealthConnectPermissionState.NOT_GRANTED
            else -> HealthConnectPermissionState.PARTIAL
        }
        val historyGranted = HealthPermission.PERMISSION_READ_HEALTH_DATA_HISTORY in granted
        val backgroundGranted = HealthPermission.PERMISSION_READ_HEALTH_DATA_IN_BACKGROUND in granted
        return HealthConnectGrantSnapshot(
            recordState = recordState,
            historyGranted = historyGranted,
            backgroundAccess = if (backgroundGranted) {
                HealthConnectBackgroundAccess.GRANTED
            } else {
                HealthConnectBackgroundAccess.DENIED
            },
            historyWindow = if (historyGranted) {
                HealthConnectHistoryWindow.FULL
            } else {
                HealthConnectHistoryWindow.THIRTY_DAYS
            },
        )
    }
}
