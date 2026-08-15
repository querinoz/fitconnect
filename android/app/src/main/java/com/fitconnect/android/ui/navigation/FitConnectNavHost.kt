package com.fitconnect.android.ui.navigation

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.sizeIn
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navDeepLink
import com.fitconnect.android.R
import com.fitconnect.android.foundation.a11y.Accessibility
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.FitConnectApplication
import com.fitconnect.android.athlete.ui.AthleteOsApp
import com.fitconnect.android.coach.ui.CoachOsApp
import com.fitconnect.android.designui.catalog.DesignSystemCatalog
import com.fitconnect.android.designui.theme.reduceMotionEnabled
import com.fitconnect.android.foundation.authz.UserRole
import com.fitconnect.android.foundation.navigation.CoreRoute
import com.fitconnect.android.ui.auth.AuthScreen
import com.fitconnect.android.ui.theme.LocalAppContainer
import com.fitconnect.android.foundation.storage.isCoachOnboardingDone
import com.fitconnect.android.foundation.storage.isOnboardingDone
import com.fitconnect.android.ui.onboarding.CoachOnboardingScreen
import androidx.compose.ui.platform.LocalContext
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
@Composable
fun FitConnectNavHost(
    navController: NavHostController = rememberNavController(),
) {
    val container = LocalAppContainer.current
    val scope = rememberCoroutineScope()

    fun navigateGuarded(target: CoreRoute) {
        scope.launch {
            val decision = container.navGuard.authorize(target)
            val dest = if (decision.allowed) {
                AppDestination.fromCore(target)
            } else {
                AppDestination.fromCore(decision.redirectTo ?: CoreRoute.GUEST)
            }
            navController.navigate(dest.route) {
                if (target == CoreRoute.HOME || target == CoreRoute.GUEST) {
                    popUpTo(0) { inclusive = true }
                }
            }
        }
    }

    NavHost(
        navController = navController,
        startDestination = AppDestination.Splash.route,
    ) {
        composable(AppDestination.Splash.route) {
            SplashRoute(
                onFinished = { loggedIn ->
                    navigateGuarded(if (loggedIn) CoreRoute.HOME else CoreRoute.GUEST)
                },
                restore = { container.authRepository.restoreSession() },
            )
        }
        composable(
            route = AppDestination.Guest.route,
            deepLinks = listOf(
                navDeepLink { uriPattern = "fitconnect://app/guest" },
                navDeepLink { uriPattern = "https://fitconnect-phi.vercel.app/app/guest" },
            ),
        ) {
            FoundationScreen(
                title = stringResource(R.string.nav_guest_title),
                body = stringResource(R.string.nav_guest_body),
                primaryLabel = stringResource(R.string.nav_continue_auth),
                onPrimary = { navigateGuarded(CoreRoute.AUTH) },
                secondaryLabel = stringResource(R.string.nav_continue_anonymous),
                onSecondary = {
                    scope.launch {
                        // Anonymous explores guest surfaces only Ã¢â‚¬â€ never Athlete/Coach OS.
                        container.authRepository.signInAnonymously()
                        navigateGuarded(CoreRoute.AUTH)
                    }
                },
                testTag = "screen_guest",
            )
        }
        composable(
            route = AppDestination.Auth.route,
            deepLinks = listOf(
                navDeepLink { uriPattern = "fitconnect://app/auth" },
                navDeepLink { uriPattern = "https://fitconnect-phi.vercel.app/app/auth" },
            ),
        ) {
            AuthScreen(
                config = container.config,
                authRepository = container.authRepository,
                analytics = container.analytics,
                errorPipeline = container.errorPipeline,
                onSignedIn = { navigateGuarded(CoreRoute.HOME) },
                onError = { navController.navigate(AppDestination.Error.route) },
            )
        }
        composable(
            route = AppDestination.LoggedHome.route,
            deepLinks = listOf(
                navDeepLink { uriPattern = "fitconnect://app/home" },
                navDeepLink { uriPattern = "https://fitconnect-phi.vercel.app/app/home" },
                navDeepLink { uriPattern = "fitconnect://app/athlete/home" },
            ),
        ) {
            val app = LocalContext.current.applicationContext as FitConnectApplication
            var allowed by remember { mutableStateOf<Boolean?>(null) }
            var role by remember { mutableStateOf<UserRole?>(null) }
            LaunchedEffect(Unit) {
                val decision = container.navGuard.authorize(CoreRoute.HOME)
                allowed = decision.allowed
                role = decision.role
                if (!decision.allowed) {
                    navController.navigate(AppDestination.fromCore(decision.redirectTo ?: CoreRoute.GUEST).route) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            }
            when {
                allowed != true -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        content = {},
                    )
                }
                role == UserRole.COACH -> {
                    var coachOnboardingDone by remember { mutableStateOf<Boolean?>(null) }
                    LaunchedEffect(Unit) {
                        coachOnboardingDone = container.keyValueStore.isCoachOnboardingDone()
                    }
                    when (coachOnboardingDone) {
                        null -> Spacer(modifier = Modifier.fillMaxSize())
                        false -> CoachOnboardingScreen(
                            keyValueStore = container.keyValueStore,
                            onFinished = { coachOnboardingDone = true },
                        )
                        true -> CoachOsApp(
                            container = app.coachContainer,
                            onSignedOut = {
                                scope.launch {
                                    container.authRepository.logout()
                                    container.analytics.reset()
                                    navigateGuarded(CoreRoute.GUEST)
                                }
                            },
                        )
                    }
                }
                role == UserRole.ATHLETE -> {
                    var onboardingDone by remember { mutableStateOf<Boolean?>(null) }
                    LaunchedEffect(Unit) {
                        onboardingDone = container.keyValueStore.isOnboardingDone()
                    }
                    when (onboardingDone) {
                        null -> Spacer(modifier = Modifier.fillMaxSize())
                        false -> com.fitconnect.android.ui.onboarding.OnboardingScreen(
                            keyValueStore = container.keyValueStore,
                            onFinished = { onboardingDone = true },
                        )
                        true -> AthleteOsApp(
                            container = app.athleteContainer,
                            onSignedOut = {
                                scope.launch {
                                    container.authRepository.logout()
                                    container.analytics.reset()
                                    navigateGuarded(CoreRoute.GUEST)
                                }
                            },
                        )
                    }
                }
                else -> {
                    // Anonymous / guest / unexpected roles never enter Athlete OS.
                    FoundationScreen(
                        title = stringResource(R.string.nav_home_title),
                        body = stringResource(R.string.nav_home_body),
                        primaryLabel = stringResource(R.string.nav_continue_auth),
                        onPrimary = { navigateGuarded(CoreRoute.AUTH) },
                        secondaryLabel = stringResource(R.string.nav_sign_out),
                        onSecondary = {
                            scope.launch {
                                container.authRepository.logout()
                                container.analytics.reset()
                                navigateGuarded(CoreRoute.GUEST)
                            }
                        },
                        testTag = "screen_home",
                    )
                }
            }
        }
        composable(
            route = AppDestination.Catalog.route,
            deepLinks = listOf(
                navDeepLink { uriPattern = "fitconnect://app/catalog" },
            ),
        ) {
            DesignSystemCatalog()
        }
        composable(AppDestination.RoleGate.route) {
            RoleGateRoute(
                loadRole = { container.authorizer.role() },
                onDenied = { navigateGuarded(CoreRoute.GUEST) },
                authorize = { container.navGuard.authorize(CoreRoute.ROLE) },
            )
        }
        composable(AppDestination.Error.route) {
            FoundationScreen(
                title = stringResource(R.string.nav_error_title),
                body = stringResource(R.string.nav_error_body),
                primaryLabel = stringResource(R.string.nav_back),
                onPrimary = { navController.popBackStack() },
                testTag = "screen_error",
            )
        }
    }
}

