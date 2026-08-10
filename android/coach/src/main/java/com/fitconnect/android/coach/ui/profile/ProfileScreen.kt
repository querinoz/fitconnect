package com.fitconnect.android.coach.ui.profile

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
import com.fitconnect.android.coach.domain.CoachFileRef
import com.fitconnect.android.coach.domain.CoachProfile
import com.fitconnect.android.coach.ui.LocalCoachContainer
import com.fitconnect.android.coach.ui.LocalCoachSignOut
import com.fitconnect.android.coach.ui.components.CoachScreenScaffold
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import kotlinx.coroutines.launch

@Composable
fun ProfileScreen(
    onOpenPrograms: () -> Unit,
    onOpenAnalytics: () -> Unit,
    onOpenRevenue: () -> Unit,
    onOpenBookings: () -> Unit,
    onOpenSessions: () -> Unit,
    onOpenNotifications: () -> Unit,
    onOpenAi: () -> Unit = {},
) {
    val container = LocalCoachContainer.current
    val onSignedOut = LocalCoachSignOut.current
    val scope = rememberCoroutineScope()
    var profile by remember { mutableStateOf<CoachProfile?>(null) }
    var docs by remember { mutableStateOf<List<CoachFileRef>>(emptyList()) }

    LaunchedEffect(Unit) {
        container.platform.analytics.screen("coach_profile")
        profile = (container.coachRepository.profile() as? com.fitconnect.android.foundation.common.AppResult.Ok)?.value
        docs = (container.coachRepository.documents() as? com.fitconnect.android.foundation.common.AppResult.Ok)?.value.orEmpty()
    }

    CoachScreenScaffold(
        title = profile?.displayName ?: "Coach",
        subtitle = "Profile · documents · settings · modules",
        testTag = "coach_profile",
    ) {
        profile?.let { p ->
            item {
                EliteCard {
                    Text(if (p.verificationBadge) "Verified coach" else "Coach", style = MaterialTheme.typography.labelLarge)
                    Text(p.bio, style = MaterialTheme.typography.bodyLarge)
                    Text(
                        "Specialties: ${p.specialties.joinToString()} · ${p.timezone} · ${p.languages.joinToString()}",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }
            }
        }
        item { Text("Sports Intelligence", style = MaterialTheme.typography.titleMedium) }
        items(
            container.coachSports.allSurfaces().take(4),
            key = { it.sport.id.value },
        ) { surface ->
            EliteCard {
                Text(surface.sport.displayName, style = MaterialTheme.typography.titleMedium)
                Text(surface.performanceSummary, style = MaterialTheme.typography.bodyMedium)
                Text(
                    "Templates: ${surface.programTemplates.joinToString().ifBlank { "—" }}",
                    style = MaterialTheme.typography.bodySmall,
                )
                if (surface.riskAlerts.isNotEmpty()) {
                    Text(surface.riskAlerts.first(), color = MaterialTheme.colorScheme.error)
                }
            }
        }
        item { Text("Workspace", style = MaterialTheme.typography.titleMedium) }
        item {
            EliteButton("Programs & builder", onClick = onOpenPrograms, variant = EliteButtonVariant.Secondary)
            EliteButton("Sessions", onClick = onOpenSessions, variant = EliteButtonVariant.Ghost)
            EliteButton("Bookings", onClick = onOpenBookings, variant = EliteButtonVariant.Ghost)
            EliteButton("Analytics", onClick = onOpenAnalytics, variant = EliteButtonVariant.Ghost)
            EliteButton("Revenue", onClick = onOpenRevenue, variant = EliteButtonVariant.Ghost)
            EliteButton("Coach AI", onClick = onOpenAi, variant = EliteButtonVariant.Secondary)
            EliteButton("Notifications", onClick = onOpenNotifications, variant = EliteButtonVariant.Ghost)
        }
        item { Text("Documents & exercise library", style = MaterialTheme.typography.titleMedium) }
        items(docs, key = { it.id }) { file ->
            EliteCard {
                Text(file.name, style = MaterialTheme.typography.titleMedium)
                Text("${file.category} · ${file.mime}", style = MaterialTheme.typography.bodyMedium)
            }
        }
        item {
            Text(
                "Settings: theme/locale use Core Platform preferences. AI is decision support only.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        item {
            EliteButton(
                label = "Sign out",
                variant = EliteButtonVariant.Ghost,
                modifier = Modifier.testTag("coach_sign_out"),
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
