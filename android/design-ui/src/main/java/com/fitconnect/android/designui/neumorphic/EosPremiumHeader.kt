package com.fitconnect.android.designui.neumorphic

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fitconnect.android.designui.brand.EosFitConnectLockup
import com.fitconnect.android.designui.theme.EliteMonoTextStyle
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.isCompactAthleteHeader

@Composable
fun EosPremiumHeader(
    modifier: Modifier = Modifier,
    onLogoTap: () -> Unit = {},
    trailing: @Composable RowScope.() -> Unit = {},
) {
    val compact = isCompactAthleteHeader()
    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(EosNeumorphicColors.Floor)
            .statusBarsPadding()
            .padding(horizontal = EliteSpace.Inset, vertical = EliteSpace.Lg)
            .testTag("eos_premium_header"),
        horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Row(
            modifier = Modifier
                .weight(1f)
                .clickable(onClick = onLogoTap)
                .semantics { contentDescription = "FitConnect home" },
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
        ) {
            EosFitConnectLockup(
                markSize = 28.dp,
                wordmarkSize = 16.sp,
            )
        }
        if (!compact) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(EliteSpace.Xs),
            ) {
                Box(
                    modifier = Modifier
                        .size(6.dp)
                        .background(EosNeumorphicColors.Voltline, CircleShape),
                )
                Text(
                    text = "ELITE_OS // LIVE",
                    color = EosNeumorphicColors.TextMuted,
                    style = EliteMonoTextStyle.copy(
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
        }
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(EliteSpace.Xs),
        ) {
            trailing()
        }
    }
}
