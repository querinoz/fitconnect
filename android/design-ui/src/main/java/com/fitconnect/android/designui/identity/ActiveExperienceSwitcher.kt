package com.fitconnect.android.designui.identity

import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.RadioButton
import androidx.compose.material3.RadioButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteStack
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.neumorphic.EosPremiumCard
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.authz.UserRole

/**
 * Profile ACTIVE EXPERIENCE switcher — capability-gated, not a second login.
 */
@Composable
fun ActiveExperienceSwitcher(
    capabilities: Set<UserRole>,
    activeMode: UserRole,
    switching: Boolean = false,
    onSelectMode: (UserRole) -> Unit,
    onUnlockCoach: (() -> Unit)? = null,
    modifier: Modifier = Modifier,
) {
    val hasAthlete = capabilities.contains(UserRole.ATHLETE)
    val hasCoach = capabilities.contains(UserRole.COACH)
    if (!hasAthlete && !hasCoach) return

    EosPremiumCard(modifier = modifier.testTag("active_experience_switcher")) {
        EliteStack(spacing = EliteSpace.Md) {
            EliteSysLabel(text = "ACTIVE EXPERIENCE")
            if (hasAthlete) {
                ModeOption(
                    title = "Athlete",
                    subtitle = "Training, recovery, performance & health data",
                    selected = activeMode == UserRole.ATHLETE,
                    enabled = !switching,
                    testTag = "mode_option_athlete",
                    announcement = if (activeMode == UserRole.ATHLETE) "Athlete mode selected" else "Switch to Athlete mode",
                    onClick = { onSelectMode(UserRole.ATHLETE) },
                )
            }
            if (hasCoach) {
                ModeOption(
                    title = "Coach",
                    subtitle = "Athletes, programs, sessions & analytics",
                    selected = activeMode == UserRole.COACH,
                    enabled = !switching,
                    testTag = "mode_option_coach",
                    announcement = if (activeMode == UserRole.COACH) "Coach mode selected" else "Switch to Coach mode",
                    onClick = { onSelectMode(UserRole.COACH) },
                )
            } else if (onUnlockCoach != null) {
                EliteStack(spacing = EliteSpace.Sm) {
                    Text(
                        text = "Coach mode unavailable",
                        style = MaterialTheme.typography.titleSmall,
                        color = MaterialTheme.colorScheme.onSurface,
                    )
                    Text(
                        text = "Upgrade your plan to unlock the Coach experience.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    EliteButton(
                        label = "VIEW PLANS",
                        onClick = onUnlockCoach,
                        variant = EliteButtonVariant.Secondary,
                        modifier = Modifier.testTag("unlock_coach_cta"),
                    )
                }
            }
            if (switching) {
                Text(
                    text = if (activeMode == UserRole.COACH) {
                        "Switching to Athlete…"
                    } else {
                        "Switching to Coach…"
                    },
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.testTag("mode_switching_label"),
                )
            }
        }
    }
}

@Composable
private fun ModeOption(
    title: String,
    subtitle: String,
    selected: Boolean,
    enabled: Boolean,
    testTag: String,
    announcement: String,
    onClick: () -> Unit,
) {
    val shape = RoundedCornerShape(16.dp)
    val borderColor = if (selected) {
        MaterialTheme.colorScheme.primary.copy(alpha = 0.7f)
    } else {
        MaterialTheme.colorScheme.outline.copy(alpha = 0.35f)
    }
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, borderColor, shape)
            .clickable(enabled = enabled && !selected, onClick = onClick)
            .padding(EliteSpace.Md)
            .testTag(testTag)
            .semantics {
                this.role = Role.RadioButton
                this.selected = selected
                contentDescription = announcement
            },
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
    ) {
        RadioButton(
            selected = selected,
            onClick = if (enabled && !selected) onClick else null,
            colors = RadioButtonDefaults.colors(
                selectedColor = MaterialTheme.colorScheme.primary,
            ),
        )
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onSurface,
            )
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}
