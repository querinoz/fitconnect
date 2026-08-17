package com.fitconnect.android.athlete.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.WindowInsetsSides
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.only
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PlayCircle
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.PlayCircle
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.fitconnect.android.athlete.di.AthleteContainer
import com.fitconnect.android.athlete.navigation.AthleteDest
import com.fitconnect.android.athlete.navigation.AthleteNavHost
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.components.EliteBadge
import com.fitconnect.android.designui.components.EliteFloatingNavBar
import com.fitconnect.android.designui.components.EliteNavItem
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.toColor

val LocalAthleteContainer = staticCompositionLocalOf<AthleteContainer> {
    error("AthleteContainer not provided")
}

val LocalAthleteSignOut = staticCompositionLocalOf<() -> Unit> {
    error("Sign-out handler not provided")
}

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
    androidx.compose.runtime.LaunchedEffect(wearEnvelope) {
        wearEnvelope?.let { container.liveCoordinator.onRemoteEnvelope(it) }
    }

    CompositionLocalProvider(
        LocalAthleteContainer provides container,
        LocalAthleteSignOut provides onSignedOut,
    ) {
        Scaffold(
            modifier = Modifier.testTag("athlete_os"),
            containerColor = MaterialTheme.colorScheme.background,
            contentWindowInsets = WindowInsets.safeDrawing.only(
                WindowInsetsSides.Horizontal + WindowInsetsSides.Top,
            ),
            topBar = {
                if (!online) {
                    OfflineBanner()
                }
            },
            bottomBar = {
                EliteFloatingNavBar(
                    modifier = Modifier.testTag("athlete_bottom_nav"),
                    items = AthleteDest.bottomTabs.map { dest ->
                        EliteNavItem(
                            label = dest.label,
                            icon = when (dest) {
                                AthleteDest.HOME ->
                                    if (current?.startsWith(dest.route) == true) Icons.Filled.Home else Icons.Outlined.Home
                                AthleteDest.DISCOVER ->
                                    if (current?.startsWith(dest.route) == true) Icons.Filled.Search else Icons.Outlined.Search
                                AthleteDest.ACTIVITY ->
                                    if (current?.startsWith(dest.route) == true) {
                                        Icons.Filled.PlayCircle
                                    } else {
                                        Icons.Outlined.PlayCircle
                                    }
                                AthleteDest.COMMUNITY ->
                                    if (current?.startsWith(dest.route) == true) {
                                        Icons.Filled.Groups
                                    } else {
                                        Icons.Outlined.Groups
                                    }
                                AthleteDest.PROFILE ->
                                    if (current?.startsWith(dest.route) == true ||
                                        current == AthleteDest.SETTINGS.route
                                    ) {
                                        Icons.Filled.Person
                                    } else {
                                        Icons.Outlined.Person
                                    }
                                else -> Icons.Outlined.Home
                            },
                            selected = current?.startsWith(dest.route) == true ||
                                (dest == AthleteDest.PROFILE && current == AthleteDest.SETTINGS.route),
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
                    },
                )
            },
            content = { padding ->
                Box(
                    modifier = Modifier.padding(padding),
                    content = { AthleteNavHost(navController = navController) },
                )
            },
        )
    }
}

@Composable
private fun OfflineBanner() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(EliteSpace.Sm)
            .testTag("athlete_offline_banner"),
        verticalAlignment = Alignment.CenterVertically,
        content = {
            EliteBadge(
                text = "OFFLINE",
            containerColor = EliteSurfaceColors.RECOVERY.toColor(),
            contentColor = MaterialTheme.colorScheme.onPrimary,
            )
            Text(
                text = "  Working offline · cached · will sync on reconnect",
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        },
    )
}
