package com.fitconnect.android.athlete.ui.activity

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import com.fitconnect.android.athlete.ui.LocalAthleteContainer
import com.fitconnect.android.athlete.ui.components.AthleteScreenScaffold
import com.fitconnect.android.athlete.data.canonicalAthleteId
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.neumorphic.EosPremiumCard
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.sports.domain.gpsSupported
import kotlinx.coroutines.launch

/**
 * Dedicated GPS / Routes hub — TRAIN may deep-link here; not embedded in the training mega-scroll.
 */
@Composable
fun RoutesHubScreen(
    onOpenRoute: (String) -> Unit = {},
) {
    val container = LocalAthleteContainer.current
    val scope = rememberCoroutineScope()
    var sportLabel by remember { mutableStateOf<String?>(null) }
    var gpsOk by remember { mutableStateOf(false) }
    var activeId by remember { mutableStateOf<String?>(null) }
    var hint by remember { mutableStateOf<String?>(null) }

    fun reload() {
        scope.launch {
            when (val id = container.sportsIdentity.getIdentity()) {
                is AppResult.Ok -> {
                    val sport = id.value.primarySport
                    val def = sport?.let { container.sportsEngine.profile(it) }
                    sportLabel = def?.displayName
                    gpsOk = def?.gpsSupported() == true
                }
                is AppResult.Err -> {
                    sportLabel = null
                    gpsOk = false
                }
            }
            val userId = container.platform.sessionStore.canonicalAthleteId().ifBlank { "local" }
            activeId = container.gpsRouteStore.activeSession(userId)?.activityId
            hint = if (!gpsOk) {
                "Active sport has no GPS capability — open TRAIN and pick an endurance sport to capture routes."
            } else {
                null
            }
        }
    }

    LaunchedEffect(Unit) {
        container.platform.analytics.screen("athlete_routes")
        reload()
    }

    AthleteScreenScaffold(
        title = "Routes",
        subtitle = sportLabel?.let { "GPS profile · $it" } ?: "GPS / routes",
        testTag = "athlete_routes",
    ) {
        item {
            EosPremiumCard(modifier = Modifier.fillMaxWidth().testTag("routes_hub_status")) {
                Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                    EliteSysLabel("GPS CAPABILITY")
                    Text(
                        if (gpsOk) {
                            "GPS supported for active sport — capture during TRAIN sessions."
                        } else {
                            "No GPS for current Active Training Sport."
                        },
                        style = MaterialTheme.typography.bodyMedium,
                    )
                    hint?.let {
                        Text(
                            it,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                    activeId?.let { id ->
                        Text("Active session · $id", style = MaterialTheme.typography.bodySmall)
                        EliteButton(
                            label = "OPEN ROUTE",
                            onClick = { onOpenRoute(id) },
                            variant = EliteButtonVariant.Primary,
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("routes_open_active"),
                        )
                    }
                    if (activeId == null) {
                        Text(
                            "No stored route session yet. Start a GPS-capable TRAIN session to create one.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.testTag("routes_empty"),
                        )
                    }
                }
            }
        }
    }
}
