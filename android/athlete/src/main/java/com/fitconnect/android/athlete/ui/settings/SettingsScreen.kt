package com.fitconnect.android.athlete.ui.settings

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import com.fitconnect.android.athlete.data.LocalAthleteRepository
import com.fitconnect.android.athlete.ui.LocalAthleteContainer
import com.fitconnect.android.athlete.ui.LocalAthleteSignOut
import com.fitconnect.android.athlete.ui.components.AthleteScreenScaffold
import com.fitconnect.android.designui.components.EliteAppearancePicker
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteLanguagePicker
import com.fitconnect.android.designui.components.EliteSwitch
import com.fitconnect.android.designui.components.EliteStack
import com.fitconnect.android.foundation.i18n.AppLocale
import com.fitconnect.android.foundation.i18n.LocaleApplier
import com.fitconnect.android.foundation.theme.AccentPreset
import com.fitconnect.android.foundation.theme.HoneycombIntensity
import com.fitconnect.android.foundation.theme.ThemeMode
import com.fitconnect.ascend.domain.AscendPrefs
import kotlinx.coroutines.launch

@Composable
fun SettingsScreen(
    onOpenProfile: () -> Unit,
    onOpenNotifications: () -> Unit,
    onOpenTelemetry: () -> Unit,
) {
    val container = LocalAthleteContainer.current
    val onSignedOut = LocalAthleteSignOut.current
    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    val themeMode by container.platform.themeSettings.observe().collectAsState(initial = ThemeMode.SYSTEM)
    val accent by container.platform.themeSettings.observeAccent()
        .collectAsState(initial = AccentPreset.VOLTLINE)
    val honeycomb by container.platform.themeSettings.observeHoneycomb()
        .collectAsState(initial = HoneycombIntensity.SUBTLE)
    val locale by container.platform.localeManager.observe().collectAsState(initial = AppLocale.EN)
    var prefs by remember { mutableStateOf(container.ascend.snapshot(LocalAthleteRepository.ATHLETE_ID).prefs) }
    var confirmDelete by remember { mutableStateOf(false) }
    var deleteMessage by remember { mutableStateOf<String?>(null) }

    AthleteScreenScaffold(
        title = "Settings",
        subtitle = "Appearance · language · account",
        overline = "ATHLETE OS · PREFS",
        testTag = "athlete_settings",
    ) {
        item {
            EliteCard {
                EliteStack {
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
                    Text("Honeycomb atmosphere", style = MaterialTheme.typography.titleSmall)
                    Text(
                        "Subtle mesh at 6% Volt on the Athlete OS floor. Off is a flat floor. No full intensity — anti-casino.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    EliteSwitch(
                        checked = honeycomb == HoneycombIntensity.SUBTLE,
                        onCheckedChange = { enabled ->
                            scope.launch {
                                container.platform.themeSettings.setHoneycomb(
                                    if (enabled) HoneycombIntensity.SUBTLE else HoneycombIntensity.OFF,
                                )
                            }
                        },
                        modifier = Modifier
                            .testTag("athlete_honeycomb_toggle")
                            .semantics { contentDescription = "Honeycomb atmosphere" },
                    )
                }
            }
        }
        item {
            EliteCard {
                EliteLanguagePicker(
                    locale = locale,
                    onLocaleChange = { next ->
                        scope.launch {
                            container.platform.localeManager.set(next)
                            LocaleApplier.apply(context, next)
                        }
                    },
                )
            }
        }
        item {
            com.fitconnect.android.designui.components.IdentityConnectedAccounts(
                authRepository = container.platform.authRepository,
            )
        }
        item {
            EliteCard {
                EliteStack {
                    Text("Notifications", style = MaterialTheme.typography.titleMedium)
                    Text(
                        "Push uses FCM when google-services.json is present. Device delivery remains PENDING_HUMAN until Firebase Console + Play credentials exist.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    EliteButton(
                        label = "Open alerts",
                        variant = EliteButtonVariant.Secondary,
                        onClick = onOpenNotifications,
                    )
                    Text("ASCEND haptics", style = MaterialTheme.typography.titleSmall)
                    EliteSwitch(
                        checked = prefs.hapticsEnabled,
                        onCheckedChange = { enabled ->
                            val next = AscendPrefs(hapticsEnabled = enabled, progressionNotificationsEnabled = prefs.progressionNotificationsEnabled)
                            container.ascend.setPrefs(LocalAthleteRepository.ATHLETE_ID, next)
                            prefs = next
                        },
                    )
                    Text("ASCEND progression notifications", style = MaterialTheme.typography.titleSmall)
                    EliteSwitch(
                        checked = prefs.progressionNotificationsEnabled,
                        onCheckedChange = { enabled ->
                            val next = AscendPrefs(hapticsEnabled = prefs.hapticsEnabled, progressionNotificationsEnabled = enabled)
                            container.ascend.setPrefs(LocalAthleteRepository.ATHLETE_ID, next)
                            prefs = next
                        },
                    )
                }
            }
        }
        item {
            EliteCard {
                EliteStack {
                    Text("Account deletion", style = MaterialTheme.typography.titleMedium)
                    Text(
                        "Removes FitConnect app identity and Strava tokens for this user. Firebase Auth user deletion remains PENDING_HUMAN. LOCAL_DEMO accounts are refused.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    if (deleteMessage != null) {
                        Text(deleteMessage!!, style = MaterialTheme.typography.bodySmall)
                    }
                    EliteButton(
                        label = if (confirmDelete) "Confirm DELETE" else "Request account deletion",
                        variant = EliteButtonVariant.Destructive,
                        modifier = Modifier.testTag("athlete_delete_account"),
                        onClick = {
                            scope.launch {
                                if (!confirmDelete) {
                                    confirmDelete = true
                                    return@launch
                                }
                                when (container.platform.authRepository.deleteAccount()) {
                                    is com.fitconnect.android.foundation.common.AppResult.Ok -> {
                                        container.platform.analytics.reset()
                                        onSignedOut()
                                    }
                                    is com.fitconnect.android.foundation.common.AppResult.Err -> {
                                        deleteMessage = "Deletion denied"
                                        confirmDelete = false
                                    }
                                }
                            }
                        },
                    )
                }
            }
        }
        item {
            LocalDebugSettingsSlot.current?.invoke()
        }
        item {
            EliteStack {
                EliteButton("Profile", onClick = onOpenProfile, variant = EliteButtonVariant.Secondary)
                EliteButton("Telemetry", onClick = onOpenTelemetry, variant = EliteButtonVariant.Ghost)
            }
        }
    }
}
