package com.fitconnect.android.foundation.analytics

/**
 * Analytics port — multi-provider fan-out. PostHog / Firebase plug in behind
 * [AnalyticsProvider]; product code only talks to [Analytics].
 */
interface Analytics {
    fun screen(name: String, properties: Map<String, String> = emptyMap())
    fun track(event: AnalyticsEvent)
    fun identify(userId: String, traits: Map<String, String> = emptyMap())
    fun reset()
}

data class AnalyticsEvent(
    val name: String,
    val properties: Map<String, String> = emptyMap(),
)

interface AnalyticsProvider {
    fun screen(name: String, properties: Map<String, String>)
    fun track(event: AnalyticsEvent)
    fun identify(userId: String, traits: Map<String, String>)
    fun reset()
}

class NoOpAnalytics : Analytics, AnalyticsProvider {
    override fun screen(name: String, properties: Map<String, String>) = Unit
    override fun track(event: AnalyticsEvent) = Unit
    override fun identify(userId: String, traits: Map<String, String>) = Unit
    override fun reset() = Unit
}

class CompositeAnalytics(
    private val providers: List<AnalyticsProvider>,
) : Analytics {
    override fun screen(name: String, properties: Map<String, String>) {
        providers.forEach { it.screen(name, properties) }
    }

    override fun track(event: AnalyticsEvent) {
        providers.forEach { it.track(event) }
    }

    override fun identify(userId: String, traits: Map<String, String>) {
        providers.forEach { it.identify(userId, traits) }
    }

    override fun reset() {
        providers.forEach { it.reset() }
    }
}
