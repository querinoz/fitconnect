package com.fitconnect.android.foundation.support

import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.storage.SecureStore

class InMemorySecureStore : SecureStore {
    private val map = linkedMapOf<String, String>()

    override suspend fun get(key: String): AppResult<String?> = AppResult.Ok(map[key])

    override suspend fun set(key: String, value: String): AppResult<Unit> {
        map[key] = value
        return AppResult.Ok(Unit)
    }

    override suspend fun remove(key: String): AppResult<Unit> {
        map.remove(key)
        return AppResult.Ok(Unit)
    }

    override suspend fun clear(): AppResult<Unit> {
        map.clear()
        return AppResult.Ok(Unit)
    }
}
