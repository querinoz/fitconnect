package com.fitconnect.android.sports.sync

/**
 * Shared sync metadata for sports-domain entities — offline, versioning,
 * conflict resolution, import/export, future cloud sync.
 */
enum class SyncState {
    CLEAN,
    PENDING_PUSH,
    PENDING_PULL,
    CONFLICT,
    TOMBSTONE,
}

data class EntityMeta(
    val id: String,
    val version: Long,
    val updatedAtEpochMs: Long,
    val syncState: SyncState = SyncState.CLEAN,
    val etag: String? = null,
)

interface VersionedEntity {
    val meta: EntityMeta
}

data class ConflictRecord(
    val entityId: String,
    val localVersion: Long,
    val remoteVersion: Long,
    val strategy: ConflictStrategy,
)

enum class ConflictStrategy {
    LAST_WRITE_WINS,
    PREFER_LOCAL,
    PREFER_REMOTE,
    MANUAL,
}

interface SportsSyncPort {
    suspend fun enqueue(entity: VersionedEntity)
    suspend fun flush(): Int
    suspend fun resolve(conflict: ConflictRecord): EntityMeta
}

/** In-memory sync ledger for local/offline engines. */
class InMemorySportsSyncPort : SportsSyncPort {
    private val pending = mutableListOf<VersionedEntity>()
    private val conflicts = mutableListOf<ConflictRecord>()

    override suspend fun enqueue(entity: VersionedEntity) {
        pending += entity.copyMeta(SyncState.PENDING_PUSH)
    }

    override suspend fun flush(): Int {
        val n = pending.size
        pending.clear()
        return n
    }

    override suspend fun resolve(conflict: ConflictRecord): EntityMeta {
        conflicts += conflict
        return EntityMeta(
            id = conflict.entityId,
            version = maxOf(conflict.localVersion, conflict.remoteVersion) + 1,
            updatedAtEpochMs = System.currentTimeMillis(),
            syncState = SyncState.CLEAN,
        )
    }

    fun pendingCount(): Int = pending.size

    private fun VersionedEntity.copyMeta(state: SyncState): VersionedEntity =
        object : VersionedEntity {
            override val meta: EntityMeta = this@copyMeta.meta.copy(syncState = state)
        }
}

data class ExportBundle(
    val format: String,
    val payloadJson: String,
    val exportedAtEpochMs: Long = System.currentTimeMillis(),
)

interface SportsImportExport {
    fun exportRegistrySnapshot(json: String): ExportBundle
    fun importRegistrySnapshot(bundle: ExportBundle): Result<String>
}

class JsonSportsImportExport : SportsImportExport {
    override fun exportRegistrySnapshot(json: String): ExportBundle =
        ExportBundle(format = "fitconnect.sports.v1+json", payloadJson = json)

    override fun importRegistrySnapshot(bundle: ExportBundle): Result<String> {
        if (!bundle.format.startsWith("fitconnect.sports")) {
            return Result.failure(IllegalArgumentException("Unsupported format ${bundle.format}"))
        }
        return Result.success(bundle.payloadJson)
    }
}
