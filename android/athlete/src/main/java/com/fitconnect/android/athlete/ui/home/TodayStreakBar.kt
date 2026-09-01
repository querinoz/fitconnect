package com.fitconnect.android.athlete.ui.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.neumorphic.EosGlassSurface
import com.fitconnect.android.designui.neumorphic.EosNeumorphicColors
import com.fitconnect.android.designui.theme.EliteMonoTextStyle
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.toColor

@Composable
fun TodayStreakBar(
    days: Int,
    modifier: Modifier = Modifier,
) {
    if (days <= 0) return
    EosGlassSurface(
        modifier = modifier
            .fillMaxWidth()
            .testTag("today_streak_bar"),
        cornerRadius = 20.dp,
        enableBlur = false,
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = EliteSpace.Md, vertical = EliteSpace.Sm),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = "PERFORMANCE STREAK",
                style = EliteMonoTextStyle.copy(fontSize = 10.sp),
                color = EosNeumorphicColors.TextMuted,
            )
            Text(
                text = "$days DAYS",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                color = EliteSurfaceColors.RECOVERY.toColor(),
            )
        }
    }
}
