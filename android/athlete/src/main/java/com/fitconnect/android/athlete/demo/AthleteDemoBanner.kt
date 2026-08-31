package com.fitconnect.android.athlete.demo

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.theme.toColor

@Composable
fun AthleteDemoBanner(
    visible: Boolean,
    modifier: Modifier = Modifier,
) {
    if (!visible) return
    Text(
        text = "DEMO DATA · fields marked ${AthleteDemoCatalog.MODE_LABEL} are not measured",
        color = EliteSurfaceColors.RECOVERY.toColor(),
        fontSize = 10.sp,
        fontFamily = FontFamily.Monospace,
        modifier = modifier
            .fillMaxWidth()
            .testTag("athlete_demo_banner")
            .background(
                EliteSurfaceColors.RECOVERY.toColor().copy(alpha = 0.08f),
                RoundedCornerShape(8.dp),
            )
            .border(
                width = 1.dp,
                color = EliteSurfaceColors.RECOVERY.toColor().copy(alpha = 0.25f),
                shape = RoundedCornerShape(8.dp),
            )
            .padding(horizontal = 12.dp, vertical = 8.dp),
        style = MaterialTheme.typography.labelSmall,
    )
}
