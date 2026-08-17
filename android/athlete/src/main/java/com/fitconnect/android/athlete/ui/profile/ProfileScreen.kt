package com.fitconnect.android.athlete.ui.profile

import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import com.fitconnect.android.athlete.data.LocalAthleteRepository
import com.fitconnect.android.athlete.domain.AthleteGoal
import com.fitconnect.android.athlete.domain.AthleteProfile
import com.fitconnect.android.athlete.domain.BodyMetrics
import com.fitconnect.android.athlete.ui.LocalAthleteContainer
import com.fitconnect.android.athlete.ui.LocalAthleteSignOut
import com.fitconnect.android.athlete.ui.components.AthleteScreenScaffold
import com.fitconnect.android.designui.components.EliteAppearancePicker
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteMetricCard
import com.fitconnect.android.designui.components.ElitePlayerCard
import com.fitconnect.android.designui.components.EliteProgress
import com.fitconnect.android.designui.components.EliteStack
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.theme.AccentPreset
import com.fitconnect.android.foundation.theme.ThemeMode
import com.fitconnect.android.telemetry.devices.DeviceEntry
import com.fitconnect.android.telemetry.provider.ProviderConnectionState
import kotlinx.coroutines.launch

@Composable
fun ProfileScreen(
    onOpenTelemetry: () -> Unit = {},
    onOpenAi: () -> Unit = {},
    onOpenSettings: () -> Unit = {},
    onOpenVault: () -> Unit = {},
) {
    val container = LocalAthleteContainer.current
    val onSignedOut = LocalAthleteSignOut.current
    val scope = rememberCoroutineScope()
    val themeMode by container.platform.themeSettings.observe().collectAsState(initial = ThemeMode.SYSTEM)
    val accent by container.platform.themeSettings.observeAccent().collectAsState(initial = AccentPreset.VOLTLINE)
    var profile by remember { mutableStateOf<AthleteProfile?>(null) }
    var goals by remember { mutableStateOf<List<AthleteGoal>>(emptyList()) }
    var body by remember { mutableStateOf<BodyMetrics?>(null) }
    var devices by remember { mutableStateOf<List<DeviceEntry>>(emptyList()) }

    LaunchedEffect(Unit) {
        container.platform.analytics.screen("athlete_profile")
        profile = (container.athleteRepository.profile() as? AppResult.Ok)?.value
        goals = (container.athleteRepository.goals() as? AppResult.Ok)?.value.orEmpty()
        body = (container.athleteRepository.bodyMetrics() as? AppResult.Ok)?.value
        devices = container.telemetry.deviceCenter.devices(LocalAthleteRepository.ATHLETE_ID)
    }

    AthleteScreenScaffold(
        title = profile?.displayName ?: "Profile",
        subtitle = "Identity · appearance · goals · devices",
        testTag = "athlete_profile",
    ) {
        profile?.let { p ->
            item {
                val ascend = container.ascend.snapshot(LocalAthleteRepository.ATHLETE_ID)
                val locale by container.platform.localeManager.observe().collectAsState(
                    initial = com.fitconnect.android.foundation.i18n.AppLocale.EN,
                )
                val t = { key: String -> com.fitconnect.ascend.copy.AscendCopy.t(locale.bcp47, key) }
                val titles = com.fitconnect.ascend.titles.TitleRegistry.unlocked(ascend)
                val equipped = com.fitconnect.ascend.titles.TitleRegistry.equipped(titles)
                val streak = ascend.streaks.firstOrNull {
                    it.kind == com.fitconnect.ascend.domain.StreakKind.PERFORMANCE
                }
                EliteStack(spacing = EliteSpace.Md) {
                    ElitePlayerCard(
                        initials = initialsOf(p.displayName),
                        displayName = p.displayName,
                        overline = "ATHLETE · ${p.subscriptionTier.uppercase()} · IDENTITY",
                        title = equipped?.let { t(it.nameKey) },
                        sportLine = p.sports.joinToString { it.value },
                        levelLabel = "LV ${ascend.level.level} · ${t(ascend.level.rank.nameKey)}",
                        xpLabel = "${ascend.totalXp} XP",
                        streakLabel = streak?.let { "${it.days} DAY STREAK" },
                        squadLabel = "SQUAD · LOCAL_DEMO",
                    )
                    if (titles.isNotEmpty()) {
                        EliteCard(variant = com.fitconnect.android.designui.components.EliteCardVariant.Glass) {
                            EliteStack(spacing = EliteSpace.Sm) {
                                EliteSysLabel("FEATURED TITLES · UNLOCKED")
                                titles.take(4).forEach { title ->
                                    Text(t(title.nameKey), style = MaterialTheme.typography.titleMedium)
                                }
                            }
                        }
                    }
                }
            }
            item {
                EliteCard {
                    EliteStack(spacing = EliteSpace.Md) {
                        ProfileField(label = "Medical", value = p.medicalNotes ?: "None on file")
                        ProfileField(label = "Emergency", value = p.emergencyContact ?: "Not set")
                        ProfileField(label = "Privacy", value = "On-device until sync")
                    }
                }
            }
        }
        item {
            EliteCard {
                EliteAppearancePicker(
                    mode = themeMode,
                    onModeChange = { next ->
                        scope.launch { container.platform.themeSettings.setMode(next) }
                    },
                    accent = accent,
                    onAccentChange = { next ->
                        scope.launch { container.platform.themeSettings.setAccent(next) }
                    },
                )
            }
        }
        body?.let { metrics ->
            item {
                EliteStack {
                    EliteSysLabel("BODY METRICS")
                    EliteMetricCard(label = "Weight", value = "${metrics.weightKg} kg")
                    EliteMetricCard(label = "Hydration", value = "${metrics.hydrationLiters} L")
                    EliteMetricCard(label = "Nutrition", value = "${metrics.nutritionKcal} kcal")
                }
            }
        }
        item { Text("Goals", style = MaterialTheme.typography.titleMedium) }
        items(goals, key = { it.id }) { goal ->
            EliteCard {
                EliteStack(spacing = EliteSpace.Sm) {
                    Text(goal.title, style = MaterialTheme.typography.titleMedium)
                    EliteProgress(progress = goal.progressPercent / 100f)
                }
            }
        }
        item { Text("Performance Vault", style = MaterialTheme.typography.titleMedium) }
        item {
            EliteButton(
                label = "Open Performance Vault",
                onClick = onOpenVault,
                modifier = Modifier.testTag("profile_open_vault"),
            )
        }
        item { Text("Connected devices / apps", style = MaterialTheme.typography.titleMedium) }
        item {
            EliteStack {
                EliteButton(
                    label = "Settings · language",
                    variant = EliteButtonVariant.Secondary,
                    onClick = onOpenSettings,
                    modifier = Modifier.testTag("athlete_open_settings"),
                )
                EliteButton(
                    label = "Open Telemetry Center",
                    variant = EliteButtonVariant.Secondary,
                    onClick = onOpenTelemetry,
                )
                EliteButton(
                    label = "Open Performance AI",
                    variant = EliteButtonVariant.Secondary,
                    onClick = onOpenAi,
                )
            }
        }
        items(devices, key = { it.provider.name }) { device ->
            EliteCard {
                EliteStack(spacing = EliteSpace.Sm) {
                    Text(device.displayName, style = MaterialTheme.typography.titleMedium)
                    Text(
                        "State: ${device.state} · ${device.readableMetricCount} metrics",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
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

@Composable
private fun ProfileField(label: String, value: String) {
    EliteStack(spacing = EliteSpace.Xxs) {
        Text(
            label.uppercase(),
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Text(value, style = MaterialTheme.typography.bodyLarge)
    }
}

private fun initialsOf(name: String): String =
    name.split(" ")
        .filter { it.isNotBlank() }
        .take(2)
        .joinToString("") { it.first().uppercase() }
        .ifBlank { "FC" }
