package com.fitconnect.android.athlete.demo

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.neumorphic.EosGlassSurface
import com.fitconnect.android.designui.theme.toColor

@Composable
fun AthleteDemoBanner(
    visible: Boolean,
    modifier: Modifier = Modifier,
) {
    if (!visible) return
    val recovery = EliteSurfaceColors.RECOVERY.toColor()
    EosGlassSurface(
        modifier = modifier
            .fillMaxWidth()
            .testTag("athlete_demo_banner"),
        cornerRadius = 12.dp,
        enableBlur = false,
    ) {
        Text(
            text = "DEMO DATA · fields marked ${AthleteDemoCatalog.MODE_LABEL} are not measured",
            color = recovery,
            fontSize = 10.sp,
            fontFamily = FontFamily.Monospace,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
            style = MaterialTheme.typography.labelSmall,
        )
    }
}
