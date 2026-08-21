package com.fitconnect.android.foundation.di

import android.content.Context
import com.fitconnect.android.foundation.analytics.Analytics
import com.fitconnect.android.foundation.analytics.CompositeAnalytics
import com.fitconnect.android.foundation.analytics.NoOpAnalytics
import com.fitconnect.android.foundation.auth.AuthRepository
import com.fitconnect.android.foundation.auth.BiometricGate
import com.fitconnect.android.foundation.auth.CompositeAuthRepository
import com.fitconnect.android.foundation.auth.LocalAuthRepository
import com.fitconnect.android.foundation.auth.SessionBiometricGate
import com.fitconnect.android.foundation.auth.TokenRefresher
import com.fitconnect.android.foundation.authz.Authorizer
import com.fitconnect.android.foundation.authz.SessionAuthorizer
import com.fitconnect.android.foundation.common.AndroidLogger
import com.fitconnect.android.foundation.common.Logger
import com.fitconnect.android.foundation.config.AppConfig
import com.fitconnect.android.foundation.config.ProductionConfigGate
import com.fitconnect.android.foundation.error.DefaultErrorPipeline
import com.fitconnect.android.foundation.error.ErrorPipeline
import com.fitconnect.android.foundation.flags.DefaultFeatureFlagStore
import com.fitconnect.android.foundation.flags.FeatureFlagStore
import com.fitconnect.android.foundation.i18n.DefaultLocaleManager
import com.fitconnect.android.foundation.i18n.LocaleManager
import com.fitconnect.android.foundation.lifecycle.AppLifecycle
import com.fitconnect.android.foundation.lifecycle.DefaultAppLifecycle
import com.fitconnect.android.foundation.navigation.NavGuard
import com.fitconnect.android.foundation.identity.HttpIdentityRemote
import com.fitconnect.android.foundation.identity.IdentityRemote
import com.fitconnect.android.foundation.network.AndroidConnectivityMonitor
import com.fitconnect.android.foundation.network.ApiClient
import com.fitconnect.android.foundation.network.AuthTokenProvider
import com.fitconnect.android.foundation.network.ConnectivityMonitor
import com.fitconnect.android.foundation.network.HttpTrpcPort
import com.fitconnect.android.foundation.network.NetworkConfig
import com.fitconnect.android.foundation.network.FailClosedRealtimeClient
import com.fitconnect.android.foundation.network.InProcessRealtimeClient
import com.fitconnect.android.foundation.network.OkHttpApiClient
import com.fitconnect.android.foundation.network.RealtimeClient
import com.fitconnect.android.foundation.network.SupabaseRealtimeClient
import com.fitconnect.android.foundation.network.TrpcPort
import com.fitconnect.android.foundation.notifications.DevNotificationGateway
import com.fitconnect.android.foundation.notifications.FailClosedNotificationGateway
import com.fitconnect.android.foundation.notifications.NotificationGateway
import com.fitconnect.android.foundation.offline.DefaultOfflineCoordinator
import com.fitconnect.android.foundation.offline.DurableSyncQueue
import com.fitconnect.android.foundation.offline.OfflineCoordinator
import com.fitconnect.android.foundation.offline.OfflineWorkExecutor
import com.fitconnect.android.foundation.offline.RegistryOfflineExecutor
import com.fitconnect.android.foundation.offline.SyncQueue
import com.fitconnect.android.foundation.performance.ImageLoader
import com.fitconnect.android.foundation.performance.NoOpImageLoader
import com.fitconnect.android.foundation.permissions.AndroidPermissionGateway
import com.fitconnect.android.foundation.permissions.PermissionGateway
import com.fitconnect.android.foundation.security.AccountIsolationController
import com.fitconnect.android.foundation.session.SecureSessionStore
import com.fitconnect.android.foundation.session.SessionStore
import com.fitconnect.android.foundation.storage.DataStoreKeyValueStore
import com.fitconnect.android.foundation.storage.EncryptedSecureStore
import com.fitconnect.android.foundation.storage.KeyValueStore
import com.fitconnect.android.foundation.storage.SecureStore
import com.fitconnect.android.foundation.theme.DefaultThemeSettings
import com.fitconnect.android.foundation.theme.ThemeSettings
import android.util.Log

/**
 * Composition-root DI for the Core Platform. Heavy crypto and feature
 * containers are deferred; only the shell needed for splash/auth hydrates
 * eagerly. See Phase 11 startup report.
 */
interface AppContainer {
    val config: AppConfig
    val logger: Logger
    val analytics: Analytics
    val keyValueStore: KeyValueStore
    val secureStore: SecureStore
    val sessionStore: SessionStore
    val authRepository: AuthRepository
    val tokenRefresher: TokenRefresher
    val authorizer: Authorizer
    val navGuard: NavGuard
    val apiClient: ApiClient
    val trpc: TrpcPort
    val realtime: RealtimeClient
    val syncQueue: SyncQueue
    val offline: OfflineCoordinator
    val offlineExecutor: RegistryOfflineExecutor
    val connectivity: ConnectivityMonitor
    val lifecycle: AppLifecycle
    val permissions: PermissionGateway
    val notifications: NotificationGateway
    val featureFlags: FeatureFlagStore
    val localeManager: LocaleManager
    val themeSettings: ThemeSettings
    val biometricGate: BiometricGate
    val errorPipeline: ErrorPipeline
    val imageLoader: ImageLoader
    val accountIsolation: AccountIsolationController
    val identityRemote: IdentityRemote
}

