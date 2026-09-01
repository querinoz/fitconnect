package com.fitconnect.android.athlete.ui.profile

import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.theme.toColor
import com.fitconnect.android.foundation.a11y.Accessibility

/**
 * Destructive actions — plain text only. No glass, no neumorphic relief, no button chrome.
 */
@Composable
fun ProfileDestructiveAction(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    testTag: String? = null,
) {
    Text(
        text = label,
        style = MaterialTheme.typography.bodyLarge,
        color = EliteSurfaceColors.ALERT.toColor(),
        modifier = modifier
            .fillMaxWidth()
            .defaultMinSize(minHeight = Accessibility.PREFERRED_TOUCH_TARGET_DP.dp)
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null,
                onClick = onClick,
            )
            .padding(vertical = Accessibility.MIN_TOUCH_TARGET_DP.dp / 2)
            .then(if (testTag != null) Modifier.testTag(testTag) else Modifier)
            .semantics {
                role = Role.Button
                contentDescription = label
            },
    )
}
