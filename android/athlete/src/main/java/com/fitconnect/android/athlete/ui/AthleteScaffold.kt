package com.fitconnect.android.athlete.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.WindowInsetsSides
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.only
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Analytics
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.outlined.Analytics
import androidx.compose.material.icons.outlined.EmojiEvents
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.nestedscroll.NestedScrollConnection
import androidx.compose.ui.input.nestedscroll.NestedScrollSource
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.fitconnect.android.athlete.R
import com.fitconnect.android.athlete.data.LocalAthleteRepository
import com.fitconnect.android.athlete.di.AthleteContainer
import com.fitconnect.android.athlete.domain.resolvePatentStatus
import com.fitconnect.android.athlete.navigation.AthleteDest
import com.fitconnect.android.athlete.navigation.AthleteNavHost
import com.fitconnect.android.capture.LiveActivityPhase
import com.fitconnect.android.design.EliteSurfaceAtmosphere
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.design.EliteSurfaceInstrument
import com.fitconnect.android.designui.atmosphere.HoneycombAtmosphere
import com.fitconnect.android.designui.atmosphere.LocalAtmosphereMotionScale
import com.fitconnect.android.designui.atmosphere.LocalHoneycombEmptyBoost
import com.fitconnect.android.designui.components.EliteCinematicBackground
import com.fitconnect.android.designui.components.EliteFloatingNavBar
import com.fitconnect.android.designui.components.EliteHeader
import com.fitconnect.android.designui.components.EliteNavItem
import com.fitconnect.android.designui.components.EliteNavRail
import com.fitconnect.android.designui.components.EliteOfflineBanner
import com.fitconnect.android.designui.components.EliteTrainFab
import com.fitconnect.android.designui.identity.PatentSignals
import com.fitconnect.android.designui.identity.PatentStatus
import com.fitconnect.android.designui.theme.LocalHoneycombIntensity
import com.fitconnect.android.designui.theme.toColor
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.theme.HoneycombIntensity
import com.fitconnect.ascend.domain.StreakKind
import java.time.LocalTime
import java.time.format.DateTimeFormatter

val LocalAthleteContainer = staticCompositionLocalOf<AthleteContainer> {
    error("AthleteContainer not provided")
}

val LocalAthleteSignOut = staticCompositionLocalOf<() -> Unit> {
    error("Sign-out handler not provided")
}

class AthleteHeaderController {
    var onScrollToTop: () -> Unit = {}
}

val LocalAthleteHeaderController = staticCompositionLocalOf { AthleteHeaderController() }

val LocalAthletePatentStatus = staticCompositionLocalOf { PatentStatus.none() }

