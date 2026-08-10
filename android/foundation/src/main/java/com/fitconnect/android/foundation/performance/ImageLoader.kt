package com.fitconnect.android.foundation.performance

/**
 * Image loading port. Coil (or equivalent) plugs in behind this interface in
 * a later phase — features must not construct their own image clients.
 */
interface ImageLoader {
    suspend fun prefetch(url: String)
    fun clearMemoryCache()
}

class NoOpImageLoader : ImageLoader {
    override suspend fun prefetch(url: String) = Unit
    override fun clearMemoryCache() = Unit
}
