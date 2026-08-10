package com.fitconnect.android.ui.navigation

import com.fitconnect.android.foundation.navigation.CoreRoute

/**
 * Typed route table aligned with [CoreRoute]. Feature graphs attach later.
 */
sealed class AppDestination(val route: String) {
    data object Splash : AppDestination(CoreRoute.SPLASH.path)
    data object Guest : AppDestination(CoreRoute.GUEST.path)
    data object Auth : AppDestination(CoreRoute.AUTH.path)
    data object LoggedHome : AppDestination(CoreRoute.HOME.path)
    data object RoleGate : AppDestination(CoreRoute.ROLE.path)
    data object Catalog : AppDestination(CoreRoute.CATALOG.path)
    data object Error : AppDestination(CoreRoute.ERROR.path)

    companion object {
        const val DEEP_LINK_URI_PATTERN = "fitconnect://app/{screen}"
        const val UNIVERSAL_LINK_PATTERN = "https://fitconnect-phi.vercel.app/app/{screen}"

        fun fromCore(core: CoreRoute): AppDestination = when (core) {
            CoreRoute.SPLASH -> Splash
            CoreRoute.GUEST -> Guest
            CoreRoute.AUTH -> Auth
            CoreRoute.HOME -> LoggedHome
            CoreRoute.ROLE -> RoleGate
            CoreRoute.CATALOG -> Catalog
            CoreRoute.ERROR -> Error
        }
    }
}
