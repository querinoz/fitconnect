package com.fitconnect.android.athlete.ui.settings

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import com.fitconnect.android.athlete.ui.LocalAthleteContainer
import com.fitconnect.android.athlete.ui.components.AthleteScreenScaffold
import com.fitconnect.android.designui.components.EliteAppearancePicker
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteLanguagePicker
import com.fitconnect.android.designui.components.EliteStack
import com.fitconnect.android.foundation.i18n.AppLocale
import com.fitconnect.android.foundation.i18n.LocaleApplier
import com.fitconnect.android.foundation.theme.ThemeMode
import kotlinx.coroutines.launch

@Composable
fun SettingsScreen(
    onOpenProfile: () -> Unit,
    onOpenNotifications: () -> Unit,
    onOpenTelemetry: () -> Unit,
) {
    val container = LocalAthleteContainer.current
    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    val themeMode by container.platform.themeSettings.observe().collectAsState(initial = ThemeMode.SYSTEM)
    val locale by container.platform.localeManager.observe().collectAsState(initial = AppLocale.EN)

    AthleteScreenScaffold(
        title = "Settings",
        subtitle = "Appearance · language · account",
        overline = "ATHLETE OS · PREFS",
        testTag = "athlete_settings",
    ) {
        item {
            EliteCard {
                EliteAppearancePicker(
                    mode = themeMode,
                    onModeChange = { next ->
                        scope.launch { container.platform.themeSettings.setMode(next) }
                    },
                )
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
            EliteCard {
                EliteStack {
                    Text("Notifications", style = MaterialTheme.typography.titleMedium)
                    Text(
                        "Push delivery is LOCAL_DEMO until FCM production credentials exist (PENDING_HUMAN).",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    EliteButton(
                        label = "Open alerts",
                        variant = EliteButtonVariant.Secondary,
                        onClick = onOpenNotifications,
                    )
                }
            }
        }
        item {
            EliteStack {
                EliteButton("Profile", onClick = onOpenProfile, variant = EliteButtonVariant.Secondary)
                EliteButton("Telemetry", onClick = onOpenTelemetry, variant = EliteButtonVariant.Ghost)
            }
        }
    }
}
