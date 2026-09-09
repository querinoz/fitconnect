package com.fitconnect.android.coach.ui

import android.content.Intent
import androidx.activity.ComponentActivity
import androidx.activity.compose.LocalActivity
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.WindowInsetsSides
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.only
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.DynamicFeed
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.TripOrigin
import androidx.compose.material.icons.outlined.Dashboard
import androidx.compose.material.icons.outlined.DynamicFeed
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.TripOrigin
import androidx.compose.material3.FabPosition
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.testTag
import androidx.core.util.Consumer
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.fitconnect.android.coach.di.CoachContainer
import com.fitconnect.android.coach.navigation.CoachDest
import com.fitconnect.android.coach.navigation.CoachNavHost
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.components.EliteNavItem
import com.fitconnect.android.designui.components.EliteNavRail
import com.fitconnect.android.designui.components.EliteOfflineBanner
import com.fitconnect.android.designui.neumorphic.EosPremiumBottomNavigation
import com.fitconnect.android.designui.neumorphic.EosTrainActionFab
import com.fitconnect.android.designui.theme.toColor
import kotlinx.coroutines.delay

val LocalCoachContainer = staticCompositionLocalOf<CoachContainer> {
    error("CoachContainer not provided")
}

val LocalCoachSignOut = staticCompositionLocalOf<() -> Unit> {
    error("Sign-out handler not provided")
}

val LocalCoachModeSwitch = staticCompositionLocalOf<(com.fitconnect.android.foundation.authz.UserRole) -> Unit> {
    error("Mode-switch handler not provided")
}

@Composable
fun CoachOsApp(
    container: CoachContainer,
    onSignedOut: () -> Unit = {},
    onActiveModeChange: (com.fitconnect.android.foundation.authz.UserRole) -> Unit = {},
) {
    val navController = rememberNavController()
    val activity = checkNotNull(LocalActivity.current) as ComponentActivity
    // Consume pending nested coach deep links (shell lands on HOME first).
    LaunchedEffect(navController) {
        fun tryHandle(uri: android.net.Uri?) {
            if (uri == null) return
            val path = uri.path.orEmpty()
            if (!path.contains("coach")) return
            navController.handleDeepLink(Intent(Intent.ACTION_VIEW, uri))
            com.fitconnect.android.foundation.navigation.DeepLinkInbox.clearIf(uri)
        }
        tryHandle(com.fitconnect.android.foundation.navigation.DeepLinkInbox.peek())
        com.fitconnect.android.foundation.navigation.DeepLinkInbox.uris.collect { uri ->
            tryHandle(uri)
        }
    }
    DisposableEffect(navController, activity) {
        val listener = Consumer<Intent> { intent ->
            navController.handleDeepLink(intent)
            intent.data?.let { com.fitconnect.android.foundation.navigation.DeepLinkInbox.clearIf(it) }
        }
        activity.addOnNewIntentListener(listener)
        onDispose { activity.removeOnNewIntentListener(listener) }
    }
    val backStack by navController.currentBackStackEntryAsState()
    val current = backStack?.destination?.route
    val online by container.platform.connectivity.online.collectAsState()
    var pendingOffline by remember { mutableStateOf(0) }
    LaunchedEffect(online) {
        if (online) {
            pendingOffline = 0
        } else {
            while (true) {
                pendingOffline = container.platform.offline.pendingCount()
                delay(2_000)
            }
        }
    }

    val onBottomTab = CoachDest.bottomTabs.any { it.route == current } ||
        current == CoachDest.OVERVIEW.route ||
        current == CoachDest.INBOX.route ||
        current == CoachDest.ANALYTICS.route

    val widthDp = LocalConfiguration.current.screenWidthDp
    val compact = widthDp < 600
    val expandedRail = widthDp >= 1240
    val useRail = !compact

    val navItems = CoachDest.bottomTabs.map { dest ->
        val selected = current?.startsWith(dest.route) == true ||
            (dest == CoachDest.PROFILE && current == CoachDest.SETTINGS.route) ||
            (dest == CoachDest.DASHBOARD && current == CoachDest.OVERVIEW.route) ||
            (dest == CoachDest.ASCEND && current == CoachDest.ANALYTICS.route) ||
            (dest == CoachDest.FEED && current == CoachDest.INBOX.route)
        EliteNavItem(
            label = dest.label,
            icon = when (dest) {
                CoachDest.FEED -> if (selected) Icons.Filled.DynamicFeed else Icons.Outlined.DynamicFeed
                CoachDest.ASCEND -> if (selected) Icons.Filled.TripOrigin else Icons.Outlined.TripOrigin
                CoachDest.DASHBOARD -> if (selected) Icons.Filled.Dashboard else Icons.Outlined.Dashboard
                CoachDest.PROFILE -> if (selected) Icons.Filled.Person else Icons.Outlined.Person
                else -> Icons.Outlined.DynamicFeed
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
            testTag = "coach_tab_${dest.name.lowercase()}",
        )
    }

    CompositionLocalProvider(
        LocalCoachContainer provides container,
        LocalCoachSignOut provides onSignedOut,
        LocalCoachModeSwitch provides onActiveModeChange,
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(EliteSurfaceColors.FLOOR.toColor()),
        ) {
            Scaffold(
                modifier = Modifier
                    .fillMaxSize()
                    .testTag("coach_os"),
                containerColor = Color.Transparent,
                contentWindowInsets = WindowInsets.safeDrawing.only(
                    WindowInsetsSides.Horizontal + WindowInsetsSides.Top,
                ),
                topBar = {
                    if (!online) {
                        EliteOfflineBanner(
                            cacheLabel = "CACHE UNAVAILABLE",
                            pendingCount = pendingOffline,
                            modifier = Modifier.testTag("coach_offline_banner"),
                        )
                    }
                },
                bottomBar = {
                    if (onBottomTab && !useRail) {
                        EosPremiumBottomNavigation(
                            modifier = Modifier.testTag("coach_bottom_nav"),
                            items = navItems,
                            onTrainClick = {
                                navController.navigate(CoachDest.SESSIONS.route)
                            },
                            trainSelected = current == CoachDest.SESSIONS.route,
                            trainTestTag = "coach_train_fab",
                            trainContentDescription = "Open sessions",
                        )
                    }
                },
                floatingActionButton = {
                    if (onBottomTab && useRail) {
                        EosTrainActionFab(
                            onClick = {
                                navController.navigate(CoachDest.SESSIONS.route)
                            },
                            selected = current == CoachDest.SESSIONS.route,
                            contentDescription = "Open sessions",
                            modifier = Modifier.testTag("coach_train_fab"),
                        )
                    }
                },
                floatingActionButtonPosition = FabPosition.Center,
                content = { padding ->
                    Row(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(padding),
                    ) {
                        if (onBottomTab && useRail) {
                            EliteNavRail(
                                items = navItems,
                                expanded = expandedRail,
                                modifier = Modifier.testTag("coach_nav_rail"),
                            )
                        }
                        Box(
                            modifier = Modifier.weight(1f),
                            content = { CoachNavHost(navController = navController) },
                        )
                    }
                },
            )
        }
    }
}
