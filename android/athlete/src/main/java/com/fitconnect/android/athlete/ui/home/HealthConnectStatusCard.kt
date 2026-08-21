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
        "One step. No empty illustration."
    }
    val cta = if (state == HealthConnectSdkState.NEEDS_UPDATE) "Update" else "Link Health Connect"
    EliteCard(modifier = modifier.testTag("health_connect_status")) {
        EliteStack {
            EliteSysLabel("HEALTH CONNECT")
            Text(title)
            Text(body)
            EliteButton(label = cta, onClick = onAction)
        }
    }
}
