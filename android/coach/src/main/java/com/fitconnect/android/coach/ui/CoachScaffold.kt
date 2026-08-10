package com.fitconnect.android.coach.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Settings
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
import com.fitconnect.android.coach.di.CoachContainer
import com.fitconnect.android.coach.navigation.CoachDest
import com.fitconnect.android.coach.navigation.CoachNavHost
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.components.EliteBadge
import com.fitconnect.android.designui.components.EliteFloatingNavBar
import com.fitconnect.android.designui.components.EliteNavItem
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.toColor

val LocalCoachContainer = staticCompositionLocalOf<CoachContainer> {
    error("CoachContainer not provided")
}

val LocalCoachSignOut = staticCompositionLocalOf<() -> Unit> {
    error("Sign-out handler not provided")
}

@Composable
fun CoachOsApp(
    container: CoachContainer,
    onSignedOut: () -> Unit = {},
) {
    val navController = rememberNavController()
    val backStack by navController.currentBackStackEntryAsState()
    val current = backStack?.destination?.route
    val online by container.platform.connectivity.online.collectAsState()

    CompositionLocalProvider(
        LocalCoachContainer provides container,
        LocalCoachSignOut provides onSignedOut,
    ) {
        Scaffold(
            modifier = Modifier.testTag("coach_os"),
            containerColor = EliteSurfaceColors.FLOOR.toColor(),
            topBar = {
                if (!online) {
                    OfflineBanner()
                }
            },
            bottomBar = {
                EliteFloatingNavBar(
                    modifier = Modifier.testTag("coach_bottom_nav"),
                    items = CoachDest.bottomTabs.map { dest ->
                        val selected = current?.startsWith(dest.route.substringBefore("/{")) == true ||
                            current?.startsWith(dest.route) == true
                        EliteNavItem(
                            label = dest.label,
                            icon = when (dest) {
                                CoachDest.OVERVIEW -> Icons.Filled.Home
                                CoachDest.ATHLETES -> Icons.Filled.Person
                                CoachDest.CALENDAR -> Icons.Filled.DateRange
                                CoachDest.INBOX -> Icons.Filled.Email
                                CoachDest.MORE -> Icons.Filled.Settings
                                else -> Icons.Filled.Home
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
private fun OfflineBanner() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(EliteSpace.Sm)
            .testTag("coach_offline_banner"),
        verticalAlignment = Alignment.CenterVertically,
        content = {
            EliteBadge(
                text = "OFFLINE",
                containerColor = EliteSurfaceColors.RECOVERY.toColor(),
                contentColor = EliteSurfaceColors.FLOOR.toColor(),
            )
            Text(
                text = "  Cached · actions queue for sync",
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        },
    )
}
