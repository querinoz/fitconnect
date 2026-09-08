package com.fitconnect.android.coach.ui

import android.content.Intent
import androidx.activity.ComponentActivity
import androidx.activity.compose.LocalActivity
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.WindowInsetsSides
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.only
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.TrendingUp
import androidx.compose.material.icons.automirrored.outlined.TrendingUp
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.DynamicFeed
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.outlined.Dashboard
import androidx.compose.material.icons.outlined.DynamicFeed
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material3.FabPosition
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.getValue
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.core.util.Consumer
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.fitconnect.android.coach.di.CoachContainer
import com.fitconnect.android.coach.navigation.CoachDest
import com.fitconnect.android.coach.navigation.CoachNavHost
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.components.EliteBadge
import com.fitconnect.android.designui.components.EliteFloatingNavBar
import com.fitconnect.android.designui.components.EliteNavItem
import com.fitconnect.android.designui.neumorphic.EosTrainActionFab
import com.fitconnect.android.designui.theme.EliteSpace
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

    CompositionLocalProvider(
        LocalCoachContainer provides container,
        LocalCoachSignOut provides onSignedOut,
        LocalCoachModeSwitch provides onActiveModeChange,
    ) {
        Scaffold(
            modifier = Modifier.testTag("coach_os"),
            containerColor = MaterialTheme.colorScheme.background,
            contentWindowInsets = WindowInsets.safeDrawing.only(
                WindowInsetsSides.Horizontal + WindowInsetsSides.Top,
            ),
            topBar = {
                if (!online) {
                    OfflineBanner(pendingCount = pendingOffline)
                }
            },
            bottomBar = {
                EliteFloatingNavBar(
                    modifier = Modifier.testTag("coach_bottom_nav"),
                    items = CoachDest.bottomTabs.map { dest ->
                        val selected = current?.startsWith(dest.route) == true ||
                            (dest == CoachDest.PROFILE && current == CoachDest.SETTINGS.route) ||
                            (dest == CoachDest.DASHBOARD && current == CoachDest.OVERVIEW.route) ||
                            (dest == CoachDest.ASCEND && current == CoachDest.ANALYTICS.route) ||
                            (dest == CoachDest.FEED && current == CoachDest.INBOX.route)
                        EliteNavItem(
                            label = dest.label,
                            icon = when (dest) {
                                CoachDest.FEED -> if (selected) Icons.Filled.DynamicFeed else Icons.Outlined.DynamicFeed
                                CoachDest.ASCEND -> if (selected) {
                                    Icons.AutoMirrored.Filled.TrendingUp
                                } else {
                                    Icons.AutoMirrored.Outlined.TrendingUp
                                }
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
                    },
                )
            },
            floatingActionButton = {
                if (onBottomTab) {
                    EosTrainActionFab(
                        onClick = {
                            navController.navigate(CoachDest.SESSIONS.route)
                        },
                        modifier = Modifier.testTag("coach_train_fab"),
                    )
                }
            },
            floatingActionButtonPosition = FabPosition.Center,
            content = { padding ->
                Box(
                    modifier = Modifier.padding(padding),
                    content = { CoachNavHost(navController = navController) },
                )
            },
        )
    }
}

@Composable
private fun OfflineBanner(pendingCount: Int = 0) {
    val pending = if (pendingCount > 0) " · $pendingCount queued" else ""
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(EliteSpace.Sm)
            .testTag("coach_offline_banner"),
        verticalAlignment = Alignment.CenterVertically,
        content = {
            EliteBadge(
                text = "OFFLINE$pending",
            containerColor = EliteSurfaceColors.RECOVERY.toColor(),
            contentColor = MaterialTheme.colorScheme.onPrimary,
            )
            Text(
                text = "  Cached · actions queue for sync",
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        },
    )
}