class DefaultAppContainer(
    context: Context,
    override val config: AppConfig,
    /** When true (CI `-Pfitconnect.enforceProdConfig=true`), missing IdP fails composition. */
    enforceProductionConfig: Boolean = false,
    /**
     * App module may supply real FCM. Return null to use foundation defaults
     * (DevNotificationGateway debug / FailClosedNotificationGateway release).
     */
    private val notificationOverride: ((Logger) -> NotificationGateway?)? = null,
    /**
     * App module may supply Firebase identity. Return null to use local/fail-closed.
     * Supabase Auth is not a second IdP.
     */
    private val identityAuthOverride: ((AppContainer) -> AuthRepository?)? = null,
) : AppContainer {
    private val appContext = context.applicationContext

    init {
        ProductionConfigGate.assertOrThrow(config, enforce = enforceProductionConfig)
    }

    override val logger: Logger = AndroidLogger(
        minPriority = if (config.isDebuggable) Log.DEBUG else Log.WARN,
    )
    override val analytics: Analytics = CompositeAnalytics(listOf(NoOpAnalytics()))
    override val keyValueStore: KeyValueStore = DataStoreKeyValueStore(appContext)

    // MasterKey / EncryptedSharedPreferences is expensive — defer until first use.
    override val secureStore: SecureStore by lazy { EncryptedSecureStore(appContext) }
    override val sessionStore: SessionStore by lazy { SecureSessionStore(secureStore) }
    override val featureFlags: FeatureFlagStore by lazy { DefaultFeatureFlagStore(keyValueStore) }
    override val localeManager: LocaleManager by lazy { DefaultLocaleManager(keyValueStore) }
    override val themeSettings: ThemeSettings by lazy { DefaultThemeSettings(keyValueStore) }
    override val permissions: PermissionGateway = AndroidPermissionGateway(appContext)
    override val notifications: NotificationGateway by lazy {
        notificationOverride?.invoke(logger)
            ?: when {
                config.isDebuggable -> DevNotificationGateway(logger)
                else -> FailClosedNotificationGateway(logger)
            }
    }
    override val imageLoader: ImageLoader = NoOpImageLoader()
    override val syncQueue: SyncQueue = DurableSyncQueue(appContext)
    override val connectivity: ConnectivityMonitor = AndroidConnectivityMonitor(appContext)
    override val realtime: RealtimeClient by lazy {
        when {
            config.usesLiveAuth -> SupabaseRealtimeClient(config, sessionStore, logger)
            config.isDebuggable -> InProcessRealtimeClient(logger = logger)
            else -> FailClosedRealtimeClient(logger)
        }
    }
    override val errorPipeline: ErrorPipeline by lazy { DefaultErrorPipeline(logger, analytics) }

    override val accountIsolation: AccountIsolationController by lazy {
        AccountIsolationController(
            sessionStore = sessionStore,
            syncQueue = syncQueue,
            keyValueStore = keyValueStore,
            logger = logger,
        )
    }

    private val localAuth by lazy {
        LocalAuthRepository(
            sessionStore = sessionStore,
            logger = logger,
            isolation = accountIsolation,
            allowLocalCoachElevation = config.isDebuggable && config.allowLocalAuth,
            allowLocalAuth = config.allowLocalAuth,
            keyValueStore = keyValueStore,
        )
    }

    override val identityRemote: IdentityRemote by lazy {
        HttpIdentityRemote(api = { apiClient }, logger = logger)
    }

    /** Firebase identity when provided; otherwise local demo or fail-closed. */
    override val authRepository: AuthRepository by lazy {
        val live = identityAuthOverride?.invoke(this)
        CompositeAuthRepository(
            local = localAuth,
            live = live,
            allowLocalAuth = config.allowLocalAuth,
            connectivity = connectivity,
            logger = logger,
        )
    }
    override val tokenRefresher: TokenRefresher by lazy {
        authRepository as TokenRefresher
    }
    override val biometricGate: BiometricGate by lazy { SessionBiometricGate(sessionStore, featureFlags) }
    override val authorizer: Authorizer by lazy { SessionAuthorizer(sessionStore) }
    override val navGuard: NavGuard by lazy { NavGuard(sessionStore, authorizer, analytics) }

    private val tokenProvider = AuthTokenProvider { sessionStore.accessToken() }

    override val apiClient: ApiClient by lazy {
        OkHttpApiClient(
            config = NetworkConfig(
                baseUrl = config.apiBaseUrl,
                connectTimeoutMs = config.connectTimeoutMs,
                readTimeoutMs = config.readTimeoutMs,
                writeTimeoutMs = config.writeTimeoutMs,
            ),
            tokenProvider = tokenProvider,
            logger = logger,
            featureFlags = featureFlags,
            tokenRefresher = tokenRefresher,
            sessionStore = sessionStore,
        )
    }

    override val trpc: TrpcPort by lazy { HttpTrpcPort(apiClient) }

    override val offlineExecutor: RegistryOfflineExecutor = RegistryOfflineExecutor(logger)

    override val offline: OfflineCoordinator by lazy {
        DefaultOfflineCoordinator(
            queue = syncQueue,
            connectivity = connectivity,
            featureFlags = featureFlags,
            logger = logger,
            executor = offlineExecutor as OfflineWorkExecutor,
        )
    }

    override val lifecycle: AppLifecycle by lazy {
        DefaultAppLifecycle(
            connectivity = connectivity,
            logger = logger,
            onForeground = { authRepository.restoreSession() },
            onReconnect = { offline.flush() },
        )
    }
}
