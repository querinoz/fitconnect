package com.fitconnect.android.foundation.flags

import com.fitconnect.android.foundation.storage.KeyValueStore
import com.fitconnect.android.foundation.storage.PreferenceKeys
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.util.concurrent.ConcurrentHashMap

/**
 * Production feature-flag architecture: local defaults + remote overlay +
 * kill switches. No vendor lock-in — remote source is injected.
 */
enum class FeatureFlag(
    val key: String,
    val defaultEnabled: Boolean,
) {
    AUTH_GOOGLE("auth.google", true),
    AUTH_APPLE("auth.apple", false),
    AUTH_MAGIC_LINK("auth.magic_link", true),
    AUTH_BIOMETRIC("auth.biometric", true),
    OFFLINE_SYNC("offline.sync", true),
    PUSH_NOTIFICATIONS("notifications.push", false),
    KILL_SWITCH_NETWORK("kill.network", false),
    EXPERIMENT_NEW_SPLASH("experiment.new_splash", false),
}

interface FeatureFlagStore {
    fun isEnabled(flag: FeatureFlag): Boolean
    fun observe(flag: FeatureFlag): Flow<Boolean>
    suspend fun setLocal(flag: FeatureFlag, enabled: Boolean)
    suspend fun applyRemote(overrides: Map<String, Boolean>)
    fun killSwitchActive(): Boolean = isEnabled(FeatureFlag.KILL_SWITCH_NETWORK)
}

class DefaultFeatureFlagStore(
    private val keyValueStore: KeyValueStore,
) : FeatureFlagStore {
    private val remote = ConcurrentHashMap<String, Boolean>()
    private val local = ConcurrentHashMap<String, Boolean>()

    override fun isEnabled(flag: FeatureFlag): Boolean {
        remote[flag.key]?.let { return it }
        local[flag.key]?.let { return it }
        return flag.defaultEnabled
    }

    override fun observe(flag: FeatureFlag): Flow<Boolean> =
        keyValueStore.observe(PreferenceKeys.flagKey(flag.key)).map { stored ->
            remote[flag.key]
                ?: when (stored) {
                    "1" -> true
                    "0" -> false
                    else -> local[flag.key] ?: flag.defaultEnabled
                }
        }

    override suspend fun setLocal(flag: FeatureFlag, enabled: Boolean) {
        local[flag.key] = enabled
        keyValueStore.set(PreferenceKeys.flagKey(flag.key), if (enabled) "1" else "0")
    }

    override suspend fun applyRemote(overrides: Map<String, Boolean>) {
        remote.clear()
        remote.putAll(overrides)
    }
}
