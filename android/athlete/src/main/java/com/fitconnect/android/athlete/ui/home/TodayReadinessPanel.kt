package com.fitconnect.android.athlete.ui.home

import androidx.compose.foundation.layout.Column
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
import com.fitconnect.android.athlete.demo.AthleteDemoCatalog
import com.fitconnect.android.athlete.domain.TodayReadinessUi
import com.fitconnect.android.designui.neumorphic.EliteReadinessNeumorphicCard
import com.fitconnect.android.designui.neumorphic.ReadinessTelemetry
import com.fitconnect.android.designui.theme.EliteSpace

@Composable
fun TodayReadinessPanel(
    ui: TodayReadinessUi,
    athleteLabel: String?,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(EliteSpace.Xs),
    ) {
        EliteReadinessNeumorphicCard(
            telemetry = ReadinessTelemetry(
                readinessPercent = ui.readinessPercent.value,
                hrvMs = ui.hrvMs.value,
                load = ui.load.value,
                sleepLabel = ui.sleepLabel.value,
            ),
            athleteLabel = athleteLabel,
            modifier = Modifier
                .testTag("today_readiness_neumorphic")
                .padding(horizontal = 0.dp),
        )
        if (ui.isAnyDemo) {
            TodayProvenanceFootnote(ui)
        }
    }
}

@Composable
private fun TodayProvenanceFootnote(ui: TodayReadinessUi) {
    val lines = buildList {
        add(provenanceLine("Readiness", ui.readinessPercent))
        add(provenanceLine("HRV", ui.hrvMs))
        add(provenanceLine("Load", ui.load))
        add(provenanceLine("Sleep", ui.sleepLabel))
    }
    Text(
        text = lines.joinToString(" · "),
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        fontSize = 9.sp,
        fontFamily = FontFamily.Monospace,
        modifier = Modifier
            .fillMaxWidth()
            .testTag("today_readiness_provenance")
            .padding(horizontal = EliteSpace.Lg),
    )
}

private fun <T> provenanceLine(label: String, field: com.fitconnect.android.athlete.domain.Provenanced<T>): String {
    val tag = if (field.isDemo) AthleteDemoCatalog.MODE_LABEL else field.sourceLabel.orEmpty()
    return "$label:$tag"
}
