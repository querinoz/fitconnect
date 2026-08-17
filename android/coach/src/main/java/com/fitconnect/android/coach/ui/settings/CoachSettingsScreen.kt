package com.fitconnect.android.coach.ui.settings

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.platform.LocalContext
import com.fitconnect.android.coach.ui.LocalCoachContainer
import com.fitconnect.android.coach.ui.components.CoachScreenScaffold
import com.fitconnect.android.designui.components.EliteAppearancePicker
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteLanguagePicker
import com.fitconnect.android.foundation.i18n.AppLocale
import com.fitconnect.android.foundation.i18n.LocaleApplier
import com.fitconnect.android.foundation.theme.ThemeMode
import kotlinx.coroutines.launch

@Composable
fun CoachSettingsScreen() {
    val container = LocalCoachContainer.current
    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    val themeMode by container.platform.themeSettings.observe().collectAsState(initial = ThemeMode.SYSTEM)
    val locale by container.platform.localeManager.observe().collectAsState(initial = AppLocale.EN)

    CoachScreenScaffold(
        title = "Settings",
        subtitle = "Appearance · language",
        overline = "COACH OS · PREFS",
        testTag = "coach_settings",
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
            com.fitconnect.android.designui.components.IdentityConnectedAccounts(
                authRepository = container.platform.authRepository,
            )
        }
        item {
            EliteCard {
                Text(
                    "FCM production remains PENDING_HUMAN. This surface stores preferences on-device.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}
