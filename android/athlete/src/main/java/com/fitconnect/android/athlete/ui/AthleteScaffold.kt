package com.fitconnect.android.athlete.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Star
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
import androidx.compose.ui.graphics.Color
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

    CompositionLocalProvider(
        LocalAthleteContainer provides container,
        LocalAthleteSignOut provides onSignedOut,
    ) {
        Scaffold(
            modifier = Modifier.testTag("athlete_os"),
            containerColor = EliteSurfaceColors.FLOOR.toColor(),
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
                                AthleteDest.HOME -> Icons.Filled.Home
                                AthleteDest.DISCOVER -> Icons.Filled.Search
                                AthleteDest.TRAINING -> Icons.Filled.DateRange
                                AthleteDest.PROGRAMS -> Icons.Filled.Star
                                AthleteDest.COMMUNITY -> Icons.Filled.Favorite
                                else -> Icons.Filled.Home
                            },
                            selected = current?.startsWith(dest.route) == true,
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
                contentColor = EliteSurfaceColors.FLOOR.toColor(),
            )
            Text(
                text = "  Cached · will sync on reconnect",
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        },
    )
}
