package com.fitconnect.android.athlete.ui.profile

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Flag
import androidx.compose.material.icons.outlined.MonitorHeart
import androidx.compose.material.icons.outlined.Palette
import androidx.compose.material.icons.outlined.Shield
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
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import com.fitconnect.android.athlete.data.LocalAthleteRepository
import com.fitconnect.android.athlete.demo.AthleteContentResolver
import com.fitconnect.android.athlete.demo.AthleteDemoBanner
import com.fitconnect.android.athlete.demo.AthleteDemoCatalog
import com.fitconnect.android.athlete.domain.AthleteGoal
import com.fitconnect.android.athlete.domain.AthleteProfile
import com.fitconnect.android.athlete.domain.BodyMetrics
import com.fitconnect.android.athlete.ui.LocalAthleteContainer
import com.fitconnect.android.athlete.ui.LocalAthletePatentStatus
import com.fitconnect.android.athlete.ui.LocalAthleteSignOut
import com.fitconnect.android.athlete.ui.components.AthleteScreenScaffold
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.components.EliteAchievementTile
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteHexatar
import com.fitconnect.android.designui.components.EliteHexatarProfile
import com.fitconnect.android.designui.components.EliteMetricCard
import com.fitconnect.android.designui.components.EliteMetricTile
import com.fitconnect.android.designui.components.EliteProgress
import com.fitconnect.android.designui.components.EliteSettingsRow
import com.fitconnect.android.designui.components.EliteStack
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.components.EliteTierBadge
import com.fitconnect.android.designui.components.EliteTierChip
import com.fitconnect.android.designui.components.EliteTierProgress
import com.fitconnect.android.designui.components.fillColor
import com.fitconnect.android.designui.identity.Patent
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.toColor
import com.fitconnect.ascend.domain.AchievementCategory
import com.fitconnect.android.foundation.auth.DemoPersona
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.theme.HoneycombIntensity
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
    val honeycomb by container.platform.themeSettings.observeHoneycomb()
        .collectAsState(initial = HoneycombIntensity.SUBTLE)
    var profile by remember { mutableStateOf<AthleteProfile?>(null) }
    var goals by remember { mutableStateOf<List<AthleteGoal>>(emptyList()) }
    var body by remember { mutableStateOf<BodyMetrics?>(null) }
    var devices by remember { mutableStateOf<List<DeviceEntry>>(emptyList()) }
    var sessionCount by remember { mutableStateOf<Int?>(null) }

    LaunchedEffect(Unit) {
        container.platform.analytics.screen("athlete_profile")
        profile = (container.athleteRepository.profile() as? AppResult.Ok)?.value
        goals = (container.athleteRepository.goals() as? AppResult.Ok)?.value.orEmpty()
        body = (container.athleteRepository.bodyMetrics() as? AppResult.Ok)?.value
        devices = container.telemetry.deviceCenter.devices(LocalAthleteRepository.ATHLETE_ID)
        val sessions = (container.athleteRepository.sessions() as? AppResult.Ok)?.value
        sessionCount = sessions?.size?.takeIf { it > 0 }
    }

    AthleteScreenScaffold(
        title = profile?.displayName ?: "Profile",
        subtitle = "Identity · appearance · goals · devices",
        testTag = "athlete_profile",
    ) {
        val profileSurface = profile?.let { AthleteContentResolver.profileSurface(it.displayName) }
        item {
            AthleteDemoBanner(
                visible = profileSurface?.isAnyDemo == true,
                modifier = Modifier.testTag("profile_demo_banner"),
            )
        }
        profile?.let { p ->
            item {
                val ascend = container.ascend.snapshot(LocalAthleteRepository.ATHLETE_ID)
                val locale by container.platform.localeManager.observe().collectAsState(
                    initial = com.fitconnect.android.foundation.i18n.AppLocale.EN,
                )
                val t = { key: String -> com.fitconnect.ascend.copy.AscendCopy.t(locale.bcp47, key) }
                val titles = com.fitconnect.ascend.titles.TitleRegistry.unlocked(ascend)
                val streak = ascend.streaks.firstOrNull {
                    it.kind == com.fitconnect.ascend.domain.StreakKind.PERFORMANCE
                }
                val patent = LocalAthletePatentStatus.current
                EliteStack(spacing = EliteSpace.Md) {
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        Box {
                            EliteHexatar(
                                userId = LocalAthleteRepository.ATHLETE_ID,
                                contentDescription = p.displayName,
                                diameter = EliteHexatarProfile,
                                modifier = Modifier.testTag("profile_hexatar"),
                            )
                            EliteTierBadge(
                                rank = patent.rank,
                                modifier = Modifier.align(Alignment.BottomEnd),
                            )
                        }
                        Text(
                            p.displayName,
                            style = MaterialTheme.typography.headlineSmall,
                            modifier = Modifier.testTag("elite_player_card"),
                        )
                        patent.rank?.let { EliteTierChip(it) }
                        EliteSysLabel(
                            profileSurface?.hexatarNote ?: AthleteDemoCatalog.HEXATAR_DETERMINISTIC_NOTE,
                            modifier = Modifier.testTag("profile_hexatar_note"),
                        )
                        EliteSysLabel(
                            streak?.let { "${it.days} DAY STREAK · ${DemoPersona.MODE_LABEL}" }
                                ?: "NO CONSISTENCY DATA YET",
                        )
                    }
                    EliteTierProgress(
                        title = patent.nextPatent?.name ?: Patent.INICIADO.name,
                        progress = patent.progressToNext,
                        remaining = patent.remainingLabel,
                        fill = (patent.rank?.patent ?: Patent.INICIADO).fillColor(),
                    )
                    val tiles = buildList {
                        sessionCount?.let { add("SESSIONS" to it.toString() to false) }
                        streak?.days?.let { add("STREAK" to it.toString() to true) }
                    }
                    if (tiles.isNotEmpty()) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
                        ) {
                            tiles.forEach { (labelValue, volt) ->
                                val (label, value) = labelValue
                                EliteMetricTile(
                                    label = label,
                                    value = value,
                                    accentVolt = volt,
                                    modifier = Modifier.weight(1f),
                                )
                            }
                        }
                    }
                    EliteSettingsRow(
                        title = "Devices and sensors",
                        icon = Icons.Outlined.MonitorHeart,
                        onClick = onOpenTelemetry,
                    )
                    EliteSettingsRow(
                        title = "Goals",
                        icon = Icons.Outlined.Flag,
                        trailing = goals.size.takeIf { it > 0 }?.toString(),
                        onClick = { },
                    )
                    EliteSettingsRow(
                        title = "Appearance",
                        icon = Icons.Outlined.Palette,
                        trailing = "HONEYCOMB · ${honeycomb.name}",
                        onClick = onOpenSettings,
                    )
                    EliteSettingsRow(
                        title = "Privacy and data",
                        icon = Icons.Outlined.Shield,
                        trailing = "ON-DEVICE",
                        onClick = onOpenSettings,
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
                    val achievementTiles = PROFILE_ACHIEVEMENT_IDS.mapNotNull { id ->
                        ascend.achievements.firstOrNull { it.definition.id == id }
                    }
                    if (achievementTiles.isNotEmpty()) {
                        EliteSysLabel("ACHIEVEMENTS")
                        achievementTiles.chunked(4).forEach { row ->
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
                            ) {
                                row.forEach { item ->
                                    EliteAchievementTile(
                                        emoji = achievementGlyph(item.definition.category),
                                        label = t(item.definition.nameKey),
                                        domain = achievementDomain(item.definition.category),
                                        unlocked = item.unlocked,
                                        modifier = Modifier.weight(1f),
                                    )
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
        body?.let { metrics ->
            item {
                EliteStack {
                    EliteSysLabel("BODY METRICS · ${AthleteDemoCatalog.MODE_LABEL}")
                    EliteMetricCard(label = "Weight", value = "${metrics.weightKg} kg")
                    EliteMetricCard(label = "Hydration", value = "${metrics.hydrationLiters} L")
                    EliteMetricCard(label = "Nutrition", value = "${metrics.nutritionKcal} kcal")
                }
            }
        }
        item { Text("Goals · ${AthleteDemoCatalog.MODE_LABEL}", style = MaterialTheme.typography.titleMedium) }
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
                onClick = onSignedOut,
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

private val PROFILE_ACHIEVEMENT_IDS = listOf(
    "first_session",
    "first_km",
    "daily_runner",
    "cardio_initiate",
    "first_pr",
    "recovery_discipline",
    "sleep_architect",
    "multi_sport",
)

private fun achievementGlyph(category: AchievementCategory): String = when (category) {
    AchievementCategory.DISTANCE -> "🏃"
    AchievementCategory.CONSISTENCY -> "🔥"
    AchievementCategory.CARDIO -> "❤️"
    AchievementCategory.SPEED -> "⚡"
    AchievementCategory.ENDURANCE -> "🛣️"
    AchievementCategory.RECOVERY -> "💚"
    AchievementCategory.SLEEP -> "🌙"
    AchievementCategory.PERSONAL_RECORD -> "🏆"
    AchievementCategory.SPORT -> "🏅"
    AchievementCategory.MILESTONE -> "📍"
    AchievementCategory.EXPLORATION -> "🗺️"
    AchievementCategory.PERFORMANCE -> "📈"
    AchievementCategory.LEGACY -> "👑"
    AchievementCategory.COMMUNITY -> "🤝"
    AchievementCategory.COACHING -> "🎯"
}

private fun achievementDomain(category: AchievementCategory) = when (category) {
    AchievementCategory.DISTANCE,
    AchievementCategory.CARDIO,
    AchievementCategory.ENDURANCE,
    -> EliteSurfaceColors.TELEMETRY.toColor()
    AchievementCategory.CONSISTENCY,
    AchievementCategory.RECOVERY,
    -> EliteSurfaceColors.RECOVERY.toColor()
    AchievementCategory.PERSONAL_RECORD,
    AchievementCategory.SPEED,
    AchievementCategory.PERFORMANCE,
    AchievementCategory.MILESTONE,
    -> EliteSurfaceColors.VOLTLINE.toColor()
    AchievementCategory.SLEEP -> EliteSurfaceColors.IRIS.toColor()
    AchievementCategory.SPORT,
    AchievementCategory.EXPLORATION,
    -> EliteSurfaceColors.PATENT_MINT.toColor()
    AchievementCategory.LEGACY -> EliteSurfaceColors.PATENT_LEGEND.toColor()
    AchievementCategory.COMMUNITY,
    AchievementCategory.COACHING,
    -> EliteSurfaceColors.PATENT_STEEL.toColor()
}
