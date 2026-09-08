package com.fitconnect.android.athlete.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import androidx.navigation.navDeepLink
import com.fitconnect.android.athlete.ui.activity.ActivityRouteDetailScreen
import com.fitconnect.android.athlete.ui.activity.ActivityScreen
import com.fitconnect.android.athlete.ui.ai.AthleteAiScreen
import com.fitconnect.android.athlete.ui.community.CommunityScreen
import com.fitconnect.android.athlete.ui.daily.DailyActivityScreen
import com.fitconnect.android.athlete.ui.discover.DiscoverScreen
import com.fitconnect.android.athlete.ui.feed.FeedScreen
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
import com.fitconnect.android.athlete.ui.workout.StrengthWorkoutScreen

/**
 * Social-first IA (Zenith):
 * PRIMARY bottom: Feed · Ascend · (Train FAB) · Dashboard · Profile
 * SECONDARY: Discover, Programs, Sports, Settings, Notifications, etc.
 */
enum class AthleteDest(
    val route: String,
    val label: String,
    val iconLabel: String,
    val bottom: Boolean = false,
) {
    /** Social home — app start destination. */
    FEED("athlete/feed", "Feed", "F", bottom = true),
    /** Progression / achievements / goals. */
    ASCEND("athlete/ascend", "Ascend", "A", bottom = true),
    /** Performance telemetry OS (former Today/Home). */
    DASHBOARD("athlete/dashboard", "Dashboard", "D", bottom = true),
    PROFILE("athlete/profile", "Profile", "Y", bottom = true),

    // Train action (FAB / not a tab)
    ACTIVITY("athlete/activity", "Train", "T", bottom = false),
    ACTIVITY_ROUTE("athlete/activity/route/{activityId}", "Route", "M", bottom = false),
    WORKOUT("athlete/workout", "Guided", "W", bottom = false),
    TRAINING("athlete/training", "Sessions", "S"),
    SESSION("athlete/training/{sessionId}", "Session", "T"),

    // Secondary / drawer
    DISCOVER("athlete/discover", "Discover", "C"),
    PROGRAMS("athlete/programs", "Programs", "P"),
    SPORTS("athlete/sports", "Sports", "S"),
    COMMUNITY("athlete/community", "Community", "O"),
    RECOVERY("athlete/recovery", "Recover", "R"),
    TELEMETRY("athlete/telemetry", "Telemetry", "M"),
    AI("athlete/ai", "AI", "I"),
    NOTIFICATIONS("athlete/notifications", "Alerts", "N"),
    SLEEP("athlete/sleep", "Sleep", "Z"),
    DAILY("athlete/daily", "Daily", "Y"),
    SETTINGS("athlete/settings", "Settings", "G"),
    /** Legacy vault path — redirects to Ascend content. */
    VAULT("athlete/vault", "Achievements", "V"),
    /** Legacy Today path aliases Dashboard. */
    HOME("athlete/home", "Today", "H");

    companion object {
        /** Exactly four primary destinations; Train is the center FAB. */
        val bottomTabs = listOf(FEED, ASCEND, DASHBOARD, PROFILE)
    }
}

