package com.fitconnect.android.athlete.ui.activity

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import com.fitconnect.android.athlete.ui.LocalAthleteContainer
import com.fitconnect.android.athlete.ui.components.AthleteScreenScaffold
import com.fitconnect.android.capture.route.CanonicalRouteRepository
import com.fitconnect.android.capture.route.GpsQualityResolver
import com.fitconnect.android.capture.route.GpsQualityUi
import com.fitconnect.android.designui.components.EliteStack
import com.fitconnect.android.designui.maps.EliteMapMode
import com.fitconnect.android.designui.maps.EliteMapPhase
import com.fitconnect.android.designui.maps.FitConnectRouteMap
import com.fitconnect.android.designui.neumorphic.EosPremiumCard
import com.fitconnect.shared.geo.RouteMath

@Composable
fun ActivityRouteDetailScreen(activityId: String) {
    val container = LocalAthleteContainer.current
    val repo = remember(container.gpsRouteStore) {
        CanonicalRouteRepository(container.gpsRouteStore)
    }
    var sessionPhase by remember { mutableStateOf("UNKNOWN") }
    var distanceM by remember { mutableStateOf<Double?>(null) }
    var durationMs by remember { mutableStateOf<Long?>(null) }
    val points by repo.observeAcceptedRoute(activityId).collectAsState(initial = emptyList())

    LaunchedEffect(activityId) {
        val session = repo.loadSession(activityId)
        sessionPhase = session?.phase ?: "MISSING"
        distanceM = session?.distanceM
        durationMs = session?.elapsedMs ?: session?.movingMs
    }

    val avgSpeed = remember(points, durationMs) {
        val moving = durationMs
        if (moving != null && moving > 0 && points.size >= 2) {
            RouteMath.polylineDistanceM(points) / (moving / 1000.0)
        } else {
            null
        }
    }
    val phase = when {
        points.size >= 2 -> EliteMapPhase.Success
        points.size == 1 -> EliteMapPhase.Success
        sessionPhase == "MISSING" -> EliteMapPhase.Empty
        else -> EliteMapPhase.Empty
    }

    AthleteScreenScaffold(
        title = "Route",
        subtitle = "Persisted GPS · offline capable",
        overline = "ATHLETE OS · MAP",
        testTag = "athlete_activity_route_detail",
    ) {
        item {
            EosPremiumCard(modifier = Modifier.fillMaxWidth()) {
                EliteStack {
                    Text(
                        "Activity $activityId · $sessionPhase",
                        style = MaterialTheme.typography.labelMedium,
                        modifier = Modifier.testTag("route_detail_session"),
                    )
                    FitConnectRouteMap(
                        points = points,
                        mode = EliteMapMode.ROUTE,
                        phase = phase,
                        completed = true,
                        followEnabled = false,
                        qualityLabel = GpsQualityResolver.label(GpsQualityUi.GOOD),
                        distanceM = distanceM ?: points.takeIf { it.size >= 2 }?.let {
                            RouteMath.polylineDistanceM(it)
                        },
                        durationMs = durationMs,
                        avgSpeedMps = avgSpeed,
                        modifier = Modifier.testTag("route_detail_map"),
                    )
                }
            }
        }
    }
}
