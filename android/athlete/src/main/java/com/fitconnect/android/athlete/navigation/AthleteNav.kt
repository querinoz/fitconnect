package com.fitconnect.android.athlete.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import androidx.navigation.navDeepLink
import com.fitconnect.android.athlete.ui.activity.ActivityScreen
import com.fitconnect.android.athlete.ui.ai.AthleteAiScreen
import com.fitconnect.android.athlete.ui.community.CommunityScreen
import com.fitconnect.android.athlete.ui.daily.DailyActivityScreen
import com.fitconnect.android.athlete.ui.discover.DiscoverScreen
import com.fitconnect.android.athlete.ui.home.HomeScreen
import com.fitconnect.android.athlete.ui.notifications.NotificationsScreen
import com.fitconnect.android.athlete.ui.profile.ProfileScreen
import com.fitconnect.android.athlete.ui.programs.ProgramsScreen
import com.fitconnect.android.athlete.ui.recovery.RecoveryScreen
import com.fitconnect.android.athlete.ui.settings.SettingsScreen
import com.fitconnect.android.athlete.ui.sleep.SleepScreen
import com.fitconnect.android.athlete.ui.sports.SportsScreen
import com.fitconnect.android.athlete.ui.telemetry.TelemetryScreen
import com.fitconnect.android.athlete.ui.training.SessionDetailScreen
import com.fitconnect.android.athlete.ui.training.TrainingScreen
import com.fitconnect.android.athlete.ui.vault.PerformanceVaultScreen

enum class AthleteDest(
    val route: String,
    val label: String,
    val iconLabel: String,
    val bottom: Boolean = false,
) {
    HOME("athlete/home", "Home", "H", bottom = true),
    DISCOVER("athlete/discover", "Discover", "D", bottom = true),
    ACTIVITY("athlete/activity", "Activity", "A", bottom = true),
    COMMUNITY("athlete/community", "Community", "C", bottom = true),
    PROFILE("athlete/profile", "Profile", "Y", bottom = true),
    TRAINING("athlete/training", "Sessions", "S"),
    PROGRAMS("athlete/programs", "Programs", "P"),
    RECOVERY("athlete/recovery", "Recover", "R"),
    SPORTS("athlete/sports", "Sports", "S"),
    TELEMETRY("athlete/telemetry", "Telemetry", "T"),
    AI("athlete/ai", "AI", "A"),
    NOTIFICATIONS("athlete/notifications", "Alerts", "N"),
    SLEEP("athlete/sleep", "Sleep", "Z"),
    DAILY("athlete/daily", "Daily", "Y"),
    SETTINGS("athlete/settings", "Settings", "G"),
    VAULT("athlete/vault", "Vault", "V"),
    SESSION("athlete/training/{sessionId}", "Session", "T");

    companion object {
        val bottomTabs = entries.filter { it.bottom }
    }
}

@Composable
fun AthleteNavHost(
    navController: NavHostController,
) {
    NavHost(
        navController = navController,
        startDestination = AthleteDest.HOME.route,
    ) {
        composable(
            AthleteDest.HOME.route,
            deepLinks = listOf(navDeepLink { uriPattern = "fitconnect://app/athlete/home" }),
        ) {
            HomeScreen(
                onOpenRecovery = { navController.navigate(AthleteDest.RECOVERY.route) },
                onOpenTraining = { navController.navigate(AthleteDest.TRAINING.route) },
                onOpenSession = { id -> navController.navigate("athlete/training/$id") },
                onOpenNotifications = { navController.navigate(AthleteDest.NOTIFICATIONS.route) },
                onOpenPrograms = { navController.navigate(AthleteDest.PROGRAMS.route) },
                onOpenSports = { navController.navigate(AthleteDest.SPORTS.route) },
                onOpenAi = { navController.navigate(AthleteDest.AI.route) },
                onOpenCommunity = { navController.navigate(AthleteDest.COMMUNITY.route) },
                onOpenProfile = { navController.navigate(AthleteDest.PROFILE.route) },
                onOpenDiscover = { navController.navigate(AthleteDest.DISCOVER.route) },
                onOpenActivity = { navController.navigate(AthleteDest.ACTIVITY.route) },
                onOpenSleep = { navController.navigate(AthleteDest.SLEEP.route) },
                onOpenDaily = { navController.navigate(AthleteDest.DAILY.route) },
                onOpenVault = { navController.navigate(AthleteDest.VAULT.route) },
            )
        }
        composable(
            AthleteDest.ACTIVITY.route,
            deepLinks = listOf(navDeepLink { uriPattern = "fitconnect://app/athlete/activity" }),
        ) { ActivityScreen() }
        composable(AthleteDest.RECOVERY.route, deepLinks = listOf(navDeepLink { uriPattern = "fitconnect://app/athlete/recovery" })) {
            RecoveryScreen()
        }
        composable(AthleteDest.SLEEP.route, deepLinks = listOf(navDeepLink { uriPattern = "fitconnect://app/athlete/sleep" })) {
            SleepScreen()
        }
        composable(AthleteDest.DAILY.route) { DailyActivityScreen() }
        composable(AthleteDest.TRAINING.route) {
            TrainingScreen(onOpenSession = { id -> navController.navigate("athlete/training/$id") })
        }
        composable(
            route = AthleteDest.SESSION.route,
            arguments = listOf(navArgument("sessionId") { type = NavType.StringType }),
            deepLinks = listOf(navDeepLink { uriPattern = "fitconnect://app/athlete/training/{sessionId}" }),
        ) { entry ->
            SessionDetailScreen(sessionId = entry.arguments?.getString("sessionId").orEmpty())
        }
        composable(AthleteDest.SPORTS.route) { SportsScreen() }
        composable(AthleteDest.PROGRAMS.route) { ProgramsScreen() }
        composable(AthleteDest.COMMUNITY.route) { CommunityScreen() }
        composable(AthleteDest.DISCOVER.route) { DiscoverScreen() }
        composable(
            AthleteDest.TELEMETRY.route,
            deepLinks = listOf(navDeepLink { uriPattern = "fitconnect://app/athlete/telemetry" }),
        ) { TelemetryScreen() }
        composable(
            AthleteDest.AI.route,
            deepLinks = listOf(navDeepLink { uriPattern = "fitconnect://app/athlete/ai" }),
        ) { AthleteAiScreen() }
        composable(AthleteDest.PROFILE.route) {
            ProfileScreen(
                onOpenTelemetry = { navController.navigate(AthleteDest.TELEMETRY.route) },
                onOpenAi = { navController.navigate(AthleteDest.AI.route) },
                onOpenSettings = { navController.navigate(AthleteDest.SETTINGS.route) },
                onOpenVault = { navController.navigate(AthleteDest.VAULT.route) },
            )
        }
        composable(AthleteDest.VAULT.route) { PerformanceVaultScreen() }
        composable(AthleteDest.SETTINGS.route) {
            SettingsScreen(
                onOpenProfile = { navController.navigate(AthleteDest.PROFILE.route) },
                onOpenNotifications = { navController.navigate(AthleteDest.NOTIFICATIONS.route) },
                onOpenTelemetry = { navController.navigate(AthleteDest.TELEMETRY.route) },
            )
        }
        composable(AthleteDest.NOTIFICATIONS.route) { NotificationsScreen() }
    }
}
