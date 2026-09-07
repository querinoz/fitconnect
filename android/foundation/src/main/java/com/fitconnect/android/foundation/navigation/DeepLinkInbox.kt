package com.fitconnect.android.foundation.navigation

import android.net.Uri
import kotlinx.coroutines.channels.BufferOverflow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow

/**
 * Cross-layer deep-link bus for FitConnect shell ↔ Athlete/Coach graphs.
 *
 * MainActivity offers URIs from onCreate / onNewIntent without setIntent(VIEW)
 * (ActivityScenario E2E contract).
 */
object DeepLinkInbox {
    @Volatile
    private var latest: Uri? = null

    private val _uris = MutableSharedFlow<Uri>(
        extraBufferCapacity = 8,
        onBufferOverflow = BufferOverflow.DROP_OLDEST,
    )
    val uris: SharedFlow<Uri> = _uris.asSharedFlow()

    fun offer(uri: Uri?) {
        if (uri == null) return
        latest = uri
        _uris.tryEmit(uri)
    }

    fun peek(): Uri? = latest

    fun clear() {
        latest = null
    }

    fun clearIf(uri: Uri) {
        if (latest == uri) latest = null
    }

    /** Test / process reset. */
    fun resetForTests() {
        latest = null
    }
}

sealed class DeepLinkTarget {
    data object Guest : DeepLinkTarget()
    data object Auth : DeepLinkTarget()
    data object Home : DeepLinkTarget()
    data object Catalog : DeepLinkTarget()
    data class AthleteNested(val path: String) : DeepLinkTarget()
    data object Unknown : DeepLinkTarget()
}

fun classifyDeepLink(uri: Uri): DeepLinkTarget =
    classifyDeepLinkPath(deepLinkAppPath(uri))

/** JVM-safe classifier from normalized app path (no leading slash). */
fun classifyDeepLinkPath(path: String?): DeepLinkTarget {
    if (path == null) return DeepLinkTarget.Unknown
    return when {
        path.isEmpty() || path == "guest" -> DeepLinkTarget.Guest
        path == "auth" -> DeepLinkTarget.Auth
        path == "home" || path == "athlete/home" -> DeepLinkTarget.Home
        path == "catalog" -> DeepLinkTarget.Catalog
        path.startsWith("athlete/") -> DeepLinkTarget.AthleteNested(path)
        else -> DeepLinkTarget.Unknown
    }
}

fun deepLinkAppPath(uri: Uri): String? {
    val scheme = uri.scheme?.lowercase() ?: return null
    return when (scheme) {
        "fitconnect" -> {
            if (uri.host != "app") return null
            uri.path.orEmpty().trim('/')
        }
        "https" -> {
            if (uri.host != "fitconnect-phi.vercel.app") return null
            val raw = uri.path.orEmpty()
            if (!raw.startsWith("/app")) return null
            raw.removePrefix("/app").trim('/')
        }
        else -> null
    }
}

/**
 * String parser for unit tests (no Android Uri dependency).
 * Accepts `fitconnect://app/…` and `https://fitconnect-phi.vercel.app/app/…`.
 */
fun deepLinkAppPathString(uriString: String): String? {
    val s = uriString.trim()
    return when {
        s.startsWith("fitconnect://app/") -> s.removePrefix("fitconnect://app/").substringBefore('?').trim('/')
        s == "fitconnect://app" || s == "fitconnect://app/" -> ""
        s.startsWith("https://fitconnect-phi.vercel.app/app/") ->
            s.removePrefix("https://fitconnect-phi.vercel.app/app/").substringBefore('?').trim('/')
        s.startsWith("https://fitconnect-phi.vercel.app/app") -> ""
        else -> null
    }
}

/** REAL session demo flag beats debug build watermark. */
fun identityBadgeLabel(isDebugBuild: Boolean, isLocalDemoSession: Boolean): String? = when {
    isLocalDemoSession -> "LOCAL_DEMO"
    isDebugBuild -> "DEBUG"
    else -> null
}
