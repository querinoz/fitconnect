package com.fitconnect.android.coach.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import androidx.navigation.navDeepLink
import com.fitconnect.android.coach.ui.ai.CoachAiScreen
import com.fitconnect.android.coach.ui.analytics.AnalyticsScreen
import com.fitconnect.android.coach.ui.athletes.AthleteDetailScreen
import com.fitconnect.android.coach.ui.athletes.AthletesScreen
import com.fitconnect.android.coach.ui.bookings.BookingsScreen
import com.fitconnect.android.coach.ui.calendar.CalendarScreen
import com.fitconnect.android.coach.ui.feed.CoachFeedScreen
import com.fitconnect.android.coach.ui.inbox.InboxScreen
import com.fitconnect.android.coach.ui.notifications.NotificationsScreen
import com.fitconnect.android.coach.ui.overview.OverviewScreen
import com.fitconnect.android.coach.ui.profile.ProfileScreen
import com.fitconnect.android.coach.ui.programs.ProgramBuilderScreen
import com.fitconnect.android.coach.ui.programs.ProgramsScreen
import com.fitconnect.android.coach.ui.revenue.RevenueScreen
import com.fitconnect.android.coach.ui.sessions.SessionDetailScreen
import com.fitconnect.android.coach.ui.sessions.SessionsScreen
import com.fitconnect.android.coach.ui.settings.CoachSettingsScreen

/**
 * Social-first IA (parity with athlete):
 * PRIMARY bottom: Feed · Ascend · (Train FAB) · Dashboard · Profile
 * SECONDARY: Athletes, Bookings, Programs, Calendar, Revenue, Settings, …
 */
enum class CoachDest(
    val route: String,
    val label: String,
    val iconLabel: String,
    val bottom: Boolean = false,
) {
    /** Social / inbox home — app start destination. */
    FEED("coach/feed", "Feed", "F", bottom = true),
    /** Progression-oriented analytics. */
    ASCEND("coach/ascend", "Ascend", "A", bottom = true),
    /** Coach overview (former Home). */
    DASHBOARD("coach/dashboard", "Dashboard", "D", bottom = true),
    PROFILE("coach/profile", "Profile", "Y", bottom = true),

    // Train action (FAB / not a tab)
    SESSIONS("coach/sessions", "Sessions", "S", bottom = false),
    SESSION_DETAIL("coach/sessions/{sessionId}", "Session", "S"),

    // Secondary / drawer
    ATHLETES("coach/athletes", "Athletes", "A"),
    ATHLETE_DETAIL("coach/athletes/{athleteId}", "Athlete", "A"),
    CALENDAR("coach/calendar", "Calendar", "C"),
    PROGRAMS("coach/programs", "Programs", "P"),
    PROGRAM_BUILDER("coach/programs/{programId}", "Builder", "P"),
    BOOKINGS("coach/bookings", "Bookings", "B"),
    REVENUE("coach/revenue", "Revenue", "R"),
    AI("coach/ai", "AI", "A"),
    NOTIFICATIONS("coach/notifications", "Alerts", "!"),
    SETTINGS("coach/settings", "Settings", "G"),

    /** Legacy inbox path — same content as Feed body. */
    INBOX("coach/inbox", "Inbox", "I"),
    /** Legacy analytics path — same content as Ascend. */
    ANALYTICS("coach/analytics", "Analytics", "N"),
    /** Legacy overview path — aliases Dashboard. */
    OVERVIEW("coach/overview", "Home", "H");

    companion object {
        /** Exactly four primary destinations; Train is the center FAB. */
        val bottomTabs = listOf(FEED, ASCEND, DASHBOARD, PROFILE)
    }
}