@Composable
private fun SplashRoute(
    restore: suspend () -> AppResult<*>,
    onFinished: (loggedIn: Boolean) -> Unit,
) {
    val reduceMotion = reduceMotionEnabled()
    val markAlpha = remember { Animatable(if (reduceMotion) 1f else 0f) }
    val glowAlpha = remember { Animatable(if (reduceMotion) 0.35f else 0f) }
    // Theme already maps FLOOR / VOLTLINE from EliteSurfaceTokens (landing parity).
    val floor = MaterialTheme.colorScheme.background
    val volt = MaterialTheme.colorScheme.primary

    LaunchedEffect(Unit) {
        if (!reduceMotion) {
            markAlpha.animateTo(1f, tween(420))
            glowAlpha.animateTo(0.45f, tween(520))
        }
        val restored = restore()
        // Cap brand beat; never invent long fake loaders.
        delay(if (reduceMotion) 0 else 180)
        onFinished(restored is AppResult.Ok<*>)
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(floor)
            .testTag("screen_splash")
            .semantics { contentDescription = "FitConnect Elite OS" },
        contentAlignment = Alignment.Center,
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .alpha(glowAlpha.value)
                .background(
                    Brush.radialGradient(
                        colors = listOf(volt.copy(alpha = 0.18f), Color.Transparent),
                    ),
                ),
        )
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Image(
                painter = painterResource(R.drawable.ic_fitconnect_brand),
                contentDescription = stringResource(R.string.app_name),
                modifier = Modifier
                    .size(96.dp)
                    .alpha(markAlpha.value),
            )
            Spacer(modifier = Modifier.height(20.dp))
            Text(
                text = stringResource(R.string.app_name),
                style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onBackground,
                modifier = Modifier.alpha(markAlpha.value),
            )
            Text(
                text = stringResource(R.string.splash_tagline),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.alpha(markAlpha.value),
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "SYS.MARK → INIT → TELEMETRY",
                style = MaterialTheme.typography.labelLarge,
                color = volt,
                modifier = Modifier
                    .alpha(markAlpha.value)
                    .testTag("splash_sys_init"),
            )
            if (com.fitconnect.android.BuildConfig.DEBUG) {
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = "LOCAL_DEMO",
                    style = MaterialTheme.typography.labelLarge,
                    color = volt,
                    modifier = Modifier.alpha(markAlpha.value),
                )
            }
        }
    }
}

