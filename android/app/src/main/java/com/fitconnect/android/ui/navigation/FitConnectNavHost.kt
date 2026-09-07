package com.fitconnect.android.ui.navigation

import android.content.Intent
import android.net.Uri
import androidx.activity.compose.PredictiveBackHandler
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
import androidx.compose.ui.platform.LocalContext
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
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navDeepLink
import com.fitconnect.android.BuildConfig
import com.fitconnect.android.FitConnectApplication
import com.fitconnect.android.R
import com.fitconnect.android.athlete.ui.AthleteOsApp
import com.fitconnect.android.coach.ui.CoachOsApp
import com.fitconnect.android.designui.atmosphere.HoneycombAtmosphere
import com.fitconnect.android.designui.catalog.DesignSystemCatalog
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteCardVariant
import com.fitconnect.android.designui.components.EliteLoading
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.reduceMotionEnabled
import com.fitconnect.android.foundation.authz.UserRole
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.identity.hydrateLocalOnboarding
import com.fitconnect.android.foundation.navigation.CoreRoute
import com.fitconnect.android.foundation.storage.isCoachOnboardingDone
import com.fitconnect.android.foundation.storage.isOnboardingDone
import com.fitconnect.android.foundation.storage.needsIdentityRoleSelection
import com.fitconnect.android.foundation.navigation.DeepLinkInbox
import com.fitconnect.android.foundation.navigation.DeepLinkTarget
import com.fitconnect.android.foundation.navigation.classifyDeepLink
import com.fitconnect.android.foundation.navigation.identityBadgeLabel
import com.fitconnect.android.ui.auth.AuthScreen
import com.fitconnect.android.ui.onboarding.CoachOnboardingScreen
import com.fitconnect.android.ui.theme.LocalAppContainer
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