@Composable
fun AthleteOsApp(
    container: AthleteContainer,
    onSignedOut: () -> Unit = {},
) {
    val navController = rememberNavController()
    val backStack by navController.currentBackStackEntryAsState()
    val current = backStack?.destination?.route
    val online by container.platform.connectivity.online.collectAsState()
    val wearEnvelope by container.telemetry.wearInbox.lastEnvelope.collectAsState()
    val honeycomb by container.platform.themeSettings.observeHoneycomb()
        .collectAsState(initial = HoneycombIntensity.SUBTLE)
    val live by container.liveActivity.state.collectAsState()
    val emptyBoost = remember { mutableStateOf(false) }
    val motionScale = remember { mutableFloatStateOf(1f) }
    val sessionActive = live.phase != LiveActivityPhase.IDLE &&
        live.phase != LiveActivityPhase.ENDED
    motionScale.floatValue = if (sessionActive) {
        EliteSurfaceAtmosphere.HONEYCOMB_SESSION_SCALE
    } else {
        1f
    }
    val hideNav = current?.startsWith("athlete/training/") == true ||
        (current == AthleteDest.ACTIVITY.route && live.phase != LiveActivityPhase.IDLE)
    val onBottomTab = AthleteDest.bottomTabs.any { it.route == current }
    val showHeader = onBottomTab && !hideNav
    var cacheStamp by remember { mutableStateOf<String?>(null) }
    var patentStatus by remember { mutableStateOf(PatentStatus.none()) }
    var headerName by remember { mutableStateOf("Athlete") }
    var streakDays by remember { mutableStateOf<Int?>(null) }
    val headerController = remember { AthleteHeaderController() }
    val density = LocalDensity.current
    val headerHeight = EliteSurfaceInstrument.HEADER_DP.dp
    val headerLimitPx = with(density) { -headerHeight.toPx() }
    var headerOffsetPx by remember { mutableFloatStateOf(0f) }
    val headerConnection = remember(headerLimitPx) {
        object : NestedScrollConnection {
            override fun onPreScroll(available: Offset, source: NestedScrollSource): Offset {
                val next = (headerOffsetPx + available.y).coerceIn(headerLimitPx, 0f)
                val consumed = next - headerOffsetPx
                headerOffsetPx = next
                return Offset(0f, consumed)
            }
        }
    }
    val headerCollapse = if (headerLimitPx == 0f) {
        0f
    } else {
        (headerOffsetPx / headerLimitPx).coerceIn(0f, 1f)
    }
    LaunchedEffect(current) {
        headerOffsetPx = 0f
    }
    LaunchedEffect(online) {
        if (!online && cacheStamp == null) {
            cacheStamp = LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm"))
        }
        if (online) cacheStamp = null
    }
    LaunchedEffect(wearEnvelope) {
        wearEnvelope?.let { container.liveCoordinator.onRemoteEnvelope(it) }
    }
    LaunchedEffect(current) {
        val sessions = (container.athleteRepository.sessions() as? AppResult.Ok)?.value.orEmpty()
        val snap = container.ascend.snapshot(LocalAthleteRepository.ATHLETE_ID)
        val streak = snap.streaks.firstOrNull { it.kind == StreakKind.PERFORMANCE }?.days ?: 0
        streakDays = streak.takeIf { it > 0 }
        val profile = (container.athleteRepository.profile() as? AppResult.Ok)?.value
        headerName = profile?.displayName ?: "Athlete"
        patentStatus = resolvePatentStatus(
            container.platform.keyValueStore,
            PatentSignals(sessionCount = sessions.size, streakDays = streak),
        )
    }

    fun goHome() {
        navController.navigate(AthleteDest.HOME.route) {
            popUpTo(navController.graph.findStartDestination().id) { saveState = true }
            launchSingleTop = true
            restoreState = true
        }
    }

    val widthDp = LocalConfiguration.current.screenWidthDp
    val compact = widthDp < 600
    val expandedRail = widthDp >= 1240
    val useRail = !compact
    val navItems = AthleteDest.bottomTabs.map { dest ->
        val selected = current?.startsWith(dest.route) == true ||
            (dest == AthleteDest.PROFILE && current == AthleteDest.SETTINGS.route)
        EliteNavItem(
            label = dest.label,
            icon = when (dest) {
                AthleteDest.HOME -> if (selected) Icons.Filled.Home else Icons.Outlined.Home
                AthleteDest.DISCOVER -> if (selected) Icons.Filled.Analytics else Icons.Outlined.Analytics
                AthleteDest.VAULT -> if (selected) Icons.Filled.EmojiEvents else Icons.Outlined.EmojiEvents
                AthleteDest.PROFILE -> if (selected) Icons.Filled.Person else Icons.Outlined.Person
                else -> Icons.Outlined.Home
            },
            selected = selected,
            onClick = {
                navController.navigate(dest.route) {
                    popUpTo(navController.graph.findStartDestination().id) {
                        saveState = true
                    }
                    launchSingleTop = true
                    restoreState = true
                }
            },
            testTag = "athlete_tab_${dest.name.lowercase()}",
        )
    }

    CompositionLocalProvider(
        LocalAthleteContainer provides container,
        LocalAthleteSignOut provides onSignedOut,
        LocalHoneycombIntensity provides honeycomb,
        LocalHoneycombEmptyBoost provides emptyBoost,
        LocalAtmosphereMotionScale provides motionScale,
        LocalAthleteHeaderController provides headerController,
        LocalAthletePatentStatus provides patentStatus,
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(EliteSurfaceColors.FLOOR.toColor()),
        ) {
            if (current == AthleteDest.HOME.route) {
                EliteCinematicBackground(videoResId = R.raw.demo_motion_clip, alpha = 0.28f)
            }
            HoneycombAtmosphere(strokeColor = MaterialTheme.colorScheme.primary)
            Scaffold(
                modifier = Modifier
                    .fillMaxSize()
                    .testTag("athlete_os")
                    .then(
                        if (showHeader) {
                            Modifier.nestedScroll(headerConnection)
                        } else {
                            Modifier
                        },
                    ),
                containerColor = Color.Transparent,
                contentWindowInsets = WindowInsets.safeDrawing.only(
                    WindowInsetsSides.Horizontal + WindowInsetsSides.Top,
                ),
                topBar = {
                    Column(modifier = Modifier.fillMaxWidth()) {
                        if (!online) {
                            EliteOfflineBanner(
                                cacheLabel = cacheStamp?.let { "CACHE $it" } ?: "CACHE UNAVAILABLE",
                                modifier = Modifier.testTag("athlete_offline_banner"),
                            )
                        }
                        if (showHeader) {
                            val collapse = headerCollapse
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(headerHeight * (1f - collapse))
                                    .clipToBounds(),
                            ) {
                                EliteHeader(
                                    userId = LocalAthleteRepository.ATHLETE_ID,
                                    userName = headerName,
                                    streakDays = streakDays,
                                    rank = patentStatus.rank,
                                    collapsedFraction = collapse,
                                    onLogoTap = {
                                        if (current == AthleteDest.HOME.route) {
                                            headerController.onScrollToTop()
                                        } else {
                                            goHome()
                                        }
                                    },
                                    onAvatarTap = {
                                        navController.navigate(AthleteDest.PROFILE.route) {
                                            popUpTo(navController.graph.findStartDestination().id) {
                                                saveState = true
                                            }
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    },
                                    onNotificationsTap = {
                                        navController.navigate(AthleteDest.NOTIFICATIONS.route)
                                    },
                                )
                            }
                        }
                    }
                },
                bottomBar = {
                    if (!hideNav && !useRail) {
                        EliteFloatingNavBar(
                            modifier = Modifier.testTag("athlete_bottom_nav"),
                            items = navItems,
                        )
                    }
                },
                floatingActionButton = {
                    if (!hideNav) {
                        EliteTrainFab(
                            onClick = {
                                navController.navigate(AthleteDest.ACTIVITY.route)
                            },
                            expanded = expandedRail,
                        )
                    }
                },
                content = { padding ->
                    Row(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(padding),
                    ) {
                        if (!hideNav && useRail) {
                            EliteNavRail(
                                items = navItems,
                                expanded = expandedRail,
                                modifier = Modifier.testTag("athlete_nav_rail"),
                            )
                        }
                        Box(
                            modifier = Modifier.weight(1f),
                            content = { AthleteNavHost(navController = navController) },
                        )
                    }
                },
            )
        }
    }
}
