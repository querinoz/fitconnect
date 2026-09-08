package com.fitconnect.android.athlete.connections

/**
 * Profile → Connections hub models.
 * Tokens never live here — only connection state for UI.
 */

enum class ConnectionCategory {
    DEVICES,
    FITNESS,
    MUSIC,
    SOCIAL,
    AUTOMATION,
    CALENDAR,
}

enum class ConnectionState {
    DISCONNECTED,
    CONNECTED,
    SYNCING,
    EXPIRED,
    NEEDS_ATTENTION,
    PERMISSION_REQUIRED,
}

data class IntegrationConnection(
    val id: String,
    val category: ConnectionCategory,
    val displayName: String,
    val state: ConnectionState,
    val lastSyncEpochMs: Long? = null,
    val lastAutomationEpochMs: Long? = null,
    val detail: String? = null,
)

/** Spotify metadata snapshot for training/feed — never audio bytes. */
data class SpotifyNowPlaying(
    val trackId: String,
    val trackName: String,
    val artist: String,
    val album: String?,
    val spotifyUrl: String,
    val capturedAtEpochMs: Long,
)

interface ConnectionsCatalog {
    fun all(): List<IntegrationConnection>
    fun byCategory(category: ConnectionCategory): List<IntegrationConnection>
}

class DefaultConnectionsCatalog(
    private val nowPlaying: () -> SpotifyNowPlaying? = { null },
) : ConnectionsCatalog {
    private val items = listOf(
        IntegrationConnection("wear_os", ConnectionCategory.DEVICES, "Wear OS", ConnectionState.DISCONNECTED, detail = "Pair from Connected Devices"),
        IntegrationConnection("health_connect", ConnectionCategory.DEVICES, "Health Connect", ConnectionState.PERMISSION_REQUIRED, detail = "Grant sensors"),
        IntegrationConnection("strava", ConnectionCategory.FITNESS, "Strava", ConnectionState.DISCONNECTED, detail = "Personal sync only — never social"),
        IntegrationConnection("spotify", ConnectionCategory.MUSIC, "Spotify", ConnectionState.DISCONNECTED, detail = "Metadata/link only"),
        IntegrationConnection("instagram", ConnectionCategory.SOCIAL, "Instagram", ConnectionState.DISCONNECTED),
        IntegrationConnection("facebook", ConnectionCategory.SOCIAL, "Facebook", ConnectionState.DISCONNECTED),
        IntegrationConnection("x", ConnectionCategory.SOCIAL, "X", ConnectionState.DISCONNECTED),
        IntegrationConnection("tiktok", ConnectionCategory.SOCIAL, "TikTok", ConnectionState.DISCONNECTED),
        IntegrationConnection("linkedin", ConnectionCategory.SOCIAL, "LinkedIn", ConnectionState.DISCONNECTED),
        IntegrationConnection("threads", ConnectionCategory.SOCIAL, "Threads", ConnectionState.DISCONNECTED),
        IntegrationConnection("zapier", ConnectionCategory.AUTOMATION, "Zapier", ConnectionState.DISCONNECTED, detail = "Distribution orchestrator"),
        IntegrationConnection("calendar", ConnectionCategory.CALENDAR, "Calendar", ConnectionState.DISCONNECTED),
    )

    override fun all(): List<IntegrationConnection> = items

    override fun byCategory(category: ConnectionCategory): List<IntegrationConnection> =
        items.filter { it.category == category }

    fun spotifyNowPlaying(): SpotifyNowPlaying? = nowPlaying()
}
