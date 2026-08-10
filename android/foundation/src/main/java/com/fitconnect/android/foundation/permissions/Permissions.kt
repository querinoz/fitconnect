package com.fitconnect.android.foundation.permissions

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.content.ContextCompat

enum class PermissionStatus {
    GRANTED,
    DENIED,
    DENIED_PERMANENTLY,
    NOT_REQUESTED,
    UNSUPPORTED,
}

enum class AppRuntimePermission(
    val androidPermission: String?,
    val rationaleKey: String,
    val recoveryKey: String,
) {
    LOCATION(Manifest.permission.ACCESS_FINE_LOCATION, "perm.location.rationale", "perm.location.recovery"),
    CAMERA(Manifest.permission.CAMERA, "perm.camera.rationale", "perm.camera.recovery"),
    PHOTOS(
        if (Build.VERSION.SDK_INT >= 33) Manifest.permission.READ_MEDIA_IMAGES
        else Manifest.permission.READ_EXTERNAL_STORAGE,
        "perm.photos.rationale",
        "perm.photos.recovery",
    ),
    MICROPHONE(Manifest.permission.RECORD_AUDIO, "perm.mic.rationale", "perm.mic.recovery"),
    BLUETOOTH(
        if (Build.VERSION.SDK_INT >= 31) Manifest.permission.BLUETOOTH_CONNECT else null,
        "perm.bluetooth.rationale",
        "perm.bluetooth.recovery",
    ),
    NOTIFICATIONS(
        if (Build.VERSION.SDK_INT >= 33) Manifest.permission.POST_NOTIFICATIONS else null,
        "perm.notifications.rationale",
        "perm.notifications.recovery",
    ),
    ACTIVITY_RECOGNITION(
        Manifest.permission.ACTIVITY_RECOGNITION,
        "perm.activity.rationale",
        "perm.activity.recovery",
    ),
    HEALTH_CONNECT(null, "perm.health.rationale", "perm.health.recovery"),
}

data class PermissionDecision(
    val permission: AppRuntimePermission,
    val status: PermissionStatus,
    val rationaleKey: String,
    val recoveryKey: String,
    val fallbackAllowed: Boolean,
)

interface PermissionGateway {
    fun status(permission: AppRuntimePermission): PermissionStatus
    fun decision(permission: AppRuntimePermission): PermissionDecision
    fun requiredManifestPermissions(): List<String>
}

class AndroidPermissionGateway(
    private val context: Context,
) : PermissionGateway {
    override fun status(permission: AppRuntimePermission): PermissionStatus {
        val androidPerm = permission.androidPermission
            ?: return if (permission == AppRuntimePermission.HEALTH_CONNECT) {
                PermissionStatus.UNSUPPORTED
            } else {
                PermissionStatus.GRANTED
            }
        if (permission == AppRuntimePermission.NOTIFICATIONS && Build.VERSION.SDK_INT < 33) {
            return PermissionStatus.GRANTED
        }
        val granted = ContextCompat.checkSelfPermission(context, androidPerm) ==
            PackageManager.PERMISSION_GRANTED
        return if (granted) PermissionStatus.GRANTED else PermissionStatus.DENIED
    }

    override fun decision(permission: AppRuntimePermission): PermissionDecision {
        val status = status(permission)
        return PermissionDecision(
            permission = permission,
            status = status,
            rationaleKey = permission.rationaleKey,
            recoveryKey = permission.recoveryKey,
            fallbackAllowed = status != PermissionStatus.GRANTED,
        )
    }

    override fun requiredManifestPermissions(): List<String> =
        AppRuntimePermission.entries.mapNotNull { it.androidPermission }.distinct()
}
