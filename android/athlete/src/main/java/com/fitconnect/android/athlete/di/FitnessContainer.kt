package com.fitconnect.android.athlete.di

import android.content.Context
import com.fitconnect.android.fitness.domain.FitnessSyncPage
import com.fitconnect.android.fitness.healthconnect.AndroidHealthConnectPermissionGateway
import com.fitconnect.android.fitness.healthconnect.ExerciseSessionWriter
import com.fitconnect.android.fitness.healthconnect.HealthConnectExerciseSessionReader
import com.fitconnect.android.fitness.healthconnect.HealthConnectExerciseSessionWriter
import com.fitconnect.android.fitness.healthconnect.HealthConnectPermissionGateway
import com.fitconnect.android.fitness.healthconnect.HealthConnectSource
import com.fitconnect.android.fitness.healthconnect.HealthConnectWritePrefs
import com.fitconnect.android.fitness.healthconnect.InMemoryChangeTokenStore
import com.fitconnect.android.fitness.store.InMemoryWorkoutSessionStore
import com.fitconnect.android.fitness.store.WorkoutSessionStore
import com.fitconnect.android.foundation.storage.KeyValueStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

interface FitnessContainer {
    val workoutStore: WorkoutSessionStore
    val healthConnect: HealthConnectSource
    val healthConnectPermissions: HealthConnectPermissionGateway
    val healthConnectWrite: ExerciseSessionWriter
    val healthConnectWritePrefs: HealthConnectWritePrefs
    suspend fun syncHealthConnect(): FitnessSyncPage
}

class DefaultFitnessContainer(
    context: Context,
    private val userId: () -> String,
    keyValueStore: KeyValueStore,
) : FitnessContainer {
    private val appContext = context.applicationContext

    override val workoutStore: WorkoutSessionStore = InMemoryWorkoutSessionStore()
    override val healthConnectPermissions: HealthConnectPermissionGateway =
        AndroidHealthConnectPermissionGateway(appContext)

    override val healthConnect: HealthConnectSource = HealthConnectSource(
        store = workoutStore,
        tokens = InMemoryChangeTokenStore(),
        reader = HealthConnectExerciseSessionReader(
            context = appContext,
            userId = userId,
            permissionGateway = healthConnectPermissions,
        ),
        sdkState = { com.fitconnect.android.fitness.healthconnect.HealthConnectSdkMapper.probe(appContext) },
    )

    override val healthConnectWrite: ExerciseSessionWriter =
        HealthConnectExerciseSessionWriter(
            context = appContext,
            permissionGateway = healthConnectPermissions,
        )

    override val healthConnectWritePrefs: HealthConnectWritePrefs =
        HealthConnectWritePrefs(keyValueStore)

    override suspend fun syncHealthConnect(): FitnessSyncPage =
        withContext(Dispatchers.IO) { healthConnect.syncSince(null) }
}