@Composable
private fun RoleGateRoute(
    loadRole: suspend () -> UserRole,
    authorize: suspend () -> com.fitconnect.android.foundation.navigation.NavDecision,
    onDenied: () -> Unit,
) {
    var roleName by remember { mutableStateOf("Ã¢â‚¬Â¦") }
    LaunchedEffect(Unit) {
        val decision = authorize()
        if (!decision.allowed) {
            onDenied()
            return@LaunchedEffect
        }
        roleName = loadRole().name
    }
    FoundationScreen(
        title = stringResource(R.string.nav_role_title),
        body = stringResource(R.string.nav_role_body, roleName),
        primaryLabel = null,
        onPrimary = null,
        testTag = "screen_role",
    )
}

@Composable
private fun FoundationScreen(
    title: String,
    body: String,
    primaryLabel: String?,
    onPrimary: (() -> Unit)?,
    testTag: String,
    secondaryLabel: String? = null,
    onSecondary: (() -> Unit)? = null,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp)
            .testTag(testTag),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(text = title, style = MaterialTheme.typography.headlineSmall)
        Spacer(modifier = Modifier.height(12.dp))
        Text(
            text = body,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(modifier = Modifier.height(24.dp))
        if (primaryLabel != null && onPrimary != null) {
            Button(
                onClick = onPrimary,
                modifier = Modifier
                    .sizeIn(
                        minWidth = Accessibility.MIN_TOUCH_TARGET_DP.dp,
                        minHeight = Accessibility.MIN_TOUCH_TARGET_DP.dp,
                    )
                    .semantics { contentDescription = primaryLabel }
                    .testTag("${testTag}_primary"),
            ) {
                Text(primaryLabel)
            }
        }
        if (secondaryLabel != null && onSecondary != null) {
            Spacer(modifier = Modifier.height(12.dp))
            Button(
                onClick = onSecondary,
                modifier = Modifier
                    .sizeIn(
                        minWidth = Accessibility.MIN_TOUCH_TARGET_DP.dp,
                        minHeight = Accessibility.MIN_TOUCH_TARGET_DP.dp,
                    )
                    .testTag("${testTag}_secondary"),
            ) {
                Text(secondaryLabel)
            }
        }
    }
}
