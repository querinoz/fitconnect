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
import com.fitconnect.android.coach.ui.inbox.InboxScreen
import com.fitconnect.android.coach.ui.notifications.NotificationsScreen
import com.fitconnect.android.coach.ui.overview.OverviewScreen
import com.fitconnect.android.coach.ui.profile.ProfileScreen
import com.fitconnect.android.coach.ui.programs.ProgramBuilderScreen
import com.fitconnect.android.coach.ui.programs.ProgramsScreen
import com.fitconnect.android.coach.ui.revenue.RevenueScreen
import com.fitconnect.android.coach.ui.sessions.SessionDetailScreen
import com.fitconnect.android.coach.ui.sessions.SessionsScreen

enum class CoachDest(
    val route: String,
    val label: String,
    val iconLabel: String,
    val bottom: Boolean = false,
) {
    OVERVIEW("coach/overview", "Home", "H", bottom = true),
    ATHLETES("coach/athletes", "Athletes", "A", bottom = true),
    CALENDAR("coach/calendar", "Calendar", "C", bottom = true),
    INBOX("coach/inbox", "Inbox", "I", bottom = true),
    MORE("coach/profile", "More", "M", bottom = true),
    ATHLETE_DETAIL("coach/athletes/{athleteId}", "Athlete", "A"),
    SESSIONS("coach/sessions", "Sessions", "S"),
    SESSION_DETAIL("coach/sessions/{sessionId}", "Session", "S"),
    PROGRAMS("coach/programs", "Programs", "P"),
    PROGRAM_BUILDER("coach/programs/{programId}", "Builder", "P"),
    BOOKINGS("coach/bookings", "Bookings", "B"),
    ANALYTICS("coach/analytics", "Analytics", "N"),
    REVENUE("coach/revenue", "Revenue", "R"),
    AI("coach/ai", "AI", "A"),
    NOTIFICATIONS("coach/notifications", "Alerts", "!");

    companion object {
        val bottomTabs = entries.filter { it.bottom }
    }
}

@Composable
fun CoachNavHost(navController: NavHostController) {
    NavHost(
        navController = navController,
        startDestination = CoachDest.OVERVIEW.route,
    ) {
        composable(
            CoachDest.OVERVIEW.route,
            deepLinks = listOf(navDeepLink { uriPattern = "fitconnect://app/coach/overview" }),
        ) {
            OverviewScreen(
                onOpenAthletes = { navController.navigate(CoachDest.ATHLETES.route) },
                onOpenCalendar = { navController.navigate(CoachDest.CALENDAR.route) },
                onOpenInbox = { navController.navigate(CoachDest.INBOX.route) },
                onOpenBookings = { navController.navigate(CoachDest.BOOKINGS.route) },
                onOpenPrograms = { navController.navigate(CoachDest.PROGRAMS.route) },
                onOpenAnalytics = { navController.navigate(CoachDest.ANALYTICS.route) },
                onOpenRevenue = { navController.navigate(CoachDest.REVENUE.route) },
                onOpenNotifications = { navController.navigate(CoachDest.NOTIFICATIONS.route) },
                onOpenSession = { id -> navController.navigate("coach/sessions/$id") },
                onOpenAthlete = { id -> navController.navigate("coach/athletes/$id") },
            )
        }
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
        composable(CoachDest.SESSIONS.route) {
            SessionsScreen(onOpenSession = { id -> navController.navigate("coach/sessions/$id") })
        }
        composable(
            route = CoachDest.SESSION_DETAIL.route,
            arguments = listOf(navArgument("sessionId") { type = NavType.StringType }),
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
        composable(CoachDest.INBOX.route) { InboxScreen() }
        composable(
            CoachDest.BOOKINGS.route,
            deepLinks = listOf(navDeepLink { uriPattern = "fitconnect://app/coach/bookings" }),
        ) { BookingsScreen() }
        composable(CoachDest.ANALYTICS.route) { AnalyticsScreen() }
        composable(CoachDest.REVENUE.route) { RevenueScreen() }
        composable(
            CoachDest.AI.route,
            deepLinks = listOf(navDeepLink { uriPattern = "fitconnect://app/coach/ai" }),
        ) { CoachAiScreen() }
        composable(CoachDest.MORE.route) {
            ProfileScreen(
                onOpenPrograms = { navController.navigate(CoachDest.PROGRAMS.route) },
                onOpenAnalytics = { navController.navigate(CoachDest.ANALYTICS.route) },
                onOpenRevenue = { navController.navigate(CoachDest.REVENUE.route) },
                onOpenBookings = { navController.navigate(CoachDest.BOOKINGS.route) },
                onOpenSessions = { navController.navigate(CoachDest.SESSIONS.route) },
                onOpenNotifications = { navController.navigate(CoachDest.NOTIFICATIONS.route) },
                onOpenAi = { navController.navigate(CoachDest.AI.route) },
            )
        }
        composable(CoachDest.NOTIFICATIONS.route) { NotificationsScreen() }
    }
}
