package com.fitconnect.android.designui.catalog

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import com.fitconnect.android.designui.charts.EliteChart
import com.fitconnect.android.designui.charts.EliteChartKind
import com.fitconnect.android.designui.charts.EliteChartModel
import com.fitconnect.android.designui.charts.EliteChartPoint
import com.fitconnect.android.designui.components.EliteBadge
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteChip
import com.fitconnect.android.designui.components.EliteDivider
import com.fitconnect.android.designui.components.EliteEmptyState
import com.fitconnect.android.designui.components.EliteLoading
import com.fitconnect.android.designui.components.EliteMetricCard
import com.fitconnect.android.designui.components.ElitePersonCard
import com.fitconnect.android.designui.components.EliteSegmentedControl
import com.fitconnect.android.designui.components.EliteSkeleton
import com.fitconnect.android.designui.components.EliteSlider
import com.fitconnect.android.designui.components.EliteSwitch
import com.fitconnect.android.designui.components.EliteTextField
import com.fitconnect.android.designui.theme.EliteSpace

/**
 * Living catalog for Design System 2.0 — not a product feature screen.
 * Used for Visual QA and to prove components consume tokens only.
 */
@Composable
fun DesignSystemCatalog(
    modifier: Modifier = Modifier,
) {
    var text by remember { mutableStateOf("") }
    var checked by remember { mutableStateOf(true) }
    var segment by remember { mutableIntStateOf(0) }
    var slider by remember { mutableFloatStateOf(0.4f) }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .testTag("screen_design_catalog"),
        contentPadding = PaddingValues(EliteSpace.Lg),
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Lg),
    ) {
        item {
            Text("Elite Surface", style = MaterialTheme.typography.displayMedium)
            Text(
                "Design System 2.0 catalog",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        item {
            Section("Buttons") {
                EliteButton("Primary", onClick = {})
                EliteButton("Secondary", onClick = {}, variant = EliteButtonVariant.Secondary)
                EliteButton("Ghost", onClick = {}, variant = EliteButtonVariant.Ghost)
            }
        }
        item {
            Section("Inputs") {
                EliteTextField(value = text, onValueChange = { text = it }, label = "Email")
                EliteSwitch(checked = checked, onCheckedChange = { checked = it })
                EliteSegmentedControl(
                    options = listOf("Day", "Week", "Month"),
                    selectedIndex = segment,
                    onSelected = { segment = it },
                )
                EliteSlider(value = slider, onValueChange = { slider = it })
            }
        }
        item {
            Section("Cards") {
                EliteMetricCard(label = "Readiness", value = "82")
                ElitePersonCard(title = "Person shell", subtitle = "Athlete/Coach reuse this card")
                EliteCard { Text("Solid card body", style = MaterialTheme.typography.bodyMedium) }
            }
        }
        item {
            Section("Chrome") {
                EliteBadge("LIVE")
                EliteChip(label = "Voltline", onClick = {})
                EliteSkeleton()
                EliteLoading()
                EliteDivider()
            }
        }
        item {
            Section("Chart API") {
                EliteChart(
                    model = EliteChartModel(
                        kind = EliteChartKind.READINESS,
                        points = listOf(
                            EliteChartPoint(0f, 40f),
                            EliteChartPoint(1f, 55f),
                            EliteChartPoint(2f, 48f),
                            EliteChartPoint(3f, 70f),
                            EliteChartPoint(4f, 82f),
                        ),
                        contentDescription = "Sample readiness series",
                    ),
                )
            }
        }
        item {
            EliteEmptyState(
                title = "Empty state",
                body = "Reusable empty pattern for future modules.",
                actionLabel = "Action",
                onAction = {},
            )
        }
    }
}

@Composable
private fun Section(
    title: String,
    content: @Composable () -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
        Text(title, style = MaterialTheme.typography.titleLarge)
        content()
    }
}