@Composable
fun CoachNavHost(navController: NavHostController) {
    NavHost(
        navController = navController,
        startDestination = CoachDest.FEED.route,
    ) {
        composable(
            CoachDest.FEED.route,
            deepLinks = listOf(
                navDeepLink { uriPattern = "fitconnect://app/coach/feed" },
                navDeepLink { uriPattern = "fitconnect://app/coach" },
            ),
        ) {
            CoachFeedScreen(
                onOpenAthletes = { navController.navigate(CoachDest.ATHLETES.route) },
                onOpenBookings = { navController.navigate(CoachDest.BOOKINGS.route) },
                onOpenPrograms = { navController.navigate(CoachDest.PROGRAMS.route) },
                onOpenCalendar = { navController.navigate(CoachDest.CALENDAR.route) },
                onOpenRevenue = { navController.navigate(CoachDest.REVENUE.route) },
                onOpenSettings = { navController.navigate(CoachDest.SETTINGS.route) },
                onOpenNotifications = { navController.navigate(CoachDest.NOTIFICATIONS.route) },
                onOpenAscend = { navController.navigate(CoachDest.ASCEND.route) },
                onOpenDashboard = { navController.navigate(CoachDest.DASHBOARD.route) },
                onOpenProfile = { navController.navigate(CoachDest.PROFILE.route) },
            )
        }
        composable(
            CoachDest.ASCEND.route,
            deepLinks = listOf(navDeepLink { uriPattern = "fitconnect://app/coach/ascend" }),
        ) {
            AnalyticsScreen()
        }
        composable(
            CoachDest.DASHBOARD.route,
            deepLinks = listOf(
                navDeepLink { uriPattern = "fitconnect://app/coach/dashboard" },
                navDeepLink { uriPattern = "fitconnect://app/coach/overview" },
            ),
        ) {
            OverviewScreen(
                onOpenAthletes = { navController.navigate(CoachDest.ATHLETES.route) },
                onOpenCalendar = { navController.navigate(CoachDest.CALENDAR.route) },
                onOpenInbox = { navController.navigate(CoachDest.FEED.route) },
                onOpenBookings = { navController.navigate(CoachDest.BOOKINGS.route) },
                onOpenPrograms = { navController.navigate(CoachDest.PROGRAMS.route) },
                onOpenAnalytics = { navController.navigate(CoachDest.ASCEND.route) },
                onOpenRevenue = { navController.navigate(CoachDest.REVENUE.route) },
                onOpenNotifications = { navController.navigate(CoachDest.NOTIFICATIONS.route) },
                onOpenSession = { id -> navController.navigate("coach/sessions/$id") },
                onOpenAthlete = { id -> navController.navigate("coach/athletes/$id") },
            )
        }
        composable(CoachDest.PROFILE.route) {
            ProfileScreen(
                onOpenPrograms = { navController.navigate(CoachDest.PROGRAMS.route) },
                onOpenAnalytics = { navController.navigate(CoachDest.ASCEND.route) },
                onOpenRevenue = { navController.navigate(CoachDest.REVENUE.route) },
                onOpenBookings = { navController.navigate(CoachDest.BOOKINGS.route) },
                onOpenSessions = { navController.navigate(CoachDest.SESSIONS.route) },
                onOpenNotifications = { navController.navigate(CoachDest.NOTIFICATIONS.route) },
                onOpenAi = { navController.navigate(CoachDest.AI.route) },
                onOpenSettings = { navController.navigate(CoachDest.SETTINGS.route) },
            )
        }

        // Legacy aliases
        composable(CoachDest.OVERVIEW.route) {
            OverviewScreen(
                onOpenAthletes = { navController.navigate(CoachDest.ATHLETES.route) },
                onOpenCalendar = { navController.navigate(CoachDest.CALENDAR.route) },
                onOpenInbox = { navController.navigate(CoachDest.FEED.route) },
                onOpenBookings = { navController.navigate(CoachDest.BOOKINGS.route) },
                onOpenPrograms = { navController.navigate(CoachDest.PROGRAMS.route) },
                onOpenAnalytics = { navController.navigate(CoachDest.ASCEND.route) },
                onOpenRevenue = { navController.navigate(CoachDest.REVENUE.route) },
                onOpenNotifications = { navController.navigate(CoachDest.NOTIFICATIONS.route) },
                onOpenSession = { id -> navController.navigate("coach/sessions/$id") },
                onOpenAthlete = { id -> navController.navigate("coach/athletes/$id") },
            )
        }
        composable(CoachDest.INBOX.route) { InboxScreen() }
        composable(CoachDest.ANALYTICS.route) { AnalyticsScreen() }

        composable(CoachDest.ATHLETES.route) {
            AthletesScreen(onOpenAthlete = { id -> navController.navigate("coach/athletes/$id") })
        }
        composable(
            route = CoachDest.ATHLETE_DETAIL.route,
            arguments = listOf(navArgument("athleteId") { type = NavType.StringType }),
            deepLinks = listOf(navDeepLink { uriPattern = "fitconnect://app/coach/athletes/{athleteId}" }),
        ) { entry ->
            AthleteDetailScreen(athleteId = entry.arguments?.getString("athleteId").orEmpty())
        }
        composable(CoachDest.CALENDAR.route) {
            CalendarScreen(
                onOpenSession = { id -> navController.navigate("coach/sessions/$id") },
                onOpenSessions = { navController.navigate(CoachDest.SESSIONS.route) },
            )
        }
        composable(
            CoachDest.SESSIONS.route,
            deepLinks = listOf(navDeepLink { uriPattern = "fitconnect://app/coach/sessions" }),
        ) {
            SessionsScreen(onOpenSession = { id -> navController.navigate("coach/sessions/$id") })
        }
        composable(
            route = CoachDest.SESSION_DETAIL.route,
            arguments = listOf(navArgument("sessionId") { type = NavType.StringType }),
            deepLinks = listOf(
                navDeepLink { uriPattern = "fitconnect://app/coach/sessions/{sessionId}" },
                navDeepLink { uriPattern = "fitconnect://app/coach/session/{sessionId}" },
            ),
        ) { entry ->
            SessionDetailScreen(sessionId = entry.arguments?.getString("sessionId").orEmpty())
        }
        composable(CoachDest.PROGRAMS.route) {
            ProgramsScreen(onOpenBuilder = { id -> navController.navigate("coach/programs/$id") })
        }
        composable(
            route = CoachDest.PROGRAM_BUILDER.route,
            arguments = listOf(navArgument("programId") { type = NavType.StringType }),
        ) { entry ->
            ProgramBuilderScreen(programId = entry.arguments?.getString("programId").orEmpty())
        }
        composable(
            CoachDest.BOOKINGS.route,
            deepLinks = listOf(
                navDeepLink { uriPattern = "fitconnect://app/coach/bookings" },
                navDeepLink { uriPattern = "fitconnect://app/coach/booking" },
            ),
        ) { BookingsScreen() }
        composable(CoachDest.REVENUE.route) { RevenueScreen() }
        composable(
            CoachDest.AI.route,
            deepLinks = listOf(navDeepLink { uriPattern = "fitconnect://app/coach/ai" }),
        ) { CoachAiScreen() }
        composable(CoachDest.SETTINGS.route) { CoachSettingsScreen() }
        composable(
            CoachDest.NOTIFICATIONS.route,
            deepLinks = listOf(navDeepLink { uriPattern = "fitconnect://app/coach/notifications" }),
        ) { NotificationsScreen() }
    }
}
