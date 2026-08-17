package com.fitconnect.android.designui.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import com.fitconnect.android.designui.maps.EliteMapMode
import com.fitconnect.android.designui.maps.EliteRouteMap
import com.fitconnect.android.designui.maps.EliteRouteVertex
import com.fitconnect.android.designui.theme.EliteSpace

@Composable
fun EliteShareCard(
    sport: String,
    distanceKm: String,
    elapsed: String,
    pace: String,
    hr: String,
    score: String,
    points: List<EliteRouteVertex>,
    modifier: Modifier = Modifier,
) {
    EliteCard(
        variant = EliteCardVariant.Glass,
        modifier = modifier
            .fillMaxWidth()
            .testTag("activity_share_card"),
    ) {
        EliteStack(spacing = EliteSpace.Md) {
            EliteSysLabel("FITCONNECT · PERFORMANCE COMPLETE")
            Text(sport.uppercase(), style = MaterialTheme.typography.titleLarge)
            EliteStack {
                EliteMetricCard(label = "Distance", value = distanceKm)
                EliteMetricCard(label = "Time", value = elapsed)
                EliteMetricCard(label = "Pace", value = pace)
                EliteMetricCard(label = "HR", value = hr)
                EliteMetricCard(label = "Score", value = score)
            }
            if (points.size >= 2) {
                EliteRouteMap(points = points, mode = EliteMapMode.ROUTE)
            }
        }
    }
}
