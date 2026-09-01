package com.fitconnect.android.athlete.ui.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.style.TextOverflow
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.neumorphic.EosGlassBadge
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.auth.DemoPersona

@Composable
fun TodayEditorialHeader(
    greeting: String,
    modifier: Modifier = Modifier,
    showDemoBadge: Boolean = true,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .testTag("today_editorial_header"),
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Xs),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            EliteSysLabel("ATHLETE OS · TODAY")
            if (showDemoBadge) {
                EosGlassBadge(
                    text = DemoPersona.MODE_LABEL,
                    modifier = Modifier.testTag("athlete_local_demo_badge"),
                )
            }
        }
        Text(
            text = greeting,
            style = MaterialTheme.typography.headlineMedium,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis,
        )
    }
}