@Composable
fun AthleteNavHost(
    navController: NavHostController,
) {
    NavHost(
        navController = navController,
        startDestination = AthleteDest.FEED.route,
    ) {
        composable(
            AthleteDest.FEED.route,
            deepLinks = listOf(
                navDeepLink { uriPattern = "fitconnect://app/athlete/feed" },
                navDeepLink { uriPattern = "fitconnect://app/athlete" },
            ),
        ) {
            FeedScreen(
                onOpenDiscover = { navController.navigate(AthleteDest.DISCOVER.route) },
                onOpenPrograms = { navController.navigate(AthleteDest.PROGRAMS.route) },
                onOpenSports = { navController.navigate(AthleteDest.SPORTS.route) },
                onOpenNotifications = { navController.navigate(AthleteDest.NOTIFICATIONS.route) },
                onOpenProfile = { navController.navigate(AthleteDest.PROFILE.route) },
                onOpenAscend = { navController.navigate(AthleteDest.ASCEND.route) },
                onOpenDashboard = { navController.navigate(AthleteDest.DASHBOARD.route) },
                onOpenSettings = { navController.navigate(AthleteDest.SETTINGS.route) },
                onOpenCommunityLegacy = { navController.navigate(AthleteDest.COMMUNITY.route) },
                onOpenActivity = { navController.navigate(AthleteDest.ACTIVITY.route) },
            )
        }
        composable(
            AthleteDest.ASCEND.route,
            deepLinks = listOf(navDeepLink { uriPattern = "fitconnect://app/athlete/ascend" }),
        ) {
            PerformanceVaultScreen()
        }
        composable(
            AthleteDest.DASHBOARD.route,
            deepLinks = listOf(
                navDeepLink { uriPattern = "fitconnect://app/athlete/dashboard" },
                navDeepLink { uriPattern = "fitconnect://app/athlete/home" },
            ),
        ) {
            HomeScreen(
                onOpenRecovery = { navController.navigate(AthleteDest.RECOVERY.route) },
                onOpenTraining = { navController.navigate(AthleteDest.TRAINING.route) },
                onOpenSession = { id -> navController.navigate("athlete/training/$id") },
                onOpenNotifications = { navController.navigate(AthleteDest.NOTIFICATIONS.route) },
                onOpenPrograms = { navController.navigate(AthleteDest.PROGRAMS.route) },
                onOpenSports = { navController.navigate(AthleteDest.SPORTS.route) },
                onOpenAi = { navController.navigate(AthleteDest.AI.route) },
                onOpenCommunity = { navController.navigate(AthleteDest.FEED.route) },
                onOpenProfile = { navController.navigate(AthleteDest.PROFILE.route) },
                onOpenDiscover = { navController.navigate(AthleteDest.DISCOVER.route) },
                onOpenActivity = { navController.navigate(AthleteDest.ACTIVITY.route) },
                onOpenSleep = { navController.navigate(AthleteDest.SLEEP.route) },
                onOpenDaily = { navController.navigate(AthleteDest.DAILY.route) },
                onOpenVault = { navController.navigate(AthleteDest.ASCEND.route) },
            )
        }
        // Legacy aliases
        composable(AthleteDest.HOME.route) {
            HomeScreen(
                onOpenRecovery = { navController.navigate(AthleteDest.RECOVERY.route) },
                onOpenTraining = { navController.navigate(AthleteDest.TRAINING.route) },
                onOpenSession = { id -> navController.navigate("athlete/training/$id") },
                onOpenNotifications = { navController.navigate(AthleteDest.NOTIFICATIONS.route) },
                onOpenPrograms = { navController.navigate(AthleteDest.PROGRAMS.route) },
                onOpenSports = { navController.navigate(AthleteDest.SPORTS.route) },
                onOpenAi = { navController.navigate(AthleteDest.AI.route) },
                onOpenCommunity = { navController.navigate(AthleteDest.FEED.route) },
                onOpenProfile = { navController.navigate(AthleteDest.PROFILE.route) },
                onOpenDiscover = { navController.navigate(AthleteDest.DISCOVER.route) },
                onOpenActivity = { navController.navigate(AthleteDest.ACTIVITY.route) },
                onOpenSleep = { navController.navigate(AthleteDest.SLEEP.route) },
                onOpenDaily = { navController.navigate(AthleteDest.DAILY.route) },
                onOpenVault = { navController.navigate(AthleteDest.ASCEND.route) },
            )
        }
        composable(AthleteDest.VAULT.route) { PerformanceVaultScreen() }
        composable(AthleteDest.COMMUNITY.route) { CommunityScreen() }

        composable(
            AthleteDest.WORKOUT.route,
            deepLinks = listOf(navDeepLink { uriPattern = "fitconnect://app/athlete/workout" }),
        ) { StrengthWorkoutScreen() }
        composable(
            AthleteDest.ACTIVITY.route,
            deepLinks = listOf(navDeepLink { uriPattern = "fitconnect://app/athlete/activity" }),
        ) {
            ActivityScreen(
                onOpenRouteDetail = { id ->
                    navController.navigate("athlete/activity/route/$id")
                },
            )
        }
        composable(
            route = AthleteDest.ACTIVITY_ROUTE.route,
            arguments = listOf(navArgument("activityId") { type = NavType.StringType }),
            deepLinks = listOf(navDeepLink { uriPattern = "fitconnect://app/athlete/activity/route/{activityId}" }),
        ) { entry ->
            ActivityRouteDetailScreen(
                activityId = entry.arguments?.getString("activityId").orEmpty(),
            )
        }
        composable(AthleteDest.RECOVERY.route, deepLinks = listOf(navDeepLink { uriPattern = "fitconnect://app/athlete/recovery" })) {
            RecoveryScreen()
        }
        composable(AthleteDest.SLEEP.route, deepLinks = listOf(navDeepLink { uriPattern = "fitconnect://app/athlete/sleep" })) {
            SleepScreen()
        }
        composable(AthleteDest.DAILY.route) { DailyActivityScreen() }
        composable(
            AthleteDest.TRAINING.route,
            deepLinks = listOf(navDeepLink { uriPattern = "fitconnect://app/athlete/training" }),
        ) {
            TrainingScreen(onOpenSession = { id -> navController.navigate("athlete/training/$id") })
        }
        composable(
            route = AthleteDest.SESSION.route,
            arguments = listOf(navArgument("sessionId") { type = NavType.StringType }),
            deepLinks = listOf(
                navDeepLink { uriPattern = "fitconnect://app/athlete/training/{sessionId}" },
                navDeepLink { uriPattern = "fitconnect://app/athlete/session/{sessionId}" },
            ),
        ) { entry ->
            SessionDetailScreen(sessionId = entry.arguments?.getString("sessionId").orEmpty())
        }
        composable(AthleteDest.SPORTS.route) { SportsScreen() }
        composable(AthleteDest.PROGRAMS.route) { ProgramsScreen() }
        composable(
            AthleteDest.DISCOVER.route,
            deepLinks = listOf(
                navDeepLink { uriPattern = "fitconnect://app/athlete/discover" },
                navDeepLink { uriPattern = "fitconnect://app/athlete/booking" },
                navDeepLink { uriPattern = "fitconnect://app/athlete/bookings" },
            ),
        ) { DiscoverScreen() }
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
                onOpenVault = { navController.navigate(AthleteDest.ASCEND.route) },
            )
        }
        composable(AthleteDest.SETTINGS.route) {
            SettingsScreen(
                onOpenProfile = { navController.navigate(AthleteDest.PROFILE.route) },
                onOpenNotifications = { navController.navigate(AthleteDest.NOTIFICATIONS.route) },
                onOpenTelemetry = { navController.navigate(AthleteDest.TELEMETRY.route) },
            )
        }
        composable(
            AthleteDest.NOTIFICATIONS.route,
            deepLinks = listOf(navDeepLink { uriPattern = "fitconnect://app/athlete/notifications" }),
        ) { NotificationsScreen() }
    }
}