@Composable
fun FitConnectNavHost(
    navController: NavHostController = rememberNavController(),
) {
    val container = LocalAppContainer.current
    val scope = rememberCoroutineScope()
    val backStack by navController.currentBackStackEntryAsState()
    val canPredictivePop = navController.previousBackStackEntry != null &&
        backStack?.destination?.route != AppDestination.Splash.route
    PredictiveBackHandler(enabled = canPredictivePop) { progress ->
        try {
            progress.collect { }
            navController.popBackStack()
        } catch (_: kotlinx.coroutines.CancellationException) {
            // Gesture cancelled — keep the current destination.
        }
    }

    var bootComplete by remember { mutableStateOf(false) }
    var pendingDeepLink by remember { mutableStateOf<Uri?>(DeepLinkInbox.peek()) }

    fun navigateGuarded(target: CoreRoute) {
        scope.launch {
            val decision = container.navGuard.authorize(target)
            val dest = if (decision.allowed) {
                AppDestination.fromCore(target)
            } else {
                AppDestination.fromCore(decision.redirectTo ?: CoreRoute.GUEST)
            }
            withContext(Dispatchers.Main.immediate) {
                navController.navigate(dest.route) {
                    if (target == CoreRoute.HOME || target == CoreRoute.GUEST) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            }
        }
    }

    fun goShell(dest: AppDestination, clearBack: Boolean = true) {
        navController.navigate(dest.route) {
            if (clearBack) popUpTo(0) { inclusive = true }
        }
    }

    /**
     * Routes shell destinations immediately. Nested athlete URIs keep the Uri in
     * [DeepLinkInbox] so [AthleteOsApp] can handleDeepLink after HOME mounts.
     */
    fun applyDeepLink(uri: Uri, loggedIn: Boolean) {
        when (val target = classifyDeepLink(uri)) {
            DeepLinkTarget.Guest -> {
                DeepLinkInbox.clearIf(uri)
                goShell(AppDestination.Guest)
            }
            DeepLinkTarget.Auth -> {
                DeepLinkInbox.clearIf(uri)
                goShell(AppDestination.Auth)
            }
            DeepLinkTarget.Catalog -> {
                DeepLinkInbox.clearIf(uri)
                if (BuildConfig.DEBUG) goShell(AppDestination.Catalog, clearBack = false)
                else navigateGuarded(if (loggedIn) CoreRoute.HOME else CoreRoute.GUEST)
            }
            DeepLinkTarget.Home -> {
                DeepLinkInbox.clearIf(uri)
                if (loggedIn) goShell(AppDestination.LoggedHome)
                else goShell(AppDestination.Auth)
            }
            is DeepLinkTarget.AthleteNested -> {
                // Uri already in DeepLinkInbox.latest — do not re-offer (avoids collect loop).
                if (loggedIn) goShell(AppDestination.LoggedHome)
                else {
                    DeepLinkInbox.clearIf(uri)
                    goShell(AppDestination.Auth)
                }
            }
            DeepLinkTarget.Unknown -> {
                DeepLinkInbox.clearIf(uri)
                navigateGuarded(if (loggedIn) CoreRoute.HOME else CoreRoute.GUEST)
            }
        }
    }

    LaunchedEffect(bootComplete) {
        DeepLinkInbox.uris.collect { uri ->
            if (!bootComplete) {
                pendingDeepLink = uri
            } else {
                val loggedIn = container.sessionStore.snapshot().userId != null &&
                    container.sessionStore.snapshot().role != UserRole.GUEST
                applyDeepLink(uri, loggedIn)
            }
        }
    }

    NavHost(
        navController = navController,
        startDestination = AppDestination.Splash.route,
    ) {
        composable(AppDestination.Splash.route) {
            SplashRoute(
                onFinished = { loggedIn, _ ->
                    bootComplete = true
                    val uri = pendingDeepLink ?: DeepLinkInbox.peek()
                    pendingDeepLink = null
                    if (uri != null) {
                        applyDeepLink(uri, loggedIn)
                    } else {
                        navigateGuarded(if (loggedIn) CoreRoute.HOME else CoreRoute.GUEST)
                    }
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
                onSignedIn = { navigateGuarded(CoreRoute.HOME) },
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
            var authError by remember { mutableStateOf<String?>(null) }
            LaunchedEffect(Unit) {
                runCatching {
                    val decision = container.navGuard.authorize(CoreRoute.HOME)
                    allowed = decision.allowed
                    role = decision.role
                    if (!decision.allowed) {
                        navController.navigate(AppDestination.fromCore(decision.redirectTo ?: CoreRoute.GUEST).route) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                }.onFailure { e ->
                    authError = e.message ?: "authorize_failed"
                    allowed = false
                }
            }
            when {
                authError != null -> {
                    FoundationScreen(
                        title = stringResource(R.string.nav_error_title),
                        body = authError ?: stringResource(R.string.nav_error_body),
                        primaryLabel = stringResource(R.string.nav_continue_auth),
                        onPrimary = { navigateGuarded(CoreRoute.AUTH) },
                        testTag = "screen_home_auth_error",
                    )
                }
                allowed == null -> {
                    BootLoadingSurface(label = "SYS.AUTH")
                }
                allowed != true -> {
                    // Redirect in flight — keep loading, never an empty black Box.
                    BootLoadingSurface(label = "SYS.REDIRECT")
                }
                else -> {
                    var needsRole by remember { mutableStateOf<Boolean?>(null) }
                    var sessionRole by remember { mutableStateOf(role) }
                    LaunchedEffect(role, needsRole) {
                        val snap = container.sessionStore.snapshot()
                        sessionRole = snap.role
                        needsRole = container.keyValueStore.needsIdentityRoleSelection(
                            snap.userId.orEmpty(),
                            snap.isLocalDemo,
                        )
                    }
                    when (needsRole) {
                        null -> BootLoadingSurface(label = "SYS.ROLE")
                        true -> com.fitconnect.android.ui.auth.RoleSelectScreen(
                            authRepository = container.authRepository,
                            onSelected = {
                                scope.launch {
                                    sessionRole = container.sessionStore.role()
                                    needsRole = false
                                }
                            },
                        )
                        false -> when (sessionRole) {
                            UserRole.COACH -> {
                                var coachOnboardingDone by remember { mutableStateOf<Boolean?>(null) }
                                var localDemoSession by remember { mutableStateOf(false) }
                                LaunchedEffect(Unit) {
                                    localDemoSession = container.sessionStore.snapshot().isLocalDemo
                                    if (!localDemoSession) {
                                        container.identityRemote.hydrateLocalOnboarding(container.keyValueStore)
                                    }
                                    coachOnboardingDone = container.keyValueStore.isCoachOnboardingDone()
                                }
                                when (coachOnboardingDone) {
                                    null -> BootLoadingSurface(label = "SYS.ONBOARD")
                                    false -> CoachOnboardingScreen(
                                        keyValueStore = container.keyValueStore,
                                        identityRemote = container.identityRemote,
                                        onFinished = { coachOnboardingDone = true },
                                        isLocalDemoSession = localDemoSession,
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
                            UserRole.ATHLETE -> {
                                var onboardingDone by remember { mutableStateOf<Boolean?>(null) }
                                var localDemoSession by remember { mutableStateOf(false) }
                                LaunchedEffect(Unit) {
                                    localDemoSession = container.sessionStore.snapshot().isLocalDemo
                                    if (!localDemoSession) {
                                        container.identityRemote.hydrateLocalOnboarding(container.keyValueStore)
                                    }
                                    onboardingDone = container.keyValueStore.isOnboardingDone()
                                }
                                when (onboardingDone) {
                                    null -> BootLoadingSurface(label = "SYS.ONBOARD")
                                    false -> com.fitconnect.android.ui.onboarding.OnboardingScreen(
                                        keyValueStore = container.keyValueStore,
                                        identityRemote = container.identityRemote,
                                        onFinished = { onboardingDone = true },
                                        isLocalDemoSession = localDemoSession,
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
                }
            }
        }
        if (BuildConfig.DEBUG) {
            composable(
                route = AppDestination.Catalog.route,
                deepLinks = listOf(
                    navDeepLink { uriPattern = "fitconnect://app/catalog" },
                ),
            ) {
                DesignSystemCatalog()
            }
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
private fun BootLoadingSurface(label: String) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .testTag("screen_boot_loading")
            .semantics { contentDescription = "Loading $label" },
        contentAlignment = Alignment.Center,
    ) {
        EliteLoading(label = label)
    }
}

@Composable
private fun SplashRoute(
    restore: suspend () -> AppResult<*>,
    onFinished: (loggedIn: Boolean, isLocalDemo: Boolean) -> Unit,
) {
    val reduceMotion = reduceMotionEnabled()
    val markAlpha = remember { Animatable(if (reduceMotion) 1f else 0f) }
    val glowAlpha = remember { Animatable(if (reduceMotion) 0.35f else 0f) }
    val floor = MaterialTheme.colorScheme.background
    val volt = MaterialTheme.colorScheme.primary
    var badge by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        if (!reduceMotion) {
            markAlpha.animateTo(1f, tween(420))
            glowAlpha.animateTo(0.45f, tween(520))
        }
        val restored = restore()
        val loggedIn = restored is AppResult.Ok<*>
        val localDemo = (restored as? AppResult.Ok<*>)?.value.let { snap ->
            (snap as? com.fitconnect.android.foundation.session.SessionSnapshot)?.isLocalDemo == true
        }
        badge = identityBadgeLabel(
            isDebugBuild = BuildConfig.DEBUG,
            isLocalDemoSession = localDemo,
        )
        delay(if (reduceMotion) 0 else 180)
        onFinished(loggedIn, localDemo)
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
            Text(
                text = "ELITE OS",
                style = MaterialTheme.typography.labelLarge,
                color = volt,
                modifier = Modifier.alpha(markAlpha.value),
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "BIOMETRIC · TELEMETRY · AI · CONNECT",
                style = MaterialTheme.typography.labelLarge,
                color = volt,
                modifier = Modifier
                    .alpha(markAlpha.value)
                    .testTag("splash_sys_init"),
            )
            badge?.let { label ->
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = label,
                    style = MaterialTheme.typography.labelLarge,
                    color = volt,
                    modifier = Modifier
                        .alpha(markAlpha.value)
                        .testTag("splash_identity_badge"),
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
    var roleName by remember { mutableStateOf<String?>(null) }
    var denied by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) {
        val decision = authorize()
        if (!decision.allowed) {
            denied = true
            onDenied()
            return@LaunchedEffect
        }
        roleName = loadRole().name
    }
    when {
        denied -> BootLoadingSurface(label = "SYS.REDIRECT")
        roleName == null -> BootLoadingSurface(label = "SYS.ROLE")
        else -> FoundationScreen(
            title = stringResource(R.string.nav_role_title),
            body = stringResource(R.string.nav_role_body, roleName!!),
            primaryLabel = null,
            onPrimary = null,
            testTag = "screen_role",
        )
    }
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
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .testTag(testTag),
    ) {
        HoneycombAtmosphere(
            modifier = Modifier.fillMaxSize(),
            strokeColor = MaterialTheme.colorScheme.primary,
        )
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(EliteSpace.Inset),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            EliteCard(variant = EliteCardVariant.Glass) {
                EliteSysLabel(stringResource(R.string.app_name))
                Spacer(modifier = Modifier.height(EliteSpace.Sm))
                Text(
                    text = title,
                    style = MaterialTheme.typography.headlineSmall,
                    color = MaterialTheme.colorScheme.onBackground,
                )
                Spacer(modifier = Modifier.height(EliteSpace.Xs))
                Text(
                    text = body,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                if (primaryLabel != null && onPrimary != null) {
                    Spacer(modifier = Modifier.height(EliteSpace.Lg))
                    EliteButton(
                        label = primaryLabel,
                        onClick = onPrimary,
                        contentDescription = primaryLabel,
                        modifier = Modifier.testTag("${testTag}_primary"),
                    )
                }
                if (secondaryLabel != null && onSecondary != null) {
                    Spacer(modifier = Modifier.height(EliteSpace.Sm))
                    EliteButton(
                        label = secondaryLabel,
                        onClick = onSecondary,
                        variant = EliteButtonVariant.Secondary,
                        modifier = Modifier.testTag("${testTag}_secondary"),
                    )
                }
            }
        }
    }
}
