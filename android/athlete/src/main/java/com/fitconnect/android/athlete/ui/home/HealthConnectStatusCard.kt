package com.fitconnect.android.athlete.ui.home

import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteStack
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.fitness.domain.HealthConnectSdkState
import com.fitconnect.android.fitness.healthconnect.HealthConnectPermissionState

@Composable
fun HealthConnectStatusCard(
    state: HealthConnectSdkState,
    onAction: () -> Unit,
    modifier: Modifier = Modifier,
) {
    if (state == HealthConnectSdkState.AVAILABLE) return
    val title = if (state == HealthConnectSdkState.NEEDS_UPDATE) {
        "Update Health Connect"
    } else {
        "Link Health Connect to see your workouts"
    }
    val body = if (state == HealthConnectSdkState.NEEDS_UPDATE) {
        "Health Connect is installed but needs an update before sessions can appear."
    } else {
        "Install Health Connect to sync workouts, steps, and heart rate on device."
    }
    val cta = if (state == HealthConnectSdkState.NEEDS_UPDATE) "Update" else "Install Health Connect"
    EliteCard(modifier = modifier.testTag("health_connect_status")) {
        EliteStack {
            EliteSysLabel("HEALTH CONNECT")
            Text(title)
            Text(body)
            EliteButton(label = cta, onClick = onAction)
        }
    }
}

@Composable
fun HealthConnectPermissionCard(
    permissionState: HealthConnectPermissionState,
    onRequestPermissions: () -> Unit,
    onOpenSettings: () -> Unit,
    modifier: Modifier = Modifier,
) {
    if (permissionState == HealthConnectPermissionState.GRANTED) return
    val title = when (permissionState) {
        HealthConnectPermissionState.PARTIAL -> "Finish Health Connect permissions"
        else -> "Allow Health Connect access"
    }
    val body = when (permissionState) {
        HealthConnectPermissionState.PARTIAL ->
            "FitConnect needs exercise, steps, heart rate, and distance to show your training data."
        else ->
            "Grant read access for workouts and recovery metrics. You control what is shared."
    }
    EliteCard(modifier = modifier.testTag("health_connect_permissions")) {
        EliteStack {
            EliteSysLabel("HEALTH CONNECT · PERMISSIONS")
            Text(title)
            Text(body)
            EliteButton(
                label = if (permissionState == HealthConnectPermissionState.PARTIAL) {
                    "Open settings"
                } else {
                    "Grant access"
                },
                onClick = if (permissionState == HealthConnectPermissionState.PARTIAL) {
                    onOpenSettings
                } else {
                    onRequestPermissions
                },
            )
        }
    }
}
