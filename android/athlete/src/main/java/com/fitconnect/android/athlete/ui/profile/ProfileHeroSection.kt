package com.fitconnect.android.athlete.ui.profile

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.fitconnect.android.designui.charts.EliteChartPalette
import com.fitconnect.android.designui.components.EliteHexatar
import com.fitconnect.android.designui.components.EliteHexatarProfile
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.components.EliteTierBadge
import com.fitconnect.android.designui.components.EliteTierChip
import com.fitconnect.android.designui.identity.PatentRank
import com.fitconnect.android.designui.neumorphic.EosGlassBadge
import com.fitconnect.android.designui.neumorphic.EosGlassSurface
import com.fitconnect.android.designui.neumorphic.EosNeumorphicColors
import com.fitconnect.android.designui.theme.EliteSpace

@Composable
fun ProfileHeroSection(
    userId: String,
    displayName: String,
    level: Int,
    totalXp: Int,
    rank: PatentRank?,
    hexatarNote: String,
    streakLabel: String?,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Box(modifier = Modifier.padding(top = EliteSpace.Sm, bottom = EliteSpace.Xs)) {
            EliteHexatar(
                userId = userId,
                contentDescription = displayName,
                diameter = EliteHexatarProfile,
                modifier = Modifier.testTag("profile_hexatar"),
            )
            EosGlassBadge(
                text = "$totalXp XP",
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .offset(x = 12.dp, y = (-8).dp)
                    .testTag("profile_xp_badge"),
                contentColor = EosNeumorphicColors.TextPrimary,
            )
            EliteTierBadge(
                rank = rank,
                modifier = Modifier.align(Alignment.BottomEnd),
            )
        }
        EosGlassSurface(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = EliteSpace.Md)
                .testTag("profile_hero_glass_overlay"),
            cornerRadius = 16.dp,
            enableBlur = false,
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = EliteSpace.Md, vertical = EliteSpace.Sm),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Text(
                    text = displayName,
                    style = MaterialTheme.typography.headlineSmall,
                    textAlign = TextAlign.Center,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("elite_player_card"),
                )
                Text(
                    text = "LEVEL ${level.toString().padStart(2, '0')}",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = EliteChartPalette.Hero,
                )
                rank?.let { EliteTierChip(it) }
                EliteSysLabel(
                    hexatarNote,
                    modifier = Modifier.testTag("profile_hexatar_note"),
                )
                streakLabel?.let { EliteSysLabel(it) }
            }
        }
    }
}
