package com.fitconnect.android.foundation.storage

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

object PreferenceKeys {
    val LOCALE = stringPreferencesKey("locale")
    val THEME = stringPreferencesKey("theme")
    val ONBOARDING_DONE = stringPreferencesKey("onboarding_done")
    val ONBOARDING_ATHLETE_STEP = stringPreferencesKey("onboarding_athlete_step")
    val ONBOARDING_ATHLETE_SPORT = stringPreferencesKey("onboarding_athlete_sport")
    val ONBOARDING_ATHLETE_GOAL = stringPreferencesKey("onboarding_athlete_goal")
    val ONBOARDING_COACH_DONE = stringPreferencesKey("onboarding_coach_done")
    val ONBOARDING_COACH_STEP = stringPreferencesKey("onboarding_coach_step")

    fun flagKey(flag: String) = stringPreferencesKey("flag.$flag")
}

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "fitconnect_prefs")

/** Non-sensitive preferences (locale, flags). */
interface KeyValueStore {
    fun observe(key: Preferences.Key<String>): Flow<String?>
    suspend fun get(key: Preferences.Key<String>): String?
    suspend fun set(key: Preferences.Key<String>, value: String): AppResult<Unit>
    suspend fun remove(key: Preferences.Key<String>): AppResult<Unit>
}

/** Sensitive values only — tokens, session material. Never log contents. */
interface SecureStore {
    suspend fun get(key: String): AppResult<String?>
    suspend fun set(key: String, value: String): AppResult<Unit>
    suspend fun remove(key: String): AppResult<Unit>
    suspend fun clear(): AppResult<Unit>
}

class DataStoreKeyValueStore(
    private val context: Context,
) : KeyValueStore {
    override fun observe(key: Preferences.Key<String>): Flow<String?> =
        context.dataStore.data.map { it[key] }

    override suspend fun get(key: Preferences.Key<String>): String? =
        context.dataStore.data.first()[key]

    override suspend fun set(key: Preferences.Key<String>, value: String): AppResult<Unit> =
        runStorage { context.dataStore.edit { it[key] = value } }

    override suspend fun remove(key: Preferences.Key<String>): AppResult<Unit> =
        runStorage { context.dataStore.edit { it.remove(key) } }
}

class EncryptedSecureStore(
    context: Context,
) : SecureStore {
    private val prefs = EncryptedSharedPreferences.create(
        context,
        "fitconnect_secure",
        MasterKey.Builder(context).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build(),
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
    )

    override suspend fun get(key: String): AppResult<String?> =
        runStorage { prefs.getString(key, null) }

    override suspend fun set(key: String, value: String): AppResult<Unit> =
        runStorage {
            prefs.edit().putString(key, value).apply()
        }

    override suspend fun remove(key: String): AppResult<Unit> =
        runStorage {
            prefs.edit().remove(key).apply()
        }

    override suspend fun clear(): AppResult<Unit> =
        runStorage {
            prefs.edit().clear().apply()
        }
}

private inline fun <T> runStorage(block: () -> T): AppResult<T> =
    try {
        AppResult.Ok(block())
    } catch (t: Throwable) {
        AppResult.Err(AppError.Storage(t.message ?: "storage failure", t))
    }
