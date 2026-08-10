package com.fitconnect.android.athlete.ui.profile

import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import com.fitconnect.android.athlete.domain.Achievement
import com.fitconnect.android.athlete.domain.AthleteGoal
import com.fitconnect.android.athlete.domain.AthleteProfile
import com.fitconnect.android.athlete.domain.BodyMetrics
import com.fitconnect.android.athlete.ui.LocalAthleteContainer
import com.fitconnect.android.athlete.ui.LocalAthleteSignOut
import com.fitconnect.android.athlete.data.LocalAthleteRepository
import com.fitconnect.android.athlete.ui.components.AthleteScreenScaffold
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteMetricCard
import com.fitconnect.android.designui.components.EliteProgress
import com.fitconnect.android.telemetry.devices.DeviceEntry
import com.fitconnect.android.telemetry.provider.ProviderConnectionState
import kotlinx.coroutines.launch

@Composable
fun ProfileScreen(onOpenTelemetry: () -> Unit = {}, onOpenAi: () -> Unit = {}) {
    val container = LocalAthleteContainer.current
    val onSignedOut = LocalAthleteSignOut.current
    val scope = rememberCoroutineScope()
    var profile by remember { mutableStateOf<AthleteProfile?>(null) }
    var goals by remember { mutableStateOf<List<AthleteGoal>>(emptyList()) }
    var achievements by remember { mutableStateOf<List<Achievement>>(emptyList()) }
    var body by remember { mutableStateOf<BodyMetrics?>(null) }
    var devices by remember { mutableStateOf<List<DeviceEntry>>(emptyList()) }

    LaunchedEffect(Unit) {
        container.platform.analytics.screen("athlete_profile")
        profile = (container.athleteRepository.profile() as? com.fitconnect.android.foundation.common.AppResult.Ok)?.value
        goals = (container.athleteRepository.goals() as? com.fitconnect.android.foundation.common.AppResult.Ok)?.value.orEmpty()
        achievements = (container.athleteRepository.achievements() as? com.fitconnect.android.foundation.common.AppResult.Ok)?.value.orEmpty()
        body = (container.athleteRepository.bodyMetrics() as? com.fitconnect.android.foundation.common.AppResult.Ok)?.value
        devices = container.telemetry.deviceCenter.devices(LocalAthleteRepository.ATHLETE_ID)
    }

    AthleteScreenScaffold(
        title = profile?.displayName ?: "Profile",
        subtitle = "Medical · goals · devices · privacy · subscription",
        testTag = "athlete_profile",
    ) {
        profile?.let { p ->
            item {
                EliteCard {
                    Text("Subscription: ${p.subscriptionTier}", style = MaterialTheme.typography.titleMedium)
                    Text("Medical: ${p.medicalNotes}", style = MaterialTheme.typography.bodyMedium)
                    Text("Emergency: ${p.emergencyContact}", style = MaterialTheme.typography.bodyMedium)
                    Text("Privacy: data stays on-device until sync", style = MaterialTheme.typography.bodyMedium)
                }
            }
        }
        body?.let { metrics ->
            item {
                EliteMetricCard(label = "Weight", value = "${metrics.weightKg} kg")
                EliteMetricCard(label = "Hydration", value = "${metrics.hydrationLiters} L")
                EliteMetricCard(label = "Nutrition", value = "${metrics.nutritionKcal} kcal")
            }
        }
        item { Text("Goals", style = MaterialTheme.typography.titleMedium) }
        items(goals, key = { it.id }) { goal ->
            EliteCard {
                Text(goal.title, style = MaterialTheme.typography.titleMedium)
                EliteProgress(progress = goal.progressPercent / 100f)
            }
        }
        item { Text("Achievements", style = MaterialTheme.typography.titleMedium) }
        items(achievements, key = { it.id }) { a ->
            EliteCard {
                Text(
                    if (a.unlocked) "✓ ${a.title}" else "○ ${a.title}",
                    style = MaterialTheme.typography.bodyLarge,
                )
            }
        }
        item { Text("Connected devices / apps", style = MaterialTheme.typography.titleMedium) }
        item {
            EliteButton(
                label = "Open Telemetry Center",
                variant = EliteButtonVariant.Secondary,
                onClick = onOpenTelemetry,
            )
        }
        item {
            EliteButton(
                label = "Open Performance AI",
                variant = EliteButtonVariant.Secondary,
                onClick = onOpenAi,
            )
        }
        items(devices, key = { it.provider.name }) { device ->
            EliteCard {
                Text(device.displayName, style = MaterialTheme.typography.titleMedium)
                Text(
                    "State: ${device.state} · ${device.readableMetricCount} metrics",
                    style = MaterialTheme.typography.bodyMedium,
                )
                val connected = device.state == ProviderConnectionState.CONNECTED
                EliteButton(
                    label = if (connected) "Sync now" else "Connect",
                    variant = EliteButtonVariant.Secondary,
                    onClick = {
                        scope.launch {
                            val athleteId = LocalAthleteRepository.ATHLETE_ID
                            if (connected) {
                                container.telemetry.deviceCenter.syncNow(athleteId, device.provider)
                            } else {
                                container.telemetry.deviceCenter.connect(athleteId, device.provider)
                            }
                            devices = container.telemetry.deviceCenter.devices(athleteId)
                        }
                    },
                )
            }
        }
        item {
            EliteButton(
                label = "Sign out",
                variant = EliteButtonVariant.Ghost,
                modifier = Modifier.testTag("athlete_sign_out"),
                onClick = {
                    scope.launch {
                        container.platform.authRepository.logout()
                        container.platform.analytics.reset()
                        onSignedOut()
                    }
                },
            )
        }
    }
}
